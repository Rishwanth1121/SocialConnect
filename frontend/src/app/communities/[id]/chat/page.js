'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import './page.css';

export default function CommunityChatPage() {
  const { id } = useParams();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('');
  const socketRef = useRef(null);

  // Fetch logged-in user info
  useEffect(() => {
    fetch('http://localhost:8000/api/user/', {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => setUsername(data.username))
      .catch(err => console.error('Failed to fetch user', err));
  }, []);

  // Load old messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/communities/${id}/messages/`, {
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to fetch messages');
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };

    fetchMessages();
  }, [id]);

  // WebSocket connection
  useEffect(() => {
    socketRef.current = new WebSocket(`ws://localhost:8000/ws/chat/${id}/`);

    socketRef.current.onmessage = (e) => {
      const data = JSON.parse(e.data);
      setMessages(prev => [...prev, data]);
    };

    socketRef.current.onclose = () => {
      console.log('WebSocket disconnected');
    };

    return () => {
      socketRef.current.close();
    };
  }, [id]);

  // Send message
  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim() === '' || !username) return;

    socketRef.current.send(JSON.stringify({
      message: message.trim(),
      username,
    }));

    setMessage('');
  };

  return (
    <div className="chat-container">
      <h2>Community Chat</h2>

      <div className="messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message-container ${msg.sender === username ? 'own-message' : 'other-message'}`}
          >
            <div className="message-bubble">
              <strong>{msg.sender}:</strong> {msg.message}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} className="chat-form">
        <input
          type="text"
          placeholder="Enter message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
