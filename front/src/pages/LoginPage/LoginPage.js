import React, { useState } from 'react';
import './LoginPage.css';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import { NavLink, useNavigate } from 'react-router-dom';

/*
export const LoginPage = () => {
  return (
    <div className="LoginPage">
        <h1>This is Log-in Page!</h1>
    </div>
  );
}

*/

function LoginPage() {
  const [loginFormActive, setLoginFormActive] = useState(false);

  const toggleLoginForm = () => {
    setLoginFormActive(true);
  };

  const goBack = () => {
    setLoginFormActive(false);
  };

  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onLogin = (e) => {
    e.preventDefault();
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        navigate('/create-profile');
        console.log(user);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage);
      });
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
        <div
          className={`login-form ${loginFormActive ? 'active' : ''}`}
          id="login-form"
        >
          <input
            type="email"
            placeholder="Email address"
            id="email"
            onChange={(e) => setEmail(e.target.value)}
          />
          <br />
          <input
            type="password"
            placeholder="Password"
            id="password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <br />
          <button className="back-button" onClick={goBack}>
            &#8592;
          </button>
          <button id="login-button" onClick={onLogin}>
            Login
          </button>
        </div>
        <p className="text-sm text-white text-center">
          No account yet? <NavLink to="/signup">Sign up</NavLink>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
