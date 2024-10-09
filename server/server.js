const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const winston = require('winston');
const { format } = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const enableLogging = false;

const logFormat = format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(({ timestamp, level, message }) => {
        return `[${timestamp}] ${message}`;
    })
);

const messageLogger = enableLogging ? winston.createLogger({
    level: 'info',
    format: logFormat,
    transports: [
        new DailyRotateFile({
            filename: 'logs/messages-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            maxSize: '10m',
            maxFiles: '14d',
        }),
    ],
}) : null;

const consoleLogger = enableLogging ? winston.createLogger({
    level: 'info',
    format: logFormat,
    transports: [
        new winston.transports.Console(),
    ],
}) : null;

app.use(express.static(path.join(__dirname, '../client/build')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

io.on('connection', (socket) => {
    const room = socket.handshake.query.room;
    socket.join(room);

    const userId = `User${Date.now()}${Math.random().toString(4).substring(2)}`;

    socket.emit('user id', userId);

    if (enableLogging) {
        consoleLogger.info(`${userId} connected to room ${room}`);
    }

    socket.on('chat message', (msg) => {
        if (enableLogging) {
            messageLogger.info(`${room} - ${userId}: ${msg}`);
        }

        io.to(room).emit('chat message', { userId, message: msg });
    });

    socket.on('disconnect', () => {
        if (enableLogging) {
            consoleLogger.info(`${userId} disconnected`);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    if (enableLogging) {
        consoleLogger.info(`Server is running on port ${PORT}`);
    }
});