import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ChatFooter = ({
  socket,
  userData,
  selectedMatch,
  printChat,
  typingStatus,
  lastMessageRef,
  uniqueRoom,
}) => {
  const [currentMessage, setCurrentMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [messageList, setMessageList] = useState([]);
  const [matchFood, setMatchFood] = useState(null);

  const fetchFavoriteFood = async (foodId) => {
    try {
      if (foodId) {
        const response = await fetch(`/auth/recipe/${foodId}`);
        if (response.ok) {
          const dishData = await response.json();
          setMatchFood(dishData.title);
        } else {
          console.error('Error fetching favorite dish:', response.status);
        }
      }
    } catch (error) {
      console.error('Error fetching favorite dish:', error);
    }
  };

  useEffect(() => {
    if (
      selectedMatch &&
      selectedMatch.matchProfile &&
      selectedMatch.matchProfile.food &&
      selectedMatch.matchProfile.food.favoriteFood
    ) {
      fetchFavoriteFood(selectedMatch.matchProfile.food.favoriteFood);
    } else if (userData && userData.food && userData.food.favoriteFood) {
      fetchFavoriteFood(userData.food.favoriteFood);
    }
  }, [selectedMatch, userData]);

  console.log(selectedMatch);
  const handleTyping = () =>
    socket.emit('typing', `${userData.username} is typing`);

  const sendMessage = async () => {
    if (currentMessage !== '') {
      const messageData = {
        room: uniqueRoom,
        author: userData.username,
        message: currentMessage,
        time: `${new Date(Date.now()).getHours()}:${new Date(
          Date.now()
        ).getMinutes()}`,
      };

      socket.emit('send_message', messageData);
      setMessageList((list) => [...list, messageData]);
      setCurrentMessage('');
    }
  };

  useEffect(() => {
    socket.on('receive_message', (messageData) => {
      console.log('received: ', messageData);
      setMessageList((list) => [...list, messageData]);
    });
  }, [socket]);

  const navigate = useNavigate();

  const handleLeaveChat = () => {
    navigate('/homepage');
    window.location.reload();
  };

  console.log(messageList);

  return (
    <>
      <header className="chat__mainHeader">
        <div>
          <p>{selectedMatch.matchProfile.username}</p>
        </div>

        <button className="leaveChat__btn" onClick={handleLeaveChat}>
          EXIT CHAT
        </button>
      </header>

      <div className="message__container">
        <div className="message__starter">
          Cool! Your match likes {''}
          {matchFood || 'your favourite food too!'}
          {'!'}
        </div>

        {messageList.map((messageContent, index) => {
          return (
            <div
              key={index}
              className="message"
              id={userData.username === messageContent.author ? 'you' : 'other'}
            >
              <div>
                <div className="message-content">
                  <p>{messageContent.message}</p>
                </div>
                <div className="message-meta">
                  <p id="time">{messageContent.time}</p>
                  <p id="author">{messageContent.author}</p>
                </div>
              </div>
            </div>
          );
        })}

        <div className="message__status">
          <p>{typingStatus}</p>
        </div>
        <div ref={lastMessageRef} />
      </div>
      <div className="chat__footer">
        <div className="form">
          <input
            type="text"
            placeholder="Write message"
            className="message"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            disabled={isSending} // Disable input field while sending
            onKeyDown={(event) => {
              handleTyping();
              event.key === 'Enter' && sendMessage();
            }}
          />
          <button
            onClick={() => {
              sendMessage();
              printChat(messageList);
            }}
            className="sendBtn"
            disabled={isSending}
          >
            {isSending ? 'SENDING...' : 'SEND'}
          </button>
        </div>
      </div>
    </>
  );
};

export default ChatFooter;
