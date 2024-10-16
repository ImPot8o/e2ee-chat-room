// server.js

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const winston = require('winston');
const { format } = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const DOMPurify = require('dompurify')(new (require('jsdom')).JSDOM().window);

// ------------------- Input Validation -------------------
// function getSanitizedUsername(rawUsername) {
//     // Previous version (not as good)
// }

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const enableLogging = false; // Set to true to enable message logging

// ------------------- Logging Setup -------------------
const logFormat = format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(({ timestamp, level, message }) => {
        return `[${timestamp}] ${message}`;
    })
);

const messageLogger = enableLogging
    ? winston.createLogger({
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
      })
    : null;

const consoleLogger = enableLogging
    ? winston.createLogger({
          level: 'info',
          format: logFormat,
          transports: [new winston.transports.Console()],
      })
    : null;

// ------------------- Serve Static Files -------------------
app.use(express.static(path.join(__dirname, '../client/build')));

// Fallback handler for React Router
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// ------------------- Real Names List -------------------
const realNames = [
    // **English Female Names**
    'Alice', 'Amanda', 'Andrea', 'Angela', 'Annabelle', 'Ashley', 'Avery', 'Barbara', 'Beatrice', 'Bella', 'Bianca', 'Blake', 'Bonnie',
    'Caitlin', 'Cameron', 'Candace', 'Cara', 'Caroline', 'Cassandra', 'Catherine', 'Charlotte', 'Chloe', 'Claire', 'Clara', 'Cora', 'Courtney', 'Crystal',
    'Daisy', 'Danielle', 'Daphne', 'Darlene', 'Deborah', 'Denise', 'Diana', 'Diane', 'Doris', 'Dorothy',
    'Eleanor', 'Elizabeth', 'Ella', 'Eloise', 'Emily', 'Emma', 'Erin', 'Eva', 'Evelyn',
    'Fiona', 'Frances', 'Gabrielle', 'Giselle', 'Grace', 'Hailey', 'Hannah', 'Harper', 'Holly',
    'Isabella', 'Isla', 'Ivy', 'Jackie', 'Jasmine', 'Jessica', 'Joanna', 'Jocelyn', 'Jordan', 'Josephine', 'Julia', 'June',
    'Kaitlyn', 'Karen', 'Katherine', 'Kayla', 'Kelsey', 'Kimberly', 'Kylie', 'Lauren', 'Leah', 'Lucy', 'Luna', 'Lydia', 'Lila', 'Lillian', 'Lorelei', 'Louise', 'Lucia',
    'Madeline', 'Madison', 'Maggie', 'Maria', 'Marina', 'Martha', 'Mary', 'Megan', 'Melanie', 'Melissa', 'Mia', 'Michelle', 'Mila', 'Miranda', 'Morgan',
    'Natalie', 'Nina', 'Noelle', 'Nora', 'Olivia', 'Ophelia', 'Paige', 'Pamela', 'Patricia', 'Penelope', 'Phoebe', 'Piper', 'Rachel', 'Rebecca', 'Riley', 'Rose', 'Ruby', 'Sadie', 'Samantha', 'Sara', 'Sarah', 'Savannah', 'Scarlett', 'Sophie', 'Stella', 'Summer', 'Sydney', 'Taylor', 'Tracy', 'Vanessa', 'Victoria', 'Vivian', 'Wendy', 'Willow', 'Zoey',

    // **English Male Names**
    'Aaron', 'Abel', 'Adam', 'Adrian', 'Aidan', 'Alan', 'Albert', 'Alexander', 'Alfred', 'Andrew', 'Anthony', 'Arthur', 'Austin',
    'Barrett', 'Benjamin', 'Blake', 'Brandon', 'Brian', 'Bruce', 'Bryan', 'Caleb', 'Cameron', 'Carl', 'Charles', 'Christian', 'Christopher', 'Connor', 'Daniel', 'David', 'Dennis', 'Derek', 'Dillon', 'Dominic', 'Donald', 'Douglas', 'Dylan',
    'Edward', 'Eli', 'Elijah', 'Elliott', 'Emmett', 'Eric', 'Ethan', 'Evan', 'Felix', 'Francis', 'Frank', 'Frederick',
    'Gabriel', 'Gavin', 'George', 'Grant', 'Gregory', 'Henry', 'Hudson', 'Hunter', 'Isaac', 'Isaiah', 'Ivan',
    'Jack', 'Jacob', 'James', 'Jason', 'Jeremy', 'John', 'Jonathan', 'Jordan', 'Joseph', 'Joshua', 'Julian', 'Justin',
    'Keith', 'Kevin', 'Kyle', 'Landon', 'Leo', 'Leonard', 'Louis', 'Lucas', 'Luke', 'Liam', 'Marcus', 'Mark', 'Martin', 'Matthew', 'Maxwell', 'Mason', 'Micah', 'Miles', 'Mitchell', 'Nathan', 'Nathaniel', 'Nicholas', 'Noah', 'Oliver', 'Owen',
    'Patrick', 'Paul', 'Peter', 'Philip', 'Preston', 'Quentin', 'Rafael', 'Raymond', 'Reed', 'Riley', 'Robert', 'Ryan',
    'Samuel', 'Sean', 'Sebastian', 'Seth', 'Simon', 'Spencer', 'Thomas', 'Timothy', 'Tristan', 'Victor', 'Vincent', 'William', 'Wyatt', 'Xavier', 'Zachary', 'Zane', 'Zion',

    // **Scandinavian Male and Female Names**
    'Bjorn', 'Agneta', 'Anja', 'Astrid', 'Birgitta', 'Dagny', 'Freya', 'Greta', 'Ingrid', 'Kirsten', 'Linnea', 'Sigrid', 'Sofia', 'Tove', 'Ulrika', 'Ylva',
    'Anders', 'Arvid', 'Erik', 'Gunnar', 'Hans', 'Johan', 'Lars', 'Magnus', 'Nils', 'Oskar', 'Rune', 'Sven', 'Thor', 'Viggo',

    // **Slavic Male and Female Names**
    'Anastasia', 'Daria', 'Ekaterina', 'Irina', 'Ludmila', 'Mila', 'Natalia', 'Olga', 'Svetlana', 'Tatiana', 'Vera', 'Yelena', 'Zoya',
    'Boris', 'Dmitry', 'Igor', 'Ivan', 'Maxim', 'Nikolai', 'Oleg', 'Pavel', 'Sergei', 'Vladimir', 'Yuri', 'Zdenko',

    // **Spanish Male and Female Names**
    'Alejandra', 'Ana', 'Blanca', 'Carmen', 'Catalina', 'Dolores', 'Elena', 'Esperanza', 'Isabel', 'Juana', 'Lola', 'Lucia', 'María', 'Paloma', 'Sofía', 'Teresa', 
    'Alonso', 'Carlos', 'Diego', 'Emilio', 'Felipe', 'Francisco', 'Javier', 'José', 'Luis', 'Manuel', 'Pedro', 'Raul', 'Salvador', 'Santiago', 'Vicente',

    // **African Male and Female Names**
    'Abeni', 'Amara', 'Ayodele', 'Chiamaka', 'Ebele', 'Imani', 'Kamaria', 'Makena', 'Nia', 'Thandiwe', 'Zola', 
    'Abioye', 'Chike', 'Dayo', 'Ekwueme', 'Jabari', 'Kwame', 'Malik', 'Ndidi', 'Obi', 'Tariq', 'Zuberi',

    // **East Asian Male and Female Names**
    'Aiko', 'Akiko', 'Hana', 'Haruka', 'Keiko', 'Mei', 'Nari', 'Sakura', 'Suki', 'Yumi', 'Yuki',
    'Akira', 'Daichi', 'Hiroshi', 'Kenji', 'Kota', 'Ryota', 'Sho', 'Sora', 'Tadashi', 'Yamato',

    // **Indian Male and Female Names**
    'Aarti', 'Amrita', 'Anjali', 'Deepika', 'Indira', 'Lakshmi', 'Meera', 'Pooja', 'Radha', 'Saanvi', 'Tara',
    'Ajay', 'Arjun', 'Dev', 'Karan', 'Manoj', 'Rahul', 'Raj', 'Ravi', 'Sanjay', 'Vikram', 'Yash',

    // **Arabic Male and Female Names**
    'Amina', 'Asma', 'Fatima', 'Layla', 'Mariam', 'Nadia', 'Noor', 'Salma', 'Yasmin', 'Zainab',
    'Abdullah', 'Ali', 'Fahad', 'Hassan', 'Ibrahim', 'Khalid', 'Mahmoud', 'Omar', 'Tariq', 'Yusuf',

    // **French Male and Female Names**
    'Adele', 'Amelie', 'Camille', 'Claudine', 'Elodie', 'Juliette', 'Margot', 'Nathalie', 'Sabine', 'Simone',
    'Antoine', 'Benoit', 'Etienne', 'Francois', 'Jean', 'Louis', 'Marcel', 'Nicolas', 'Pierre', 'Thierry',

    // Additional names...
];


