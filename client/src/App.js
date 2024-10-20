// App.js

import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import DOMPurify from 'dompurify';
import Cookies from 'js-cookie';
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
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:",.<>?/~`';
  const length = 64;
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Derive an AES-GCM key using PBKDF2 with increased iterations
async function deriveKey(passphrase, salt) {
  const encoder = new TextEncoder();
  const passphraseKey = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode(salt),
      iterations: 600000, // Increased iteration count
      hash: 'SHA-256',
    },
    passphraseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// Encrypt a message using AES-GCM
async function encryptMessage(message, key) {
  const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit nonce for GCM
  const encoder = new TextEncoder();
  const data = encoder.encode(message);

  const cipherBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    data
  );

  // Combine IV and ciphertext
  const combined = new Uint8Array(iv.length + cipherBuffer.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(cipherBuffer), iv.length);

  // Encode as Base64 for transmission
  return btoa(String.fromCharCode(...combined));
}

// Decrypt a message using AES-GCM
async function decryptMessage(encryptedMessage, key) {
  try {
    // Decode Base64
    const combined = Uint8Array.from(
      atob(encryptedMessage),
      (c) => c.charCodeAt(0)
    );

    // Extract IV and ciphertext
    const iv = combined.slice(0, 12); // First 12 bytes for IV
    const ciphertext = combined.slice(12);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      ciphertext
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
}

const App = () => {
  const defaultPassphrase = 'defaultpassphrase';
  const [encryptionKey, setEncryptionKey] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [keyInput, setKeyInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [userId, setUserId] = useState(''); // User's unique identifier
  const [loadingUsername, setLoadingUsername] = useState(true); // Indicates if username is being set
  const [passphraseError, setPassphraseError] = useState(''); // Error message for passphrase
  const messagesEndRef = useRef(null);
  const settingsRef = useRef(null);
  const [activeUsers, setActiveUsers] = useState([]);
  const [showActiveUsers, setShowActiveUsers] = useState(false);
  const activeUsersRef = useRef(null);

  // Timer for page refresh
  const [refreshTimer, setRefreshTimer] = useState(null);

  useEffect(() => {
    const resetTimer = () => {
      // Clear the existing timer if it exists
      if (refreshTimer) clearTimeout(refreshTimer);
      
      // Set a new timer to refresh the page after 5 minutes
      const timer = setTimeout(() => {
        window.location.reload();
      }, 300000); // 300000 milliseconds = 5 minutes

      setRefreshTimer(timer);
    };

    // Reset timer on any keyboard activity
    const handleKeyDown = () => {
      resetTimer();
    };

    // Add event listener for keydown
    window.addEventListener('keydown', handleKeyDown);

    // Initial timer setup
    resetTimer();

    // Cleanup function to remove event listener and clear timeout
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (refreshTimer) clearTimeout(refreshTimer);
    };
  }, [refreshTimer]); // Re-run effect if refreshTimer changes

  // Derive the default encryption key on component mount
  useEffect(() => {
    const deriveDefaultKey = async () => {
      const key = await deriveKey(defaultPassphrase, room);
      setEncryptionKey(key);
    };
    deriveDefaultKey();
  }, []);

  useEffect(() => {
    // Listen for incoming chat messages
    socket.on('chat message', async (msg) => {
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
        const decryptedMsg = await decryptMessage(msg.message, encryptionKey);
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
              message: '**[Encrypted Message - Decryption Failed]**',
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
      const storedUsername = localStorage.getItem('username');
      if (!storedUsername) {
        // If no username is stored, set the received id as username
        setUserId(id);
        localStorage.setItem('username', id);
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
      localStorage.setItem('username', username);
      setLoadingUsername(false);
    });

    // Listen for 'active users' event from the server
    socket.on('active users', (usernames) => {
      setActiveUsers(usernames);
      // Store the list in cookies under the same name to override per room
      Cookies.set('activeUsers', JSON.stringify(usernames), { expires: 1 });
    });

    // Cleanup event listeners on component unmount
    return () => {
      socket.off('chat message');
      socket.off('user id');
      socket.off('username set');
      socket.off('active users');
    };
  }, [encryptionKey, userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle clicks outside the settings and active users popups
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        settingsRef.current &&
        !settingsRef.current.contains(event.target) &&
        event.target.className !== 'settings-button' &&
        event.target.className !== 'fas fa-cog'
      ) {
        setShowSettings(false);
      }

      if (
        activeUsersRef.current &&
        !activeUsersRef.current.contains(event.target) &&
        event.target.className !== 'active-users-button' &&
        event.target.className !== 'fas fa-users' &&
        event.target.className !== 'active-users-button-footer'
      ) {
        setShowActiveUsers(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Listen for changes in localStorage to synchronize username across tabs
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === 'username') {
        const newUsername = event.newValue;
        if (newUsername) {
          setUserId(newUsername);
          socket.emit('set username', newUsername);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Retrieve active users from cookies on component mount
  useEffect(() => {
    const storedActiveUsers = Cookies.get('activeUsers');
    if (storedActiveUsers) {
      setActiveUsers(JSON.parse(storedActiveUsers));
    }
  }, [room]); // Update when the room changes

  // On component mount, check if a username exists in localStorage and set it
  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUserId(storedUsername);
      socket.emit('set username', storedUsername);
      setLoadingUsername(false);
    }
  }, []);

  // Function to send a message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() && encryptionKey) {
      try {
        // Encrypt the message before sending using derived key
        const encryptedMsg = await encryptMessage(input, encryptionKey);
        socket.emit('chat message', encryptedMsg);
        // Append the sent message to the local message list
        setMessages((prevMessages) => [
          ...prevMessages,
          { userId: 'You', message: DOMPurify.sanitize(input) },
        ]);
        setInput('');
      } catch (error) {
        console.error('Encryption error:', error);
        // Handle encryption error
      }
    }
  };

  // Function to set a custom encryption key via passphrase
  const setCustomKey = async () => {
    if (keyInput.trim() && room) {
      try {
        // Derive a 256-bit key using PBKDF2 with the room as salt
        const derivedKey = await deriveKey(keyInput.trim(), room);
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
  const setRandomKey = async () => {
    if (room) {
      const randomPassphrase = generateRandomPassphrase(); // 64-character random passphrase
      const derivedKey = await deriveKey(randomPassphrase, room);
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
        <h5>
          Each URL subdirectory (chat.pot8o.dev/subdirectory) automatically creates a
          unique chat room
        </h5>
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
        {!loadingUsername && (
          <div className="active-users-container" ref={activeUsersRef}>
            {/* <button
              className="active-users-button"
              onClick={() => setShowActiveUsers(!showActiveUsers)}
            >
              <i className="fas fa-users"></i>
            </button> */}
            {showActiveUsers && (
              <div className="active-users-popup">
                <h3>Active Users in Room</h3>
                <ul>
                  {activeUsers.map((username, index) => (
                    <li key={index}>{DOMPurify.sanitize(username)}</li>
                  ))}
                </ul>
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
          <button type="submit" disabled={loadingUsername || !input.trim()}>
            Send
          </button>
        </form>
      </div>
<footer>
  <a
    href="https://github.com/ImPot8o/e2e-chat-room"
    className="github-link"
    target="_blank"
    rel="noopener noreferrer"
  >
    <img
      src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
      alt="GitHub"
      className="github-icon"
    />
  </a>
  
  {/* Add the disclaimer in the center */}
  <p className="footer-disclaimer">
    This is a research preview and is not intended for legitimate use. <a href="#">Learn more</a>
  </p>

  {/* Active Users button */}
  <button
    className="active-users-button-footer"
    onClick={() => setShowActiveUsers(!showActiveUsers)}
  >
    <i className="fas fa-users"></i>
  </button>
</footer>
    </div>
  );
};

export default App;
