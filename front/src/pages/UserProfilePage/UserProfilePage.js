import React, { useEffect, useState } from 'react';
import { useAuth } from '../../Auth';
import axios from 'axios';
import './UserProfilePage.css';

function UserProfilePage() {
    const [userData, setUserData] = useState(null);
    const { currentUser } = useAuth();
    const [favoriteFoodImage, setFavoriteFoodImage] = useState(null);
    const [favoriteFoodTitle, setFavoriteFoodTitle] = useState(null);
    const [imageUrls, setImageUrls] = useState([]);

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
                fetchUserImages();
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

        const fetchUserImages = async () => {
            try {
                const response = await axios.get('/auth/fetch-user-images', {
                    headers: {
                        Authorization: `Bearer ${currentUser.accessToken}`,
                    },
                });
                if (response.data) {
                    setImageUrls(response.data.imageUrls);
                    console.log(response.data.imageUrls);
                }

            } catch (error) {
                console.error('Error fetching user images:', error);
            }
        };

        fetchUserData();
    }, [currentUser.accessToken]);



    return (
        <div className='grid-container'>
            <div className="left-column">
                {userData ? (
                    <div>
                        <div className="first-row">
                            {imageUrls.map((imageUrl, index) => (
                                <div key={index} className="image-container">
                                    <div className="image-wrapper">
                                        <img src={imageUrl} alt={`User Image ${index}`} className="images-displayed" />
                                    </div>
                                </div>
                            ))}
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
                    </div>
                ) : null}
            </div>
        </div>
    );
}

export default UserProfilePage;
