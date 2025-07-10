'use client'
import './page.css'
import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'

export default function PrivateChatPage() {
  const params = useParams()
  const friend_id = params.friend_id
  const [messages, setMessages] = useState([])
  const [message, setMessage] = useState('')
  const [currentUser, setCurrentUser] = useState({ id: null, username: '' })
  const [isLoading, setIsLoading] = useState(true)
  const socketRef = useRef(null)
  const messagesEndRef = useRef(null)

  // Fetch current user data and messages
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch current user
        const userRes = await fetch('http://localhost:8000/api/user/', {
          credentials: 'include',
        })
        const userData = await userRes.json()
        setCurrentUser({
          id: userData.id,
          username: userData.username
        })

        // Fetch previous messages
        const messagesRes = await fetch(
          `http://localhost:8000/api/private/${friend_id}/messages/`,
          { credentials: 'include' }
        )
        const messagesData = await messagesRes.json()
        
        // Transform messages to consistent format
        const formattedMessages = messagesData.map(msg => ({
          ...msg,
          sender_id: msg.sender_id || msg.sender?.id,
          sender_name: msg.sender_name || msg.sender
        }))
        
        setMessages(formattedMessages)
      } catch (err) {
        console.error('Fetch error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [friend_id])

  useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
}, [messages])

  // WebSocket setup
  useEffect(() => {
    if (!currentUser.id) return

    const socket = new WebSocket(`ws://localhost:8000/ws/private-chat/${friend_id}/`)
    socketRef.current = socket

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        // Ensure consistent message format
        const formattedMessage = {
          ...data,
          sender_id: data.sender_id || currentUser.id,
          sender_name: data.sender_name || data.sender
        }
        setMessages(prev => [...prev, formattedMessage])
      } catch (err) {
        console.error('WebSocket message parse error:', err)
      }
    }

    return () => socket.close()
  }, [friend_id, currentUser.id])

  const sendMessage = () => {
    if (!message.trim() || !socketRef.current) return
    if (socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ content: message }))
      setMessage('')
    }
  }

  if (isLoading) return <div className="loading">Loading chat...</div>

  return (
    <div className="chat-container">
      <h2>Chat with {messages[0]?.receiver_name || `User #${friend_id}`}</h2>

      <div className="messages">
        {messages.map((msg, idx) => {
          const isSentByMe = msg.sender_id === currentUser.id
          return (
            <div key={idx} className={`message ${isSentByMe ? '' : 'received'}`}>
              <div className="message-bubble">
                <strong>{isSentByMe ? 'You' : msg.sender_name}</strong>
                <div className="message-content">{msg.content}</div>
              </div>
            </div>
          )
        })}
       <div ref={messagesEndRef} />
    </div>

      <div className="chat-input">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  )
}