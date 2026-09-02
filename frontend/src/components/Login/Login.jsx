import React, { useState, useEffect } from 'react';
import './Login.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link, useNavigate } from 'react-router-dom';
import AuthService from '../../services/AuthService';

const Login = () => {

    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrors({});

       const formData = {
  email,
  password
};


        try {
            const response = await AuthService.login(formData);
            const data = response.data;
            if (data.token) {
                //   console.log(data);
                AuthService.loginUser(data);
                setIsLoggedIn(true);
            }
            else {
                 alert("Login failed");
                alert(data.msg);
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

    useEffect(() => {
        const userData=AuthService.getUserData();
        if (isLoggedIn && userData.is_admin) {
            navigate('/admin/dashboard', { replace:true });
        }else if (isLoggedIn && !userData.is_admin) {
            navigate('/dashboard', { replace:true });
        }
    }, [isLoggedIn, navigate]);

    return (
        <div className="container">
            <h1>Login</h1>
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
                <div className="form-group">
                    <label htmlFor="exampleInputPassword1">Password</label>
                    <input
                        type="password"
                        className="form-control"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {errors.password && <div className='errorMessage'>{errors.password}</div>}
                </div>
                <button type="submit" className="btn btn-primary mt-2">Login</button>
            </form>
            <p className='mt-2'>
                Don't have an account? <Link to="/register">Register</Link> | <Link to="/forgot-password">Forgot Password</Link>
            </p>
        </div>
    );
};

export default Login;