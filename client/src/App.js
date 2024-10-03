import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import CryptoJS from 'crypto-js';

const socket = io({
    query: { room: window.location.pathname.slice(1) }
});

const App = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [room, setRoom] = useState('');

    useEffect(() => {
        setRoom(window.location.pathname.slice(1));

        socket.on('chat message', (msg) => {
            const decryptedMsg = CryptoJS.AES.decrypt(msg, 'secret-key').toString(CryptoJS.enc.Utf8);
            setMessages((prevMessages) => [...prevMessages, decryptedMsg]);
        });

        return () => {
            socket.off('chat message');
        };
    }, []);

    const sendMessage = (e) => {
        e.preventDefault();
        if (input.trim()) {
            const encryptedMsg = CryptoJS.AES.encrypt(input, 'secret-key').toString();
            socket.emit('chat message', encryptedMsg);
            setInput('');
        }
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
        </div>
    );
};

export default App;