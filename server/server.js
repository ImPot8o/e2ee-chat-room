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
function getSanitizedUsername(rawUsername) {
    // Define a regex pattern for allowed characters (alphanumeric, hyphens, underscores)
    const pattern = /^[a-zA-Z0-9_-]{1,30}$/;
    if (pattern.test(rawUsername)) {
        // Sanitize the username using DOMPurify
        return DOMPurify.sanitize(rawUsername);
    } else {
        return generateUsername(); // Fallback to a generated username if validation fails
    }
}

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
    // **Alice to Zoe** (English Names)
    'Alice', 'Amanda', 'Andrea', 'Angela', 'Annabelle', 'Ashley', 'Avery',
    'Barbara', 'Beatrice', 'Bella', 'Bianca', 'Blake', 'Bonnie',
    'Caitlin', 'Cameron', 'Candace', 'Cara', 'Caroline', 'Cassandra', 'Catherine', 'Charlotte', 'Chloe', 'Claire', 'Clara', 'Cora', 'Courtney', 'Crystal',
    'Daisy', 'Danielle', 'Daphne', 'Darlene', 'Deborah', 'Denise', 'Diana', 'Diane', 'Doris', 'Dorothy',
    'Eleanor', 'Elizabeth', 'Ella', 'Eloise', 'Emily', 'Emma', 'Erin', 'Eva', 'Evelyn',
    'Fiona', 'Frances', 'Gabrielle', 'Giselle', 'Grace', 'Hailey', 'Hannah', 'Harper', 'Holly',
    'Isabella', 'Isla', 'Ivy', 'Jackie', 'Jasmine', 'Jessica', 'Joanna', 'Jocelyn', 'Jordan', 'Josephine', 'Julia', 'June',
    'Kaitlyn', 'Karen', 'Katherine', 'Kayla', 'Kelsey', 'Kimberly', 'Kylie',
    'Lauren', 'Leah', 'Lucy', 'Luna', 'Lydia', 'Lila', 'Lillian', 'Lily', 'Lorelei', 'Louise', 'Lucia', 'Lucy', 'Luna', 'Lydia',
    'Madeline', 'Madison', 'Maggie', 'Maria', 'Marina', 'Martha', 'Mary', 'Megan', 'Melanie', 'Melissa', 'Mia', 'Michelle', 'Mila', 'Miranda', 'Morgan',
    'Natalie', 'Nina', 'Noelle', 'Nora', 'Olivia', 'Ophelia', 'Paige', 'Pamela', 'Patricia', 'Penelope', 'Phoebe', 'Piper', 'Rachel', 'Rebecca', 'Riley', 'Rose', 'Ruby', 'Sadie', 'Samantha', 'Sara', 'Sarah', 'Savannah', 'Scarlett', 'Sophie', 'Stella', 'Summer', 'Sydney', 'Taylor', 'Tracy', 'Vanessa', 'Victoria', 'Vivian', 'Wendy', 'Willow', 'Zoey',

    // **Aaron to Zane** (English Male Names)
    'Aaron', 'Abel', 'Adam', 'Adrian', 'Aidan', 'Alan', 'Albert', 'Alexander', 'Alfred', 'Andrew', 'Anthony', 'Arthur', 'Austin',
    'Barrett', 'Benjamin', 'Blake', 'Brandon', 'Brian', 'Bruce', 'Bryan', 'Caleb', 'Cameron', 'Carl', 'Charles', 'Christian', 'Christopher', 'Connor', 'Daniel', 'David', 'Dennis', 'Derek', 'Dillon', 'Dominic', 'Donald', 'Douglas', 'Dylan',
    'Edward', 'Eli', 'Elijah', 'Elliott', 'Emmett', 'Eric', 'Ethan', 'Evan',
    'Felix', 'Francis', 'Frank', 'Frederick',
    'Gabriel', 'Gavin', 'George', 'Grant', 'Gregory',
    'Henry', 'Hudson', 'Hunter',
    'Isaac', 'Isaiah', 'Ivan',
    'Jack', 'Jacob', 'James', 'Jason', 'Jeremy', 'John', 'Jonathan', 'Jordan', 'Joseph', 'Joshua', 'Julian', 'Justin',
    'Keith', 'Kevin', 'Kyle',
    'Landon', 'Leo', 'Leonard', 'Louis', 'Lucas', 'Luke', 'Liam',
    'Marcus', 'Mark', 'Martin', 'Matthew', 'Maxwell', 'Mason', 'Matthew', 'Micah', 'Miles', 'Mitchell', 'Nathan', 'Nathaniel', 'Nicholas', 'Noah', 'Oliver', 'Owen',
    'Patrick', 'Paul', 'Peter', 'Philip', 'Preston',
    'Quentin',
    'Rafael', 'Raymond', 'Reed', 'Riley', 'Robert', 'Ryan',
    'Samuel', 'Sean', 'Sebastian', 'Seth', 'Simon', 'Spencer',
    'Thomas', 'Timothy', 'Tristan',
    'Victor', 'Vincent',
    'William', 'Wyatt',
    'Xavier',
    'Zachary', 'Zane', 'Zion',

    // **Additional Names for Greater Diversity**
    // **Spanish Names**
    'Alejandro', 'Ana', 'Carlos', 'Carmen', 'Cristian', 'Daniela', 'Diego', 'Elena', 'Fernando', 'Gabriela', 'Hector', 'Isabella', 'Jose', 'Lucia', 'Marco', 'Natalia', 'Oscar', 'Paula', 'Rafael', 'Sofia',

    // **French Names**
    'Claude', 'Claire', 'Dominique', 'Emile', 'Genevieve', 'Henri', 'Isabelle', 'Julien', 'Laure', 'Marie', 'Nicolas', 'Pauline', 'René', 'Sophie', 'Thierry',

    // **German Names**
    'Anke', 'Bruno', 'Claudia', 'Dieter', 'Elke', 'Friedrich', 'Gisela', 'Heinz', 'Ingrid', 'Jürgen', 'Katrin', 'Lothar', 'Matthias', 'Uwe', 'Wolfgang',

    // **Italian Names**
    'Alessandro', 'Bianca', 'Carlo', 'Davide', 'Elisa', 'Francesco', 'Giulia', 'Luca', 'Marco', 'Nico', 'Paola', 'Silvia', 'Tommaso',

    // **Japanese Names**
    'Akira', 'Ayumi', 'Daisuke', 'Emi', 'Hiroshi', 'Kaori', 'Kenji', 'Mai', 'Naoki', 'Reiko', 'Satoshi', 'Yuki',

    // **African Names**
    'Amina', 'Chidi', 'Emeka', 'Fatima', 'Kofi', 'Lindiwe', 'Malik', 'Nia', 'Sefu', 'Tandi', 'Zuri',

    // **Nordic Names**
    'Astrid', 'Bjorn', 'Freya', 'Gunnar', 'Helga', 'Ivar', 'Kari', 'Leif', 'Nora', 'Soren', 'Tyra',

    // **Other Unique Names**
    'Aria', 'Caspian', 'Dahlia', 'Ezra', 'Finn', 'Gemma', 'Iris', 'Jasper', 'Kai', 'Luna', 'Milo', 'Nova', 'Orion', 'Piper', 'Quinn', 'River', 'Serena', 'Theo', 'Violet', 'Wyatt', 'Xander', 'Yara', 'Zane'
];

