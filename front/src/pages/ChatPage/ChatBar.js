import React from 'react';

const ChatBar = () => {
  return (
    <div className="chat__sidebar">
      <h2>Chats</h2>

      <div>
        <h4 className="chat__header">All Matches</h4>
        <div className="chat__users">
          {/*TO-DO: pull profile photos and match list*/}
          <p>User 1</p>
          <p>User 2</p>
          <p>User 3</p>
          <p>User 4</p>
        </div>
      </div>
    </div>
  );
};

export default ChatBar;
