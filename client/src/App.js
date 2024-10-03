import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import CryptoJS from 'crypto-js';
import './App.css';

const socket = io({
query: { room: window.location.pathname.slice(1) }
});

const generateRandomKey = () => {
const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const length = 64;
let result = '';
for (let i = 0; i < length; i++) {
result += characters.charAt(Math.floor(Math.random() * characters.length));
}
return result;
};

const App = () => {
const [messages, setMessages] = useState([]);
const [input, setInput] = useState('');
const [room, setRoom] = useState('');
const [encryptionKey, setEncryptionKey] = useState('secret-key');
const [keyInput, setKeyInput] = useState('');
const [showSettings, setShowSettings] = useState(false);
const [userId, setUserId] = useState('');
const messagesEndRef = useRef(null);
const settingsRef = useRef(null);


useEffect(() => {
    setRoom(window.location.pathname.slice(1));

    socket.on('chat message', (msg) => {
        try {
            const decryptedMsg = CryptoJS.AES.decrypt(msg.message, encryptionKey).toString(CryptoJS.enc.Utf8);
            if (decryptedMsg) {
                setMessages((prevMessages) => [...prevMessages, { userId: msg.userId, message: decryptedMsg }]);
            } else {
                setMessages((prevMessages) => [...prevMessages, { userId: msg.userId, message: '**[Encrypted Message - Incorrect Key]**' }]);
            }
        } catch (error) {
            setMessages((prevMessages) => [...prevMessages, { userId: msg.userId, message: '**[Encrypted Message - Incorrect Key]**' }]);
        }
    });

    socket.on('user id', (id) => {
        setUserId(id);
    });

    return () => {
        socket.off('chat message');
        socket.off('user id');
    };
}, [encryptionKey]);

useEffect(() => {
    messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
}, [messages]);

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

const sendMessage = (e) => {
    e.preventDefault();
    if (input.trim()) {
        const encryptedMsg = CryptoJS.AES.encrypt(input, encryptionKey).toString();
        socket.emit('chat message', encryptedMsg);
        setInput('');
    }
};

const setCustomKey = () => {
    if (keyInput.trim()) {
        setEncryptionKey(keyInput.trim());
    }
};

const setRandomKey = () => {
    const randomKey = generateRandomKey();
    setEncryptionKey(randomKey);
    setKeyInput(randomKey);
};

return (
    <div className="app">
        <h1>Chat Room: {room}</h1>
        <div className="messages-container">
            <div className="messages">
                {messages.map((msg, index) => (
                    <div key={index}>
                        <strong>{msg.userId}:</strong> {msg.message}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
        </div>
        <div className="input-container">
            <div className="settings-container" ref={settingsRef}>
                <button className="settings-button" onClick={() => setShowSettings(!showSettings)}>
                    <i className="fas fa-cog"></i>
                </button>
                {showSettings && (
                    <div className="settings-popup">
                        <input
                            type="text"
                            value={keyInput}
                            onChange={(e) => setKeyInput(e.target.value)}
                            placeholder="Enter encryption key..."
                        />
                        <button onClick={setCustomKey}>Set Key</button>
                        <button onClick={setRandomKey}>Use Random Key</button>
                    </div>
                )}
            </div>
            <form onSubmit={sendMessage}>
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                />
                <button type="submit">Send</button>
            </form>
        </div>
    </div>
);
};

export default App;