// ------------------- Input Validation -------------------
// Function to validate and sanitize the room name
function getSanitizedRoomName(rawRoom) {
    // Define a regex pattern for allowed characters (alphanumeric, hyphens, underscores, max length 30)
    const pattern = /^[a-zA-Z0-9_-]{1,30}$/;
    if (pattern.test(rawRoom)) {
        // Sanitize the room name using DOMPurify
        return DOMPurify.sanitize(rawRoom);
    } else {
        return 'default'; // Fallback to 'default' if validation fails
    }
}

// Function to validate and sanitize the username
function getSanitizedUsername(rawUsername) {
    // Define a regex pattern for the overall format (name-timestamp)
    const pattern = /^[a-zA-Z]+-\d{6}$/;

    if (pattern.test(rawUsername)) {
        // Split the username into name and timestamp
        const [name, timestamp] = rawUsername.split('-');

        // Check if the name is in the realNames list
        if (realNames.includes(name)) {
            // Check if the timestamp is a 6-digit number
            if (/^\d{6}$/.test(timestamp)) {
                // Sanitize the username using DOMPurify
                return DOMPurify.sanitize(rawUsername);
            }
        }
    }

    // Fallback to a generated username if validation fails
    return generateUsername();
}

// ------------------- Username Generation -------------------
function generateUsername() {
    const randomIndex = Math.floor(Math.random() * realNames.length);
    const selectedName = realNames[randomIndex];

    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const timestamp = `${day}${hour}${minute}`;
    return `${selectedName}-${timestamp}`;
}

