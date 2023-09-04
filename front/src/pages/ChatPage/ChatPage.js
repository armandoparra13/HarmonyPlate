import React, { useEffect, useState, useRef } from 'react';
import './ChatPage.css';
import { useAuth } from '../../contexts/Auth';
import axios from 'axios';
import io from 'socket.io-client';
import ChatBar from './ChatBar';
import ChatBody from './ChatBody';
import ChatFooter from './ChatFooter';
import Chat from './Chat';

const socket = io.connect('http://localhost:3000');

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [typingStatus, setTypingStatus] = useState('');
  const lastMessageRef = useRef(null);
  const [userData, setUserData] = useState(null);
  const { currentUser } = useAuth();
  const [isUserSelected, setIsUserSelected] = useState(false);
  const [messageList, setMessageList] = useState([]);
  const [favoriteFoodImage, setFavoriteFoodImage] = useState(null);
  const [favoriteFood, setFavoriteFood] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [room, setRoom] = useState('');

  const chooseMatch = (selectedMatch) => {
    setSelectedMatch(selectedMatch);

    setIsUserSelected(true);
  };

  const assignRoom = (roomID) => {
    console.log(roomID);
    socket.emit('join_room', roomID);
    setRoom(roomID);
    console.log(room);
  };

  const printChat = (messageList) => {
    setMessageList(messageList);
  };

  useEffect(() => {
    // Function to fetch user data
    const fetchUserData = async () => {
      try {
        const response = await axios.get('/auth/getUserProfile', {
          headers: {
            authorization: currentUser.accessToken,
          },
        });
        console.log(currentUser);
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
    // 👇️ scroll to bottom every time messages change
    lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  console.log(messageList);

  console.log(userData);

  return (
    <div className="chat">
      <ChatBar
        socket={socket}
        userData={userData}
        chooseMatch={chooseMatch}
        assignRoom={assignRoom}
      />
      <div className="chat__main">
        {isUserSelected ? ( // Only render when a user is selected
          <>
            <ChatFooter
              socket={socket}
              userData={userData}
              selectedMatch={selectedMatch}
              printChat={printChat}
              messageList={messageList}
              uniqueRoom={assignRoom}
            />
          </>
        ) : (
          <p>Select a user to start a chat</p>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
