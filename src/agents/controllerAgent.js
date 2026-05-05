const { Queue, Worker } = require('bullmq');
const IORedis = require('ioredis');
const { registry } = require('../bot/siteRegistry');
const { StatefulBotRunner } = require('../bot/statefulBotRunner');

let connection = null;
let taskQueue = null;
const redisEnabled = process.env.REDIS_ENABLED !== 'false';

if (redisEnabled) {
try {
  connection = new IORedis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || '',
    maxRetriesPerRequest: 1,
    lazyConnect: true,
    retryStrategy: () => null
  });
  connection.on('error', () => {});
  connection.on('close', () => {});
  
  taskQueue = new Queue('csc-tasks', { connection });
} catch (e) {
  console.log('⚠️ Redis not configured');
}
}

// Controller Agent Class
class ControllerAgent {
  constructor(io = null) {
    this.tasks = new Map();
    this.redisAvailable = false;
    this.io = io;
    this.statefulRunner = null;
    if (io) {
      this.statefulRunner = new StatefulBotRunner(this, io);
    }
    this.initRedis();
  }

  async initRedis() {
    if (!redisEnabled || !connection) {
      console.warn('Redis disabled, running in memory-only mode');
      this.redisAvailable = false;
      return;
    }

    try {
      // Test Redis connection with timeout
      await Promise.race([
        connection.ping(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000))
      ]);
      this.redisAvailable = true;
      console.log('🔴 Redis connected successfully');
      this.initializeWorker();
    } catch (error) {
      console.warn('⚠️ Redis not available, running in memory-only mode');
      this.redisAvailable = false;
    }
  }

  // Add a new task
  async addTask(userId, taskData) {
    const taskId = `task_${userId}_${Date.now()}`;

    // Build task record with all fields
    const taskRecord = {
      id: taskId,
      userId,
      status: 'pending',
      createdAt: new Date(),
      serviceType: taskData.serviceType || null,
      formUrl: taskData.formUrl || null,
      userData: taskData.userData || {},
      otp: taskData.otp || null,
      autoSubmit: taskData.autoSubmit !== false,
      keepOpen: taskData.keepOpen || false,
      priority: taskData.priority || 0,
      jobId: taskData.jobId || null // From DB job record
    };

    this.tasks.set(taskId, taskRecord);

    if (this.redisAvailable && this.worker) {
      // Push to Redis queue
      try {
        const job = await taskQueue.add('process-form', {
          taskId,
          userId,
          serviceType: taskRecord.serviceType,
          formUrl: taskRecord.formUrl,
          userData: taskRecord.userData,
          otp: taskRecord.otp,
          autoSubmit: taskRecord.autoSubmit,
          keepOpen: taskRecord.keepOpen
        }, {
          priority: taskRecord.priority,
          removeOnComplete: 10,
          removeOnFail: 5
        });

        taskRecord.jobId = job.id;
        taskRecord.status = 'queued';
        
        this.emitTaskEvent(taskId, 'task_queued', { taskId, jobId: job.id });
      } catch (error) {
        console.error(`Failed to enqueue task ${taskId}:`, error);
        this.redisAvailable = false;
        setTimeout(() => this.processTaskInMemory(taskId), 1000);
      }
    } else {
      // Memory-only mode: start processing directly
      setTimeout(() => this.processTaskInMemory(taskId), 100);
    }

    console.log(`📝 Task added: ${taskId} for user ${userId} (${taskRecord.serviceType})`);
    return taskId;
  }

  // Get task status
  getTaskStatus(taskId) {
    return this.tasks.get(taskId) || null;
  }

  // Get all tasks for a user
  getUserTasks(userId) {
    return Array.from(this.tasks.values()).filter(task => task.userId === userId);
  }

  // Get bot instance for service type
  getBot(serviceType) {
    return registry.getBot(serviceType);
  }

  // Get stateful bot runner (for pause/resume from API)
  getRunner() {
    return this.statefulRunner;
  }

  // Resume a paused job
  async resumeJob(jobId, resumeData) {
    return await this.statefulRunner.resumeJob(jobId, resumeData);
  }

  // Get job state
  getJobState(jobId) {
    return this.statefulRunner.getJobState(jobId);
  }

  // Generate ZIP for completed job
  async generateJobZip(jobId) {
    return await this.statefulRunner.generateJobZip(jobId);
  }

  // Emit event via WebSocket
  emitTaskEvent(taskId, event, data) {
    const task = this.tasks.get(taskId);
    if (task && task.userId) {
      this.io.to(`user_${task.userId}`).emit(event, data);
    }
  }

  // Emit event to user via WebSocket
  emitTaskEvent(taskId, event, data) {
    const task = this.tasks.get(taskId);
    if (task && task.userId) {
      this.io.to(`user_${task.userId}`).emit(event, data);
    }
  }

  // Process task with site-specific bot
  async processWithBot(task) {
    const { serviceType, userData, otp, keepOpen } = task;
    
    if (!serviceType) {
      throw new Error('serviceType is required for bot processing');
    }

    if (!registry.hasService(serviceType)) {
      throw new Error(`Unsupported service type: ${serviceType}`);
    }

    const bot = registry.getBot(serviceType);
    
    const options = {
      otp,
      autoSubmit: task.autoSubmit !== false,
      keepOpen: keepOpen || false
    };

    return await bot.run(userData, options);
  }

  // Process task in memory mode using StatefulBotRunner
  async processTaskInMemory(taskId) {
    const task = this.tasks.get(taskId);
    if (!task) return;

    task.status = 'running';
    console.log(`🚀 Processing task: ${taskId} via StatefulBotRunner`);

    try {
      // Use stateful runner if available, otherwise legacy
      if (this.statefulRunner && task.serviceType) {
        const job = {
          jobId: taskId,
          userId: task.userId,
          candidateProfile: task.userData,
          serviceType: task.serviceType,
          options: {
            otp: task.otp,
            autoSubmit: task.autoSubmit,
            keepOpen: task.keepOpen
          }
        };

        const result = await this.statefulRunner.runJob(job);
        task.result = result;
        task.status = result.status;
      } else {
        // Legacy
        const { runBrowserTask } = require('./browserAgent');
        await runBrowserTask(task.formUrl, task.userData);
        task.status = 'completed';
      }

      console.log(`✅ Task ${taskId} finished: ${task.status}`);

    } catch (error) {
      task.status = 'failed';
      task.error = error.message;
      console.error(`❌ Task failed: ${taskId}`, error);
    }
  }

  // Initialize worker to process tasks (Redis mode)
  initializeWorker() {
    const worker = new Worker('csc-tasks', async (job) => {
      const { taskId, userId, serviceType, formUrl, userData, otp, keepOpen, autoSubmit } = job.data;

      console.log(`🚀 Worker processing task: ${taskId}`);

      try {
        const taskRecord = this.tasks.get(taskId);
        if (taskRecord) taskRecord.status = 'running';

        // Use StatefulBotRunner if available and serviceType specified
        if (serviceType && this.statefulRunner) {
          const jobData = {
            jobId: taskId,
            userId,
            candidateProfile: userData,
            serviceType,
            options: { otp, autoSubmit, keepOpen }
          };
          const result = await this.statefulRunner.runJob(jobData);
          if (this.tasks.has(taskId)) {
            this.tasks.get(taskId).result = result;
            this.tasks.get(taskId).status = result.status;
          }
        } else {
          // Legacy fallback
          const { runBrowserTask } = require('./browserAgent');
          await runBrowserTask(formUrl, userData);
          if (this.tasks.has(taskId)) {
            this.tasks.get(taskId).status = 'completed';
          }
        }

      } catch (error) {
        if (this.tasks.has(taskId)) {
          this.tasks.get(taskId).status = 'failed';
          this.tasks.get(taskId).error = error.message;
        }
        console.error(`❌ Worker task ${taskId} failed:`, error);
        throw error;
      }
    }, { connection });

    worker.on('completed', (job) => {
      const taskId = job.data.taskId;
      console.log(`🎉 Task ${taskId} completed`);
      this.emitTaskEvent(taskId, 'task_completed', { taskId });
    });

    worker.on('failed', (job, err) => {
      const taskId = job.data.taskId;
      console.error(`💥 Task ${taskId} failed:`, err);
      this.emitTaskEvent(taskId, 'task_failed', { taskId, error: err.message });
    });

    this.worker = worker;
  }

  // Get queue stats
  async getQueueStats() {
    if (this.redisAvailable) {
      const waiting = await taskQueue.getWaiting();
      const active = await taskQueue.getActive();
      const completed = await taskQueue.getCompleted();
      const failed = await taskQueue.getFailed();

      return {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
        totalTasks: this.tasks.size
      };
    } else {
      // Memory mode stats
      const statuses = Array.from(this.tasks.values()).reduce((acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
      }, {});

      return {
        waiting: statuses.pending || 0,
        active: statuses.running || 0,
        completed: statuses.completed || 0,
        failed: statuses.failed || 0,
        totalTasks: this.tasks.size,
        mode: 'memory'
      };
    }
  }
}

module.exports = { ControllerAgent };
