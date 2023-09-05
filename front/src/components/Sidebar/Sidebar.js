import React, { useState, useEffect } from 'react';
import './Sidebar.css'
import {
    FaBars,
    FaHouseUser,
    FaRocketchat,
    FaUserAlt
} from "react-icons/fa"
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../Auth'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const defaultUserData = {
    picturesUploaded: 0,
    spotifyLinked: false,
    foodsChosen: false,
};

const Sidebar = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const toggle = () => setIsOpen(!isOpen);
    const { logout, currentUser } = useAuth()
    const navigate = useNavigate();
    const [userData, setUserData] = useState(defaultUserData);
    const { picturesUploaded, spotifyLinked, foodsChosen } = userData || {};
    const menuItem = [
        {
            path: "/homepage",
            name: "Home",
            icon: <FaHouseUser />

        },
        {
            path: "/chats",
            name: "Chats",
            icon: <FaRocketchat />
        },
        {
            path: "/user-profile",
            name: "Profile",
            icon: <FaUserAlt />
        },
    ]

    useEffect(() => {
        async function fetchUserData() {
            if (currentUser) {
                try {

                    const response = await axios.get('/auth/fetch-user-data', {
                        headers: {
                            Authorization: `Bearer ${currentUser.accessToken}`,
                        },

                    });
                    setUserData(response.data);
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            }
        }

        fetchUserData();
    }, [currentUser]);

    async function handleLogout() {

        try {
            console.log(currentUser);
            await logout();
            await window.location.reload(false);
            navigate('/');
        } catch {
            console.log("Unable to logout")
        }

    }

    return (
        <div className="sidebarContainer">
            {
                userData && (picturesUploaded >= 3) && spotifyLinked && foodsChosen &&
                (<div style={{ width: isOpen ? "300px" : "50px" }} className="sidebar">
                    <div className="topSection">
                        <h1 style={{ display: isOpen ? "block" : "none" }} className="logo">HarmonyPlate</h1>
                        <div style={{ marginLeft: isOpen ? "50px" : "0px" }} className="bars">
                            <FaBars onClick={toggle} />
                        </div>
                    </div>
                    {
                        menuItem.map((item, index) => (
                            <NavLink to={item.path} key={index} className="link" >
                                <div className="icon">{item.icon}</div>
                                <div style={{ display: isOpen ? "block" : "none" }} className="linkText"> {item.name}</div>
                            </NavLink>
                        ))
                    }
                    <NavLink onClick={handleLogout} style={{ display: isOpen ? "block" : "none" }} to="/" className="link" >
                        <div className="linkText"> Logout</div>
                    </NavLink>
                </div>)}
            <main>{children}</main>
        </div>
    );

};

export default Sidebar;