// ------------------- Rate Limiting Setup -------------------
const MESSAGE_RATE_LIMIT = 5; // Max messages allowed
const MESSAGE_RATE_DURATION = 5 * 1000; // Duration in milliseconds (10 seconds)

// ------------------- Active Usernames Tracking -------------------
const activeUsernamesByRoom = new Map(); // Maps room name to a Set of usernames

// Function to update and emit active usernames in a room
function updateActiveUsernamesInRoom(room) {
    const usernamesInRoom = activeUsernamesByRoom.get(room) || new Set();
    io.to(room).emit('active users', Array.from(usernamesInRoom));
}

// ------------------- Socket.io Connection Handling -------------------
io.on('connection', (socket) => {
    const rawRoom = socket.handshake.query.room || 'default';
    const room = getSanitizedRoomName(rawRoom);
    socket.join(room);

    // Assign and emit a generated username to the client
    const generatedUsername = generateUsername();
    const sanitizedUsername = getSanitizedUsername(generatedUsername);
    socket.username = sanitizedUsername;
    socket.emit('user id', sanitizedUsername);

    // Add the username to the room's active usernames set
    if (!activeUsernamesByRoom.has(room)) {
        activeUsernamesByRoom.set(room, new Set());
    }
    activeUsernamesByRoom.get(room).add(socket.username);

    // Notify others in the room
    socket.to(room).emit('chat message', {
        userId: 'Server',
        message: `${socket.username} has joined the chat.`,
    });

    // Update active users in the room
    updateActiveUsernamesInRoom(room);

    // Rate limiting data structure
    socket.messageTimes = [];

    // Handle 'set username' event from the client
    socket.on('set username', (desiredUsername) => {
        const sanitizedUsername = getSanitizedUsername(desiredUsername);

        // Prevent reserved usernames
        if (sanitizedUsername.toLowerCase() === 'server') {
            socket.username = generateUsername();
        } else {
            // Remove the old username from the room's set
            activeUsernamesByRoom.get(room).delete(socket.username);
            // Assign the sanitized username
            socket.username = sanitizedUsername;
        }

        // Add the new username to the room's set
        activeUsernamesByRoom.get(room).add(socket.username);

        socket.emit('username set', socket.username);

        if (enableLogging) {
            consoleLogger.info(`${socket.username} connected to room ${room}`);
        }

        // Notify others in the room
        socket.to(room).emit('chat message', {
            userId: 'Server',
            message: `${socket.username} has joined the chat.`,
        });

        // Update active users in the room
        updateActiveUsernamesInRoom(room);
    });

    // Handle incoming chat messages
    socket.on('chat message', (msg) => {
        if (!socket.username) {
            // If username is not set, ignore the message
            return;
        }

        // Rate limiting
        const currentTime = Date.now();
        socket.messageTimes = socket.messageTimes.filter(
            (time) => currentTime - time < MESSAGE_RATE_DURATION
        );
        if (socket.messageTimes.length >= MESSAGE_RATE_LIMIT) {
            // Exceeded rate limit
            socket.emit(
                'error message',
                'You are sending messages too quickly.'
            );
            return;
        }
        socket.messageTimes.push(currentTime);

        if (enableLogging) {
            messageLogger.info(`${room} - ${socket.username}: ${msg}`);
        }

        // Broadcast the message to the room
        io.to(room).emit('chat message', {
            userId: socket.username,
            message: msg,
        });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        if (socket.username) {
            // Remove the username from the room's set
            if (activeUsernamesByRoom.has(room)) {
                activeUsernamesByRoom.get(room).delete(socket.username);

                if (activeUsernamesByRoom.get(room).size === 0) {
                    activeUsernamesByRoom.delete(room);
                }
            }

            if (enableLogging) {
                consoleLogger.info(`${socket.username} disconnected`);
            }

            // Notify others in the room
            socket.to(room).emit('chat message', {
                userId: 'Server',
                message: `${socket.username} has left the chat.`,
            });

            // Update active users in the room
            updateActiveUsernamesInRoom(room);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    if (enableLogging) {
        consoleLogger.info(`Server is running on port ${PORT}`);
    } else {
        console.log(`Server is running on port ${PORT}`);
    }
});