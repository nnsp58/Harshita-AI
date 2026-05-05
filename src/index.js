require('dotenv').config();

const args = process.argv.slice(2);
const mode = args[0];

if (mode === 'workflow') {
  startWorkflow();
} else {
  startChatInterface();
}

async function startWorkflow() {
  console.log("🚀 n-dizi CSC Automation Tool Starting (Workflow Mode)...");
  
  const { ControllerAgent } = require('./agents/controllerAgent');
  const { DocumentAIAgent } = require('./agents/documentAIAgent');
  const { ValidatorAgent } = require('./agents/validatorAgent');
  const { NotifierAgent } = require('./agents/notifierAgent');
  const { FileProcessorAgent } = require('./agents/fileProcessorAgent');

  const controller = new ControllerAgent();
  const docAI = new DocumentAIAgent();
  const validator = new ValidatorAgent();
  const notifier = new NotifierAgent();
  const fileProcessor = new FileProcessorAgent();

  console.log("🤖 All agents initialized successfully!");

   try {
     console.log("\n📄 Processing user documents...");
     const userId = 'user_001';
     const documentPaths = {
       aadhaar_front: './uploads/aadhaar_front.jpg',
       aadhaar_back: './uploads/aadhaar_back.jpg',
       photo: './uploads/photo.jpg',
       resume: './uploads/resume.pdf'
     };

     const docResult = await docAI.processUserDocuments(userId, documentPaths);
     console.log("✅ Documents processed:", docResult.mergedData);

    console.log("\n🗂️ Processing user files...");
    const fileResult = await fileProcessor.processUserFiles(userId, documentPaths);
    console.log("✅ Files processed:", fileResult.processedFiles);

    console.log("\n✅ Validating user data...");
    const validation = validator.validateUserData(docResult.mergedData);
    console.log("Validation result:", validation.summary);

    if (!validation.isValid) {
      await notifier.sendNotification('validation_error',
        `Validation failed for user ${userId}`,
        { errors: validation.errors, warnings: validation.warnings }
      );
    }

    console.log("\n📝 Adding task to queue...");
    const taskId = await controller.addTask(userId, {
      formUrl: 'https://example.com/form',
      userData: docResult.mergedData,
      priority: 1
    });

    console.log(`✅ Task added with ID: ${taskId}`);

    const stats = await controller.getQueueStats();
    console.log("📊 Queue stats:", stats);

    await notifier.sendNotification('task_completed',
      `User ${userId} data processed and queued successfully`,
      { taskId, userId, validation: validation.summary }
    );

  } catch (error) {
    console.error("❌ Error in workflow:", error);
    await notifier.sendNotification('system_error',
      `System error: ${error.message}`,
      { error: error.stack }
    );
  }

  console.log("\n🎉 Workflow completed successfully!");
  process.exit(0);
}

function startChatInterface() {
  console.log('🚀 Starting n-dizi CSC Automation System (Chat Mode)...');
  const { ChatInterface } = require('./chatInterface');
  const chat = new ChatInterface();
  chat.start();
}

process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  process.exit(0);
});