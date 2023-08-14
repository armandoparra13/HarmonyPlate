
import React, { useEffect, useState } from 'react';
import './LoginPage.css';

function LoginPage() {
  const [loginFormActive, setLoginFormActive] = useState(false);
  const [backendData, setBackendData] = useState([{}]);

  useEffect(() => {
    fetch("/api").then(response => {
      response.json()
    }).then(data => {
      setBackendData(data)
    })
  }, [])

  const toggleLoginForm = () => {
    setLoginFormActive(true);
  };

  const goBack = () => {
    setLoginFormActive(false);
  };

  return (
    <div>
      <img src="https://media.giphy.com/media/h7uTwqEHysbd2lhyDP/giphy.gif" />

      <div className="card">
        <div className="title">Harmony Plate</div>
        <div className="button-group" id="button-group">
          <a className={`button signup ${loginFormActive ? 'hidden' : ''}`}>
            Sign Up
          </a>
          <a
            className={`button login ${loginFormActive ? 'hidden' : ''}`}
            id="initialLogin"
            onClick={toggleLoginForm}
          >
            Login
          </a>
        </div>
        <div className={`login-form ${loginFormActive ? 'active' : ''}`} id="login-form">
          <input type="email" placeholder="Email" id="email" />
          <br />
          <input type="password" placeholder="Password" id="password" />
          <br />
          <button className="back-button" onClick={goBack}>
            &#8592;
          </button>
          <button id="login-button">Login</button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
