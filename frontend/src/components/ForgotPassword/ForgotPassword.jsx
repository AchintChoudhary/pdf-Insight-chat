import React, { useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';
import AuthService from '../../services/AuthService';

const ForgotPassword = () => {

    const [email, setEmail] = useState('');
    const [errors, setErrors] = useState({});

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrors({});

        const formData = new FormData();
        formData.append('email', email);

        try {
            const response = await AuthService.forgotPassword(formData);
            const data = response.data;
            alert(data.msg);
            if (data.success) {
                setEmail('');
            }
        }
        catch (error) {

            if (error.response && (error.response.status === 400 || error.response.status === 401)) {

                if (error.response.data.errors) {
                    const apiErrors = error.response.data.errors;
                    const newErrors = {};
                    apiErrors.forEach((apiError) => {
                        newErrors[apiError.path] = apiError.msg;
                    });

                    setErrors(newErrors);
                }
                else {
                    alert(error.response.data.msg ? error.response.data.msg : error.message);
                }

            }
            else {
                alert(error.message);
            }

            // alert("There was an error registering! " + error.message);
        }
    };

    return (
        <div className="container">
            <h1>Forgot Password</h1>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="exampleInputEmail1">Email address</label>
                    <input
                        type="email"
                        className="form-control"
                        placeholder="Enter email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    {errors.email && <div className='errorMessage'>{errors.email}</div>}
                </div>
                <button type="submit" className="btn btn-primary mt-2">Submit</button>
            </form>
            <p className='mt-2'>
                <Link to="/login">Login</Link>
            </p>
        </div>
    );

};

export default ForgotPassword;