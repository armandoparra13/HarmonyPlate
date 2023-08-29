import React, { useState } from 'react';
import './SignUpPage.css';
import axios from 'axios';
import { useAuth } from '../../contexts/Auth'
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        dob: '',
        password: '',
        confirmPassword: '',
        gender: 'Select'
    });
    const [errorMessage, setErrorMessage] = useState("");  // New error state
    
    const navigate = useNavigate();
    const { login } = useAuth()

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check if passwords match
        if (formData.password !== formData.confirmPassword) {
            setErrorMessage("Passwords do not match!");
            return;  // Stop the function execution here
        }

        const dataToSend = {
            username: formData.name,
            email: formData.email,
            password: formData.password,
            dateOfBirth: formData.dob,
            gender: formData.gender
        };

        try {
            const response = await axios.post('/auth/signup', dataToSend);

            console.log(response.data);
            try {
                await login(formData.email, formData.password);
                navigate('/food')
            } catch (error) {
                console.log('Error logging in:', error)
            }
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    return (
        <div className="container">
            <h2>Harmony Plate Sign Up</h2>
            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label htmlFor="name">Name:</label>
                    <input className="custom-input" id="name" name="name" required onChange={handleChange} value={formData.name} />
                </div>
                <div className="input-group">
                    <label htmlFor="email">Email:</label>
                    <input className="custom-input" type="email" id="email" name="email" required onChange={handleChange} value={formData.email} />
                </div>
                <div className="input-group">
                    <label htmlFor="dob">Date of Birth:</label>
                    <input className="custom-input" type="date" id="dob" name="dob" required onChange={handleChange} value={formData.dob} />
                </div>
                <div className="input-group">
                    <label htmlFor="password">Password:</label>
                    <input className="custom-input" type="password" id="password" name="password" required onChange={handleChange} value={formData.password} />
                </div>
                <div className="input-group">
                    <label htmlFor="confirmPassword">Retype Password:</label>
                    <input className="custom-input" type="password" id="confirmPassword" name="confirmPassword" required onChange={handleChange} value={formData.confirmPassword} />
                </div>
                <div className="input-group">
                    <label htmlFor="gender">Gender:</label>
                    <select className="custom-select" id="gender" name="gender" onChange={handleChange} value={formData.gender}>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="nonbinary">Nonbinary</option>
                    </select>
                </div>

                {/* Display error message if it exists */}
                {errorMessage && <div className="error-message">{errorMessage}</div>}

                <div className="input-group">
                    <button className="input-group-button" type="submit">Sign Up</button>
                </div>
            </form>
        </div>
    );
}

export default SignUp;