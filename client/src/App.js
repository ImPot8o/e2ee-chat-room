// App.js

import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import CryptoJS from 'crypto-js';
import DOMPurify from 'dompurify'; // Import DOMPurify for sanitizing messages
import './App.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

// Function to validate and sanitize the room name
const getSanitizedRoomName = () => {
  const rawRoom = window.location.pathname.slice(1) || 'default';
  // Define a regex pattern for allowed characters (alphanumeric, hyphens, underscores)
  const pattern = /^[a-zA-Z0-9_-]{1,30}$/;
  if (pattern.test(rawRoom)) {
    return rawRoom;
  } else {
    return 'default'; // Fallback to 'default' if validation fails
  }
};

// Get the sanitized room name
const room = getSanitizedRoomName();

// Initialize Socket.io with the sanitized room
const socket = io({
  query: { room: room },
});

const generateRandomPassphrase = () => {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const length = 64;
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const deriveKey = (passphrase, salt) => {
  return CryptoJS.PBKDF2(passphrase, salt, {
    keySize: 256 / 32, // 256-bit key
    iterations: 1000,
  }).toString();
};

const App = () => {
  const defaultPassphrase = 'defaultpassphrase';
  const [encryptionKey, setEncryptionKey] = useState(() =>
    deriveKey(defaultPassphrase, room)
  ); // Derive key using room as salt
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [keyInput, setKeyInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [userId, setUserId] = useState(''); // User's unique identifier
  const [loadingUsername, setLoadingUsername] = useState(true); // Indicates if username is being set
  const [passphraseError, setPassphraseError] = useState(''); // Error message for passphrase
  const messagesEndRef = useRef(null);
  const settingsRef = useRef(null);

  useEffect(() => {
    // Listen for incoming chat messages
    socket.on('chat message', (msg) => {
      try {
        if (msg.userId === 'Server') {
          // Server messages are not encrypted
          setMessages((prevMessages) => [
            ...prevMessages,
            { userId: msg.userId, message: msg.message },
          ]);
          return;
        }
        if (msg.userId === userId || msg.userId === 'You') {
          // Ignore own messages
          return;
        }
        if (!encryptionKey) {
          // Cannot decrypt without encryption key
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              userId: msg.userId,
              message: '**[Encrypted Message - No Key Set]**',
            },
          ]);
          return;
        }
        // Decrypt the received message using the encryption key
        const decryptedBytes = CryptoJS.AES.decrypt(
          msg.message,
          encryptionKey
        );
        const decryptedMsg = decryptedBytes.toString(CryptoJS.enc.Utf8);
        if (decryptedMsg) {
          // Sanitize the decrypted message
          const sanitizedMessage = DOMPurify.sanitize(decryptedMsg);
          setMessages((prevMessages) => [
            ...prevMessages,
            { userId: msg.userId, message: sanitizedMessage },
          ]);
        } else {
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              userId: msg.userId,
              message: '**[Encrypted Message - Incorrect Key]**',
            },
          ]);
        }
      } catch (error) {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            userId: msg.userId,
            message: '**[Encrypted Message - Decryption Error]**',
          },
        ]);
      }
    });

    // Listen for 'user id' event from the server
    socket.on('user id', (id) => {
      const storedUsername = sessionStorage.getItem('username');
      if (!storedUsername) {
        // If no username is stored, set the received id as username
        setUserId(id);
        sessionStorage.setItem('username', id);
        // Notify the server that the username has been set
        socket.emit('set username', id);
      } else {
        // Use the stored username
        setUserId(storedUsername);
        // Notify the server of the stored username
        socket.emit('set username', storedUsername);
      }
      setLoadingUsername(false);
    });

    // Listen for 'username set' confirmation from the server
    socket.on('username set', (username) => {
      setUserId(username);
      sessionStorage.setItem('username', username);
      setLoadingUsername(false);
    });

    // Cleanup event listeners on component unmount
    return () => {
      socket.off('chat message');
      socket.off('user id');
      socket.off('username set');
    };
  }, [encryptionKey, userId]);

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

  // On component mount, check if a username exists in sessionStorage and set it
  useEffect(() => {
    const storedUsername = sessionStorage.getItem('username');
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
      setMessages((prevMessages) => [
        ...prevMessages,
        { userId: 'You', message: DOMPurify.sanitize(input) },
      ]);
      setInput('');
    }
  };

  // Function to set a custom encryption key via passphrase
  const setCustomKey = () => {
    if (keyInput.trim() && room) {
      try {
        // Derive a 256-bit key using PBKDF2 with the room as salt
        const derivedKey = deriveKey(keyInput.trim(), room);
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
    if (room) {
      const randomPassphrase = generateRandomPassphrase(); // 64-character random passphrase
      const derivedKey = deriveKey(randomPassphrase, room);
      setEncryptionKey(derivedKey);
      setKeyInput(randomPassphrase); // Display the passphrase to the user
      setPassphraseError('');
    }
  };

  return (
    <div className="app">
      <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>
      <header>
        <h1>Chat Room: {DOMPurify.sanitize(room)}</h1>
        <h2>Your Username: {loadingUsername ? 'Setting up...' : userId}</h2>
      </header>
      <div className="messages-container">
        <div className="messages">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.userId === 'You' ? 'own-message' : ''}`}
              dangerouslySetInnerHTML={{
                __html: `<strong>${DOMPurify.sanitize(
                  msg.userId
                )}:</strong> ${msg.message}`,
              }}
            ></div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="input-container">
        {!loadingUsername && (
          <div className="settings-container" ref={settingsRef}>
            <button
              className="settings-button"
              onClick={() => setShowSettings(!showSettings)}
            >
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
            placeholder="Type a message..."
            autoComplete="off"
            disabled={loadingUsername}
          />
          <button
            type="submit"
            disabled={loadingUsername || !input.trim()}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default App;