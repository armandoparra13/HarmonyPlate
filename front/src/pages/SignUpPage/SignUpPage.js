import React, { useState } from 'react';
import './SignUpPage.css';

const SignUp = () => {
    const [formData, setFormData] = useState({
        name: '',
        dob: '',
        password: '',
        confirmPassword: '',
        gender: 'male'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: Add form submission logic here
        console.log(formData);
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
                    <label htmlFor="dob">Date of Birth:</label>
                    <input className="custom-input" type="date" id="dob" name="dob" required onChange={handleChange} value={formData.dob} />
                </div>
                <div className="input-group">
                    <label htmlFor="password">Password:</label>
                    <input className="custom-input" id="password" name="password" required onChange={handleChange} value={formData.password} />
                </div>
                <div className="input-group">
                    <label htmlFor="confirmPassword">Retype Password:</label>
                    <input className="custom-input" id="confirmPassword" name="confirmPassword" required onChange={handleChange} value={formData.confirmPassword} />
                </div>
                <div className="input-group">
                    <label htmlFor="gender">Gender:</label>
                    <select id="gender" name="gender" onChange={handleChange} value={formData.gender}>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="nonbinary">Nonbinary</option>
                    </select>
                </div>
                <div className="input-group">
                    <button type="submit">Sign Up</button>
                </div>
            </form>
        </div>
    );
}

export default SignUp;