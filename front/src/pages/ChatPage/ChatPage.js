import React, { useEffect, useState, useRef } from 'react';
import './ChatPage.css';
<<<<<<< HEAD
=======
import { useAuth } from '../../contexts/Auth';
>>>>>>> 92229ae (display matches and chat suggestions)
import axios from 'axios';
import ChatBar from './ChatBar';
import ChatBody from './ChatBody';
import ChatFooter from './ChatFooter';

const ChatPage = ({ socket }) => {
  const [messages, setMessages] = useState([]);
  const [typingStatus, setTypingStatus] = useState('');
  const lastMessageRef = useRef(null);
<<<<<<< HEAD
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
=======
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
>>>>>>> 92229ae (display matches and chat suggestions)
    socket.on('messageResponse', (data) => setMessages([...messages, data]));
  }, [socket, messages]);

  useEffect(() => {
<<<<<<< HEAD
    lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    socket.on('typingResponse', (data) => setTypingStatus(data));
  }, [socket]);

=======
    socket.on('typingResponse', (data) => setTypingStatus(data));
  }, [socket]);

  useEffect(() => {
    // 👇️ scroll to bottom every time messages change
    lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

>>>>>>> 92229ae (display matches and chat suggestions)
  console.log(currentUser);

  return (
    <div className="chat">
<<<<<<< HEAD
      <ChatBar socket={socket} currentUser={currentUser} userData={userData} />
=======
      <ChatBar socket={socket} userData={userData} />
>>>>>>> 92229ae (display matches and chat suggestions)
      <div className="chat__main">
        <ChatBody
          messages={messages}
          typingStatus={typingStatus}
          lastMessageRef={lastMessageRef}
<<<<<<< HEAD
=======
          favouriteFood={favoriteFood}
>>>>>>> 92229ae (display matches and chat suggestions)
        />
        <ChatFooter socket={socket} currentUser={currentUser} />
      </div>
    </div>
  );
};

export default ChatPage;
