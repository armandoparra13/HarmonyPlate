import React, { useState, useEffect } from 'react';
import './HomePage.css';
import { useLocation } from 'react-router-dom';

const HomePage = () => {
    const [navOpen, setNavOpen] = useState(false);
    const location = useLocation(); 

    return (
        <div className="home-container">
            {/* <div className={`navbar ${navOpen ? 'open' : ''}`}>
                <button className="toggle-nav" onClick={() => setNavOpen(!navOpen)}>
                    {navOpen ? 'Close' : 'Open'}
                </button>
                <button>Profile</button>
                <button>Messages</button>
                <button>Matches</button>
                <button>Settings</button>
                <button>Sign Out</button>
            </div> */}
            <div className="main-content">
                <div className="match-box">
                    {/* Display potential match details here */}
                    <p>Potential Match Details</p>
                    <div className="actions">
                        <button className="like-btn">Like</button>
                        <button className="skip-btn">Skip</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HomePage;