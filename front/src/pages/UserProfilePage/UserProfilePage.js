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
            console.log(userData);

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
                console.log("Favorite dish data:", dishData);
                setFavoriteFoodImage(dishData.image);
                setFavoriteFoodTitle(dishData.title);
                // Do something with the favorite dish data
            })
            .catch((error) => {
                console.error('Error fetching favorite dish:', error);
            });
        }

        fetchUserData();
    }, []);
        
    return (
        <div className='grid-containter'>
            <div className="grid-item">1</div>
            <h1>User Profile</h1>
                
                <div className="grid-item">2</div>
            {userData ? (
                <div>
                <img src="/uploads/abcdef/Funny-Cat-Hidden.jpg" alt="upload" ></img>
                <p>Username: {userData.username}</p>
                <p>Description: {userData.description}</p>
                <p>Email: {userData.email}</p>
                <p>DOB: {userData.dateOfBirth}</p>
                <p>Gender: {userData.gender}</p>
                <p>Diet: {userData.food.diet}</p>
                <p>Favorite dish: {favoriteFoodTitle}</p>
                <img src={favoriteFoodImage}></img>
                {/* Render other user data */}
                </div>
            ) : (
                <p>Loading user data...</p>
            )}
        </div>
    );
};
export default UserProfilePage;