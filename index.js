import { Server } from 'socket.io';

const io = new Server(9000, {
    cors: {
        origin: 'http://localhost:3000',
    }, 
});

let users = [];

// Add user if not already in the list
const addUser = (userData, socketId) => {
    if (!users.some(user => user.sub === userData.sub)) {
        users.push({ ...userData, socketId });
    }
};

// Remove user by socketId
const removeUser = (socketId) => {
    users = users.filter(user => user.socketId !== socketId);
};

// Get user by sub ID
const getUser = (userId) => {
    return users.find(user => user.sub === userId);
};

// Socket.IO events
io.on('connection', (socket) => {
    console.log('✅ User connected:', socket.id);

    // When a user joins
    socket.on("addUser", (userData) => {
        addUser(userData, socket.id);
        io.emit("getUsers", users); // Send updated user list to all clients
    });

    // Sending a message
    socket.on('sendMessage', (data) => {
        const user = getUser(data.receiverId);
        if (user) {
            io.to(user.socketId).emit('getMessage', data);
        } else {
            console.warn(`⚠️ User with ID ${data.receiverId} not found`);
        }
    });

    // When a user disconnects
    socket.on('disconnect', () => {
        console.log('❌ User disconnected:', socket.id);
        removeUser(socket.id);
        io.emit('getUsers', users);
    });
});
