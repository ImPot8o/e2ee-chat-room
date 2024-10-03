import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import CryptoJS from 'crypto-js';

const socket = io({
    query: { room: window.location.pathname.slice(1) }
});

const generateRandomKey = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const length = 64; // You can adjust the length of the random key
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
    const [encryptionKey, setEncryptionKey] = useState('secret-key'); // Default key
    const [keyInput, setKeyInput] = useState('');

    useEffect(() => {
        setRoom(window.location.pathname.slice(1));

        socket.on('chat message', (msg) => {
            try {
                const decryptedMsg = CryptoJS.AES.decrypt(msg, encryptionKey).toString(CryptoJS.enc.Utf8);
                if (decryptedMsg) {
                    setMessages((prevMessages) => [...prevMessages, decryptedMsg]);
                } else {
                    setMessages((prevMessages) => [...prevMessages, '**[Encrypted Message - Incorrect Key]**']);
                }
            } catch (error) {
                setMessages((prevMessages) => [...prevMessages, '**[Encrypted Message - Incorrect Key]**']);
            }
        });

        return () => {
            socket.off('chat message');
        };
    }, [encryptionKey]);

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
        <div>
            <h1>Chat Room: {room}</h1>
            <div>
                {messages.map((msg, index) => (
                    <div key={index}>{msg}</div>
                ))}
            </div>
            <form onSubmit={sendMessage}>
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                />
                <button type="submit">Send</button>
            </form>
            <div>
                <input
                    type="text"
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                    placeholder="Enter encryption key..."
                />
                <button onClick={setCustomKey}>Set Key</button>
                <button onClick={setRandomKey}>Use Random Key</button>
            </div>
        </div>
    );
};

export default App;