import React, { useEffect, useState, useRef } from 'react';
import './ChatPage.css';
import { useAuth } from '../../contexts/Auth';
import axios from 'axios';
import ChatBar from './ChatBar';
import ChatBody from './ChatBody';
import ChatFooter from './ChatFooter';

const ChatPage = ({ socket }) => {
  const [messages, setMessages] = useState([]);
  const [typingStatus, setTypingStatus] = useState('');
  const lastMessageRef = useRef(null);
  const [userData, setUserData] = useState(null);
  const { currentUser } = useAuth();
  const [favoriteFoodImage, setFavoriteFoodImage] = useState(null);
  const [favoriteFood, setFavoriteFood] = useState(null);

  useEffect(() => {
    // Function to fetch user data
    const fetchUserData = async () => {
      try {
        const response = await axios.get('/auth/getUserProfile', {
          headers: {
            authorization: currentUser.accessToken,
          },
        });

        setUserData(response.data);
        console.log(userData);
        favoriteFood(response.data.food.favoriteFood);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    const favoriteFood = async (foodId) => {
      fetch(`/auth/recipe/${foodId}`)
        .then((response) => {
          return response.json();
        })
        .then((food) => {
          console.log("Match's favourite food:", food);
          setFavoriteFood(food.title);
        })
        .catch((error) => {
          console.error('Error fetching favorite food:', error);
        });
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    socket.on('messageResponse', (data) => setMessages([...messages, data]));
  }, [socket, messages]);

  useEffect(() => {
    socket.on('typingResponse', (data) => setTypingStatus(data));
  }, [socket]);

  useEffect(() => {
    // 👇️ scroll to bottom every time messages change
    lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  console.log(currentUser);

  return (
    <div className="chat">
      <ChatBar socket={socket} userData={userData} />
      <div className="chat__main">
        <ChatBody
          messages={messages}
          typingStatus={typingStatus}
          lastMessageRef={lastMessageRef}
          favouriteFood={favoriteFood}
        />
        <ChatFooter socket={socket} currentUser={currentUser} />
      </div>
    </div>
  );
};

export default ChatPage;
