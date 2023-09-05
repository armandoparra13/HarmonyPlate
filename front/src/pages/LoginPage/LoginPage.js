import React, { useState } from 'react';
import './LoginPage.css';;
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../Auth'

function LoginPage() {
  const [loginFormActive, setLoginFormActive] = useState(false);
  const { login } = useAuth();

  const toggleLoginForm = () => {
    setLoginFormActive(true);
  };

  const goBack = () => {
    setLoginFormActive(false);
  };

  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/homepage');
    } catch (error) {
      console.log('Error logging in:', error)
    }
  };

  const onSignUp = () => {
    navigate("/Signup")
  }

  return (
    <div className="loginContainer">
      <img className="bg-img" src="https://media.giphy.com/media/h7uTwqEHysbd2lhyDP/giphy.gif" />

      <div className="card">
        <div className="title">Harmony Plate</div>
        <div className="button-group" id="button-group">
          <a className={`button signup ${loginFormActive ? 'hidden' : ''}`}
            onClick={onSignUp}
          >
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
        {loginFormActive && (<p className="text-sm text-white text-center">
          No account yet? <Link to="/signup">Sign up</Link>
        </p>)}
      </div>
    </div>
  );
}

export default LoginPage;
