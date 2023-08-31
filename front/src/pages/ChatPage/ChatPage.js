import React, { useEffect, useState, useRef } from 'react';
import './ChatPage.css';
import axios from 'axios';
import ChatBar from './ChatBar';
import ChatBody from './ChatBody';
import ChatFooter from './ChatFooter';

const ChatPage = ({ socket }) => {
  const [messages, setMessages] = useState([]);
  const [typingStatus, setTypingStatus] = useState('');
  const lastMessageRef = useRef(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loadingUserData, setLoadingUserData] = useState(true);

  useEffect(() => {
    // Fetch the access token for the current user
    const fetchAccessToken = async () => {
      try {
        const response = await axios.get('/auth/token');
        setCurrentUser({ accessToken: response.data.accessToken });
      } catch (error) {
        console.error('Error fetching access token:', error);
      }
    };

    fetchAccessToken();
  }, []);

  useEffect(() => {
    if (currentUser && currentUser.accessToken) {
      // Fetch user data including matches using the access token
      const fetchUserData = async () => {
        try {
          const response = await axios.get('/auth/fetch-user-data', {
            headers: {
              Authorization: `Bearer ${currentUser.accessToken}`,
            },
          });
          setUserData(response.data);
        } catch (error) {
          console.error('Error fetching user data:', error);
        } finally {
          setLoadingUserData(false);
        }
      };

      fetchUserData();
    }
  }, [currentUser]);

  useEffect(() => {
    socket.on('messageResponse', (data) => setMessages([...messages, data]));
  }, [socket, messages]);

  useEffect(() => {
    lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    socket.on('typingResponse', (data) => setTypingStatus(data));
  }, [socket]);

  console.log(currentUser);

  return (
    <div className="chat">
      <ChatBar socket={socket} currentUser={currentUser} userData={userData} />
      <div className="chat__main">
        <ChatBody
          messages={messages}
          typingStatus={typingStatus}
          lastMessageRef={lastMessageRef}
        />
        <ChatFooter socket={socket} currentUser={currentUser} />
      </div>
    </div>
  );
};

export default ChatPage;
