// App.js

import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import CryptoJS from 'crypto-js';
import Cookies from 'js-cookie'; // Import js-cookie for cookie management
import './App.css';
import '@fortawesome/fontawesome-free/css/all.min.css'; // Import Font Awesome for icons
import DOMPurify from 'dompurify';

// Initialize Socket.io with the room from the URL path
const socket = io({
    query: { room: window.location.pathname.slice(1) }
});

// Function to generate a random 64-character passphrase
const generateRandomPassphrase = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const length = 64;
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};

// Function to derive a 256-bit encryption key using PBKDF2 with the username as salt
const deriveKey = (passphrase, salt) => {
    return CryptoJS.PBKDF2(passphrase, salt, {
        keySize: 256 / 32, // 256-bit key
        iterations: 1000,
    }).toString();
};

const App = () => {
    // State variables
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [room, setRoom] = useState('');
    const [encryptionKey, setEncryptionKey] = useState(null); // Derived encryption key
    const [keyInput, setKeyInput] = useState('');
    const [showSettings, setShowSettings] = useState(false);
    const [userId, setUserId] = useState(''); // User's unique identifier
    const [loadingUsername, setLoadingUsername] = useState(true); // Indicates if username is being set
    const [passphraseError, setPassphraseError] = useState(''); // Error message for passphrase
    const messagesEndRef = useRef(null);
    const settingsRef = useRef(null);

    // Handle incoming events and setup usernames
    useEffect(() => {
        setRoom(window.location.pathname.slice(1)); // Set the current room based on URL path

        // Listen for incoming chat messages
        socket.on('chat message', (msg) => {
            try {
                if (!encryptionKey) {
                    // Cannot decrypt without encryption key
                    setMessages((prevMessages) => [...prevMessages, { userId: msg.userId, message: '**[Encrypted Message - No Key Set]**' }]);
                    return;
                }
                // Decrypt the received message using the encryption key
                const decryptedBytes = CryptoJS.AES.decrypt(msg.message, encryptionKey);
                const decryptedMsg = decryptedBytes.toString(CryptoJS.enc.Utf8);
                if (decryptedMsg) {
                    setMessages((prevMessages) => [...prevMessages, { userId: msg.userId, message: decryptedMsg }]);
                } else {
                    setMessages((prevMessages) => [...prevMessages, { userId: msg.userId, message: '**[Encrypted Message - Incorrect Key]**' }]);
                }
            } catch (error) {
                setMessages((prevMessages) => [...prevMessages, { userId: msg.userId, message: '**[Encrypted Message - Decryption Error]**' }]);
            }
        });

        // Listen for 'user id' event from the server
        socket.on('user id', (id) => {
            const storedUsername = Cookies.get('username');
            if (!storedUsername) {
                // If no username is stored, set the received id as username
                setUserId(id);
                Cookies.set('username', id, { expires: 365 }); // Store username in cookies for 1 year
                // Notify the server that the username has been set
                socket.emit('set username', id);
            }
            setLoadingUsername(false);
        });

        // Listen for 'username set' confirmation from the server
        socket.on('username set', (username) => {
            setUserId(username);
            Cookies.set('username', username, { expires: 365 }); // Update cookie in case of conflict resolution
            setLoadingUsername(false);
        });

        // Cleanup event listeners on component unmount
        return () => {
            socket.off('chat message');
            socket.off('user id');
            socket.off('username set');
        };
    }, [encryptionKey]);

    // Scroll to the latest message when messages update
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Handle clicks outside the settings popup to close it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (settingsRef.current && !settingsRef.current.contains(event.target)) {
                setShowSettings(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // On component mount, check if a username exists in cookies and set it
    useEffect(() => {
        const storedUsername = Cookies.get('username');
        if (storedUsername) {
            setUserId(storedUsername);
            socket.emit('set username', storedUsername);
            setLoadingUsername(false);
        }
    }, []);

    // Function to send a message
    const sendMessage = (e) => {
        e.preventDefault();
        if (input.trim() && encryptionKey) {
            // Encrypt the message before sending using derived key
            const encryptedMsg = CryptoJS.AES.encrypt(input, encryptionKey).toString();
            socket.emit('chat message', encryptedMsg);
            // Append the sent message to the local message list
            setMessages((prevMessages) => [...prevMessages, { userId: 'You', message: input }]);
            setInput('');
        }
    };

    // Function to set a custom encryption key via passphrase
    const setCustomKey = () => {
        if (keyInput.trim() && userId) {
            try {
                // Derive a 256-bit key using PBKDF2 with the username as salt
                const derivedKey = deriveKey(keyInput.trim(), userId);
                setEncryptionKey(derivedKey);
                setPassphraseError('');
            } catch (error) {
                setPassphraseError('Failed to derive encryption key.');
            }
        } else {
            setPassphraseError('Passphrase cannot be empty.');
        }
    };

    // Function to set a random encryption key (passphrase)
    const setRandomKey = () => {
        if (userId) {
            const randomPassphrase = generateRandomPassphrase(); // 64-character random passphrase
            const derivedKey = deriveKey(randomPassphrase, userId);
            setEncryptionKey(derivedKey);
            setKeyInput(randomPassphrase); // Display the passphrase to the user
            setPassphraseError('');
        }
    };

    return (
        <div className="app">
            <header>
                <h1>Chat Room: {room}</h1>
                <h2>Your Username: {loadingUsername ? 'Setting up...' : userId}</h2>
            </header>
            <div className="messages-container">
                <div className="messages">
                    {messages.map((msg, index) => (
                        <div key={index} className={`message ${msg.userId === 'You' ? 'own-message' : ''}`}>
                            <strong>{msg.userId}:</strong> {msg.message}
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>
            <div className="input-container">
                {!loadingUsername && (
                    <div className="settings-container" ref={settingsRef}>
                        <button className="settings-button" onClick={() => setShowSettings(!showSettings)}>
                            <i className="fas fa-cog"></i>
                        </button>
                        {showSettings && (
                            <div className="settings-popup">
                                <h3>Encryption Settings</h3>
                                <input
                                    type="password"
                                    value={keyInput}
                                    onChange={(e) => setKeyInput(e.target.value)}
                                    placeholder="Enter passphrase..."
                                />
                                <button onClick={setCustomKey}>Set Passphrase</button>
                                <button onClick={setRandomKey}>Use Random Passphrase</button>
                                {passphraseError && <p className="error">{passphraseError}</p>}
                            </div>
                        )}
                    </div>
                )}
                <form onSubmit={sendMessage}>
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={encryptionKey ? "Type a message..." : "Set an encryption key to send messages"}
                        autoComplete="off"
                        disabled={!encryptionKey || loadingUsername}
                    />
                    <button type="submit" disabled={!encryptionKey || loadingUsername || !input.trim()}>Send</button>
                </form>
            </div>
        </div>
    );
};

export default App;