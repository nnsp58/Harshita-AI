const io = require('socket.io-client');
const socket = io('http://localhost:3001');

socket.on('connect', () => {
    console.log('✅ Connected to Harshita AI Server for Live Test');

    // 1. Simulate an Automation Task Update
    console.log('🚀 Triggering Task: SSC GD Form Fill...');
    socket.emit('taskUpdate', {
        name: 'SSC GD Form Fill (Operator 1)',
        status: 'Filling Educational Details...',
        progress: 45
    });

    // 2. Simulate a Proactive AI Suggestion
    setTimeout(() => {
        console.log('🧠 Triggering AI Suggestion: PAN Card Correction...');
        socket.emit('supervisorUpdate', 'Amit Kumar का PAN Card सुधारने की ज़रुरत है, आधार डेटा से मैच नहीं हो रहा।');
    }, 3000);

    // 3. Simulate a WhatsApp Sentinel Alert
    setTimeout(() => {
        console.log('📡 Triggering Sentinel Alert: SSC Site Slow...');
        socket.emit('whatsapp_sentinel_alert', {
            source: 'CSC Expert Group',
            message: '⚠️ SSC की साइट अभी बहुत स्लो चल रही है, फॉर्म रात 10 बजे के बाद भरें।'
        });
    }, 6000);

    // 4. Simulate an Admin Broadcast
    setTimeout(() => {
        console.log('📢 Triggering Admin Broadcast...');
        socket.emit('broadcastReceived', 'सभी ऑपरेटर ध्यान दें: अगले 1 घंटे Ayushman Card पोर्टल पर फोकस करें!');
    }, 9000);

    // End test after 15 seconds
    setTimeout(() => {
        console.log('🏁 Live Test Completed.');
        process.exit(0);
    }, 15000);
});

socket.on('connect_error', (err) => {
    console.error('❌ Connection failed. Is the server running on port 3001?', err.message);
    process.exit(1);
});
