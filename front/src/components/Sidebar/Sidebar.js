import React, { useState } from 'react';
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


const Sidebar = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const toggle = () => setIsOpen(!isOpen);
    const { logout, currentUser } = useAuth()
    const navigate = useNavigate();
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
            path: "/profile",
            name: "Profile",
            icon: <FaUserAlt />
        },
    ]

    async function handleLogout() {

        try {
            console.log(currentUser);
            await logout();
            navigate('/');
            console.log("logged out");
            console.log(currentUser);
        } catch {
            console.log("Unable to logout")
        }

    }

    return (
        <div className="sidebarContainer">
            <div style={{ width: isOpen ? "300px" : "50px" }} className="sidebar">
                <div className="topSection">
                    <h1 style={{ display: isOpen ? "block" : "none" }} className="logo">HarmonyPlate</h1>
                    <div style={{ marginLeft: isOpen ? "50px" : "0px" }} className="bars">
                        <FaBars onClick={toggle} />
                    </div>
                </div>
                {
                    menuItem.map((item, index) => (
                        <NavLink to={item.path} key={index} className="link" activeclassName="active">
                            <div className="icon">{item.icon}</div>
                            <div style={{ display: isOpen ? "block" : "none" }} className="linkText"> {item.name}</div>
                        </NavLink>
                    ))
                }
                <NavLink onClick={handleLogout} to="/" className="link" activeclassName="active">
                    <div style={{ display: isOpen ? "block" : "none" }} className="linkText"> Logout</div>
                </NavLink>
            </div>
            <main>{children}</main>
        </div>
    );

};

export default Sidebar;