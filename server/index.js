const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const winston = require('winston');
const { format } = require('winston');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Custom format for logging with timestamp and room name
const logFormat = format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(({ timestamp, level, message }) => {
        return `[${timestamp}] ${message}`;
    })
);

// Winston logger configuration for messages
const messageLogger = winston.createLogger({
    level: 'info',
    format: logFormat,
    transports: [
        new winston.transports.File({ filename: 'logs/messages.log' }),
    ],
});

// Winston logger configuration for console (connections and disconnections)
const consoleLogger = winston.createLogger({
    level: 'info',
    format: logFormat,
    transports: [
        new winston.transports.Console(),
    ],
});

app.use(express.static(path.join(__dirname, '../client/build')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

io.on('connection', (socket) => {
    const room = socket.handshake.query.room;
    socket.join(room);

    // Log connection with room name
    consoleLogger.info(`User connected to room ${room}`);

    socket.on('chat message', (msg) => {
        // Log the chat room and the encrypted message with timestamp
        messageLogger.info(`${room}: ${msg}`);

        io.to(room).emit('chat message', msg);
    });

    socket.on('disconnect', () => {
        // Log disconnection
        consoleLogger.info('User disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    consoleLogger.info(`Server is running on port ${PORT}`);
});