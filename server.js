require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { MasterAgent } = require('./src/core/masterAgent');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Serve the latest dashboard
const dashboardPath = path.join(__dirname, 'output', 'generated_pages', 'dashboard_ultimate_harshita_ai_enterprise_command__1778160460216.html');

app.get('/', (req, res) => {
    res.sendFile(dashboardPath);
});

// Real-time communication
io.on('connection', (socket) => {
    console.log('User connected to Command Center');

    // Initialize MasterAgent with socket for live updates
    const master = new MasterAgent({
        onStatusUpdate: (data) => socket.emit('taskUpdate', data),
        onLog: (msg) => socket.emit('logUpdate', msg),
        onSupervisorSuggestion: (suggestion) => socket.emit('supervisorUpdate', suggestion)
    });

    // Handle user commands from Chat
    socket.on('userCommand', async (cmd) => {
        console.log('Received command:', cmd);
        socket.emit('logUpdate', { type: 'user', message: cmd });
        
        try {
            const result = await master.executeTask(cmd);
            socket.emit('logUpdate', { type: 'ai', message: result });
        } catch (error) {
            socket.emit('logUpdate', { type: 'error', message: error.message });
        }
    });

    // Handle Admin Broadcasts
    socket.on('adminBroadcast', (msg) => {
        console.log('Admin Broadcast:', msg);
        io.emit('broadcastReceived', msg);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

server.listen(PORT, () => {
    console.log(`🚀 Harshita AI Live Dashboard running at http://localhost:${PORT}`);
});
