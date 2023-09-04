import React, { useEffect, useState } from 'react';
import { useAuth } from '../../Auth';
import axios from 'axios';
import './HomePage.css';
import { useLocation } from 'react-router-dom';

const HomePage = () => {
    const { currentUser, logout } = useAuth();
    const [matches, setMatches] = useState([]);
    const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

    const fetchUserData = async () => {
        if (currentUser) {
            try {
                if (matches) {
                    try {
                        await axios.get('/auth/getMatches',
                            {
                                headers: {
                                    authorization: currentUser.accessToken,
                                },
                            });
                    } catch (error) {
                        console.error('Error updating pool:', error);
                    }
                }
                const response = await axios.get('/auth/getMatchesInfo', {
                    headers: {
                        Authorization: currentUser.accessToken,
                    },
                });
                setMatches(matches.concat(response.data))
            } catch (error) {
                console.error('Error fetching matches data:', error);
            }
        }
    };

    useEffect(() => {
        if (!matches || currentMatchIndex >= matches.length / 2)
            fetchUserData()
    }, [matches, currentMatchIndex]);

    const handleLike = async () => {
        setCurrentMatchIndex(currentMatchIndex + 1);
        await axios.post("/auth/addMatch",
            {},
            {
                headers: {
                    Authorization: currentUser.accessToken,
                },
            });
    }
    const handleSkip = async () => {
        setCurrentMatchIndex(currentMatchIndex + 1);
        const response = await axios.post("/auth/addIgnored",
            {},
            {
                headers: {
                    Authorization: currentUser.accessToken,
                },
            });
    }
    return matches.length !== 0 ? (
        <div className="main-content">
            <div className="match-box">
                <p>Potential Match Details</p>

                {/* {matches.map((data, i) => ( */}
                <div className="match-card" key={currentMatchIndex}>
                    <button className="like-btn" onClick={handleLike}>Like</button>
                    <div className="match-info">
                        <img src={`images/pw4jJaaOv5YJFYnUCCXhB3RaoXt2/pw4jJaaOv5YJFYnUCCXhB3RaoXt2.png`} alt="1" className="card-image" />
                        <div className="match-card-content">
                            <h2 className="match-card-title">{matches[currentMatchIndex].name}</h2>
                            <p className="match-card-description">{matches[currentMatchIndex].description}y</p>
                            <p className="match-card-food">Favorite Cuisine: {matches[currentMatchIndex].cuisine}</p>
                            <p className="match-card-artist">Favorite Artist: {matches[currentMatchIndex].artist}</p>
                        </div>
                    </div>
                    <button className="skip-btn" onClick={handleSkip}>Skip</button>
                </div>
                {/* ))} */}

            </div>
        </div>
    ) : (<>loading</>);
}

export default HomePage;