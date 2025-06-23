import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Chat.css';
import Navbar from './Navbar';
import io from 'socket.io-client';

function Chat() {
  const [connections, setConnections] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  
  // Initialize socket connection
  useEffect(() => {
    const token = localStorage.getItem('token');
    const newSocket = io('http://localhost:4567', {
      query: { token }
    });
    
    newSocket.on('connect', () => {
      console.log('Connected to socket server');
    });
    
    newSocket.on('message', (message) => {
      if (selectedUser && message.senderId === selectedUser.id) {
        setMessages(prevMessages => [...prevMessages, message]);
      }
    });
    
    newSocket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });
    
    setSocket(newSocket);
    
    return () => {
      newSocket.disconnect();
    };
  }, [selectedUser]);
  
  // Fetch connections
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    fetch('http://localhost:4567/connections', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          console.error(data.error);
        } else {
          setConnections(data);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setLoading(false);
      });
  }, []);
  
  // Fetch messages when a user is selected
  useEffect(() => {
    if (selectedUser) {
      const token = localStorage.getItem('token');
      
      fetch(`http://localhost:4567/messages/${selectedUser.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      })
        .then(response => response.json())
        .then(data => {
          if (data.error) {
            console.error(data.error);
          } else {
            setMessages(data);
          }
        })
        .catch(error => {
          console.error('Error:', error);
        });
    }
  }, [selectedUser]);
  
  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  const selectUser = (user) => {
    setSelectedUser(user);
  };
  
  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedUser) return;
    
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    const messageData = {
      content: newMessage,
      receiverId: selectedUser.id
    };
    
    fetch('http://localhost:4567/send-message', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(messageData),
      credentials: 'include'
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          console.error(data.error);
        } else {
          const sentMessage = {
            id: data.id,
            content: newMessage,
            senderId: parseInt(userId),
            receiverId: selectedUser.id,
            timestamp: new Date().toISOString()
          };
          
          setMessages([...messages, sentMessage]);
          setNewMessage('');
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };
  
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const viewProfile = (userId) => {
    navigate(`/user/${userId}`);
  };
  
  return (
    <div className="chat-page">
      <Navbar />
      
      <div className="chat-container">
        <div className="chat-sidebar">
          <h2>Conversations</h2>
          
          {loading ? (
            <div className="loading">Loading conversations...</div>
          ) : connections.length > 0 ? (
            <div className="connection-list">
              {connections.map(user => (
                <div 
                  key={user.id} 
                  className={`connection-item ${selectedUser && selectedUser.id === user.id ? 'active' : ''}`}
                  onClick={() => selectUser(user)}
                >
                  <div className="connection-avatar">
                    <img 
                      src={user.profilePicture || '/default-profile.png'} 
                      alt={`${user.firstName} ${user.lastName}`} 
                    />
                    {user.isOnline && <span className="online-indicator"></span>}
                  </div>
                  <div className="connection-info">
                    <h3>{user.firstName} {user.lastName}</h3>
                    <p className="last-message">{user.lastMessage || 'Start a conversation'}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-connections">No connections yet. Match with someone to start chatting!</p>
          )}
        </div>
        
        <div className="chat-main">
          {selectedUser ? (
            <>
              <div className="chat-header">
                <div className="chat-user-info">
                  <h2>{selectedUser.firstName} {selectedUser.lastName}</h2>
                  {selectedUser.isOnline ? (
                    <span className="online-status">Online</span>
                  ) : (
                    <span className="offline-status">
                      Last seen: {selectedUser.lastSeen ? formatTime(selectedUser.lastSeen) : 'Unknown'}
                    </span>
                  )}
                </div>
                <button 
                  className="view-profile-button" 
                  onClick={() => viewProfile(selectedUser.id)}
                >
                  View Profile
                </button>
              </div>
              
              <div className="chat-messages">
                {messages.length > 0 ? (
                  messages.map(message => {
                    const isSentByMe = message.senderId === parseInt(localStorage.getItem('userId'));
                    
                    return (
                      <div 
                        key={message.id} 
                        className={`message ${isSentByMe ? 'sent' : 'received'}`}
                      >
                        <div className="message-content">
                          <p>{message.content}</p>
                          <span className="message-time">{formatTime(message.timestamp)}</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="no-messages">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              
              <form className="chat-input" onSubmit={handleSendMessage}>
                <input 
                  type="text" 
                  placeholder="Type a message..." 
                  value={newMessage} 
                  onChange={(e) => setNewMessage(e.target.value)} 
                />
                <button type="submit">Send</button>
              </form>
            </>
          ) : (
            <div className="no-chat-selected">
              <p>Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Chat;