// ------------------- Username Generation -------------------
function generateUsername() {
    const randomIndex = Math.floor(Math.random() * realNames.length);
    const selectedName = realNames[randomIndex];

    const now = new Date();
    // const year = now.getFullYear();
    // const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const timestamp = `${day}${hour}${minute}`;
    return `${selectedName}-${timestamp}`;
}

// ------------------- Active Usernames Tracking -------------------
const activeUsernames = new Map(); // Maps username to number of active connections

// ------------------- Rate Limiting Setup -------------------
const MESSAGE_RATE_LIMIT = 10; // Max messages allowed
const MESSAGE_RATE_DURATION = 10 * 1000; // Duration in milliseconds (10 seconds)

// ------------------- Socket.io Connection Handling -------------------
io.on('connection', (socket) => {
    const rawRoom = socket.handshake.query.room || 'default';
    const room = getSanitizedUsername(rawRoom);
    socket.join(room);

    // Assign and emit a generated username to the client
    const generatedUsername = generateUsername();
    const sanitizedUsername = getSanitizedUsername(generatedUsername);
    socket.username = sanitizedUsername;
    socket.emit('user id', sanitizedUsername);

    // Notify others in the room
    socket.to(room).emit('chat message', {
        userId: 'Server',
        message: `${socket.username} has joined the chat.`,
    });

    // Rate limiting data structure
    socket.messageTimes = [];

    // Handle 'set username' event from the client
    socket.on('set username', (desiredUsername) => {
        const sanitizedUsername = getSanitizedUsername(desiredUsername);

        // Prevent reserved usernames
        if (sanitizedUsername.toLowerCase() === 'server') {
            socket.username = generateUsername();
            if (activeUsernames.has(socket.username)) {
                activeUsernames.set(
                    socket.username,
                    activeUsernames.get(socket.username) + 1
                );
            } else {
                activeUsernames.set(socket.username, 1);
            }
            socket.emit('username set', socket.username);

            if (enableLogging) {
                consoleLogger.info(`${socket.username} connected to room ${room}`);
            }

            // Notify others in the room
            socket.to(room).emit('chat message', {
                userId: 'Server',
                message: `${socket.username} has joined the chat.`,
            });
            return;
        }

        // Assign the sanitized username
        socket.username = sanitizedUsername;
        if (activeUsernames.has(sanitizedUsername)) {
            activeUsernames.set(
                sanitizedUsername,
                activeUsernames.get(sanitizedUsername) + 1
            );
        } else {
            activeUsernames.set(sanitizedUsername, 1);
        }
        socket.emit('username set', sanitizedUsername);

        if (enableLogging) {
            consoleLogger.info(
                `${sanitizedUsername} connected to room ${room}`
            );
        }

        // Notify others in the room
        socket.to(room).emit('chat message', {
            userId: 'Server',
            message: `${sanitizedUsername} has joined the chat.`,
        });
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
            if (activeUsernames.has(socket.username)) {
                const currentCount = activeUsernames.get(socket.username);
                if (currentCount > 1) {
                    activeUsernames.set(socket.username, currentCount - 1);
                } else {
                    activeUsernames.delete(socket.username);
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