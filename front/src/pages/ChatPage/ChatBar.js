import React from 'react';

const ChatBar = ({ userData }) => {
  return (
    <div className="chat__sidebar">
      <h2>Chats</h2>

      <div>
        <h4 className="chat__header">All Matches</h4>
        <div className="chat__users">
          {/* TO-DO: pull profile photos and match list */}
          {userData &&
            userData.matches.map((match) => (
              <div key={match.id}>
                {' '}
                {/* Add key to the outer div */}
                <div className="user__image">
                  <img
                    src={`../public/uploads/${match.id}/${match.id}_0`}
                    alt={match.name}
                  />{' '}
                  {/* Add alt attribute */}
                </div>
                <p>{match.name}</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ChatBar;
