import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ChatBody = ({
  messages,
  userData,
  typingStatus,
  lastMessageRef,
  favouriteFood,
  selectedMatch,
}) => {
  //const [favoriteFood, setFavoriteFood] = useState(null);
  console.log(messages);

  const navigate = useNavigate();

  const handleLeaveChat = () => {
    navigate('/homepage');
    window.location.reload();
  };

  const matchProfileUsername =
    selectedMatch && selectedMatch.matchProfile
      ? selectedMatch.matchProfile.username
      : 'Username not found';

  console.log(selectedMatch);
  return (
    <>
      <header className="chat__mainHeader">
        <div>
          <p>{matchProfileUsername}</p>
        </div>

        <button className="leaveChat__btn" onClick={handleLeaveChat}>
          EXIT CHAT
        </button>
      </header>

      <div className="message__container">
        <div className="message__starter">Your match likes</div>
        {messages.map((messageContent) => {
          return (
            <div
              className="message"
              id={userData.username === messageContent.author ? 'you' : 'match'}
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
    </>
  );
};

export default ChatBody;
