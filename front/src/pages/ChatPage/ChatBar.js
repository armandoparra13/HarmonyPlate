import React, { useState, useEffect } from 'react';
import axios from 'axios';
//import Chat from '../../../public/uploads/'

const ChatBar = ({ socket, userData, chooseMatch, assignRoom }) => {
  const [matchesData, setMatchesData] = useState([]); // State to store matches data
  const [loading, setLoading] = useState(true); // State to track loading status
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [room, setRoom] = useState('');

  useEffect(() => {
    const fetchMatchData = async (uid) => {
      try {
        const response = await axios.get(`/auth/getMatchProfile?uid=${uid}`, {
          headers: {
            authorization: userData.accessToken,
          },
        });
        return response.data;
      } catch (error) {
        console.error(`Error fetching user data for UID ${uid}:`, error);
        return null;
      }
    };

    // Assuming userData.pool is an array of UIDs like ['UID1', 'UID2', ...]
    const pool = userData?.pool || [];

    // Fetch data for each UID in the pool
    const fetchDataForPool = async () => {
      const matchesPromises = pool.map(async (uid) => {
        const matchProfile = await fetchMatchData(uid);
        return {
          uid,
          matchProfile,
        };
      });
      const matches = await Promise.all(matchesPromises);

      // Update matchesData with the fetched data
      setMatchesData(matches);
      setLoading(false); // Set loading to false once data is fetched
    };

    fetchDataForPool();
  }, [userData]);

  const pool = userData?.pool || [];
  console.log(pool);
  console.log(socket);

  const createUniqueChatRoom = (user1Id, user2Id) => {
    const sortedUserIds = [user1Id, user2Id].sort();
    return sortedUserIds.join('_'); // You can use any separator you prefer
  };

  const roomId = selectedMatch
    ? createUniqueChatRoom(userData.uid, selectedMatch.matchProfile.uid)
    : null;

  //const handleSelectMatch = (match) => {
  // setSelectedMatch(match);
  //};

  console.log(selectedMatch);

  return (
    <div className="chat__sidebar">
      <h2>Chats</h2>
      <div>
        <h4 className="chat__header">All Matches</h4>
        <div className="chat__users">
          {matchesData.length > 0 ? (
            matchesData.map((match, index) => (
              <div key={index}>
                <a
                  onClick={() => {
                    chooseMatch(match);
                    assignRoom(roomId);
                  }}
                >
                  {/* Access the username from match.matchProfile */}
                  {match.matchProfile.username || 'Username not found'}
                </a>
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
