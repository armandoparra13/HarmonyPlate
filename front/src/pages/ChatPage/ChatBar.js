import React from 'react';

const ChatBar = ({ userData }) => {
  const pool = userData && userData.pool;

  return (
    <div className="chat__sidebar">
      <h2>Chats</h2>

      <div>
        <h4 className="chat__header">All Matches</h4>
        <div className="chat__users">
          {pool && pool.length > 0 ? (
            pool.map((match, index) => (
              <div key={index}>
                <div className="user__image">
                  <img
                    src={`../public/uploads/${match}/${match}_0`}
                    alt={match}
                  />
                </div>
                <p>{match}</p>
              </div>
            ))
          ) : (
            <p>No matches found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatBar;
