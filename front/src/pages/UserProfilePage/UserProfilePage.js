import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/Auth';
import axios from 'axios';
import './UserProfilePage.css';

function UserProfilePage() {
    const [userData, setUserData] = useState(null);
    const { currentUser } = useAuth();
    const [favoriteFoodImage, setFavoriteFoodImage] = useState(null);
    const [favoriteFoodTitle, setFavoriteFoodTitle] = useState(null);

    useEffect(() => {
        // Function to fetch user data
        const fetchUserData = async () => {
            try {
                const response = await axios.get("/auth/getUserProfile", {
                    headers: {
                        authorization: currentUser.accessToken,
                    },
                });

                setUserData(response.data);

                // Fetch favorite dish data
                favoriteDish(response.data.food.favoriteFood);
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        const favoriteDish = async (dishId) => {
            fetch(`/auth/recipe/${dishId}`)
                .then((response) => {
                    return response.json();
                })
                .then((dishData) => {
                    setFavoriteFoodImage(dishData.image);
                    setFavoriteFoodTitle(dishData.title);
                    // Do something with the favorite dish data
                })
                .catch((error) => {
                    console.error('Error fetching favorite dish:', error);
                });
        }

        fetchUserData();
    }, [currentUser.accessToken]);

    return (
        <div className='grid-container'>
            <div className="left-column">
                {userData ? (
                    <div>
                        <div className="first-row">
                            <img src="/uploads/abcdef/world-s-cutest-kitten.jpg" alt="upload" className="user-image" />
                        </div>
                        <div className="second-row">
                            <h2>{userData.username}</h2>
                            <div className="input-group">
                                <label>Description</label>
                                <input className="custom-input" disabled value={userData.description} />
                            </div>
                        </div>
                    </div>
                ) : (
                    <p>Loading user data...</p>
                )}
            </div>
            <div className="right-column">
                {userData ? (
                    <div>
                        <div className="input-group">
                            <label>Email</label>
                            <input className="custom-input" disabled value={userData.email} />
                        </div>
                        <div className="input-group">
                            <label>Date of Birth</label>
                            <input className="custom-input" disabled value={userData.dateOfBirth} />
                        </div>
                        <div className="input-group">
                            <label>Gender</label>
                            <input className="custom-input" disabled value={userData.gender}>
                            </input>
                        </div>
                        <div className="input-group">
                            <label>Diet</label>
                            <input className="custom-input" disabled value={userData.food.diet} />
                        </div>
                        <div className="input-group">
                            <label>Favorite Dish</label>
                            <input className="custom-input" disabled value={favoriteFoodTitle} />
                        </div>
                        <img src={favoriteFoodImage} alt="Favorite Dish" />                       
                    </div>
                ) : null}
            </div>
        </div>
    );
}

export default UserProfilePage;
