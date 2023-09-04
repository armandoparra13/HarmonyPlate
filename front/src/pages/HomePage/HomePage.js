import React, { useEffect, useState } from 'react';
import { useAuth } from '../../Auth';
import axios from 'axios';
import './HomePage.css';
import { useLocation } from 'react-router-dom';

const HomePage = () => {
    const { currentUser, logout } = useAuth();
    const [matches, setMatches] = useState([]);
    const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
    const [error, setError] = useState('');
    const fetchUserData = async () => {
        if (currentUser) {
            try {
                const response = await axios.get('/auth/getMatchesInfo', {
                    headers: {
                        Authorization: currentUser.accessToken,
                    },
                });
                setMatches(response.data)
                setCurrentMatchIndex(0);
            } catch (error) {
                console.error('Error fetching matches data:', error);
                setError('No more matches')
            }
        }
    };

    useEffect(() => {
        if (!matches || currentMatchIndex >= matches.length)
            fetchUserData()
    }, [matches, currentMatchIndex]);

    const handleLike = () => {
        setCurrentMatchIndex(currentMatchIndex + 1);
        axios.post("/auth/addMatch",
            {},
            {
                headers: {
                    Authorization: currentUser.accessToken,
                },
            }).catch(e => {
                console("Handle Like", e)
            });
    }
    const handleSkip = () => {
        setCurrentMatchIndex(currentMatchIndex + 1);
        axios.post("/auth/addIgnored",
            {},
            {
                headers: {
                    Authorization: currentUser.accessToken,
                },
            }).catch(e => {
                console("Handle Skip", e)
            });
    }
    return matches.length !== 0 ?
        matches[currentMatchIndex] ?
            (<div className="main-content">
                <div className="match-box">
                    <div className="match-card" key={currentMatchIndex}>
                        <button className="like-btn" onClick={handleLike}>Like</button>
                        <div className="match-info">
                            <div className="match-card-content">
                                {/* <img src="/uploads/PQ5oYgHbPd/PQ5oYgHbPd_1.png" className="match-card-image" /> */}
                                <h2 className="match-card-title">{matches[currentMatchIndex].name}</h2>
                                <p className="match-card-description">{matches[currentMatchIndex].description}</p>
                                <p className="match-card-food">Favorite Cuisine: {matches[currentMatchIndex].cuisine}</p>
                                <p className="match-card-artist">Favorite Artist: {matches[currentMatchIndex].artist}</p>
                            </div>
                        </div>
                        <button className="skip-btn" onClick={handleSkip}>Skip</button>
                    </div>
                    {/* ))} */}

                </div>
            </div>)
            :
            (<div>{error}</div>)
        : (<>loading</>);
}

export default HomePage;