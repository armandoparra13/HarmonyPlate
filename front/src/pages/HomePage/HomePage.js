import React, { useEffect, useState } from 'react';
import { useAuth } from '../../Auth';
import axios from 'axios';
import './HomePage.css';

const HomePage = () => {
    const { currentUser } = useAuth();
    const [matches, setMatches] = useState([]);
    const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
    const [error, setError] = useState('');
    const currentMatch = matches[currentMatchIndex]
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
                console.log('Error fetching matches data:', error);
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
                console.log("Handle Like", e)
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
                console.log("Handle Skip", e)
            });
    }
    console.log(currentMatch)
    return matches.length !== 0 ?
        currentMatch ?
            (<div className="main-content">
                <div className="match-box">
                    <div className="match-card" key={currentMatchIndex}>
                        <button className="like-btn" onClick={handleLike}>Like</button>
                        <div className="match-info">
                            <div className="match-card-content">
                                {currentMatch.images && currentMatch.images.length !== 0 ?
                                    (<img src={currentMatch.images[1]} className="match-card-image" />) : (<div>No Image</div>)}
                                <h2 className="match-card-title">{currentMatch.name}</h2>
                                <p className="match-card-description">{currentMatch.description}</p>
                                <p className="match-card-food">Favorite Cuisine: {currentMatch.cuisine}</p>
                                <p className="match-card-artist">Favorite Artist: {currentMatch.artist}</p>
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