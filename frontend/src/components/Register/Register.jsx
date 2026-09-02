import React, { useState } from 'react';
import './Register.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link, useNavigate } from 'react-router-dom';
import AuthService from '../../services/AuthService';

const Register = () => {

    const navigate = useNavigate();

 const [firstname, setFirstname] = useState("");
const [lastname, setLastname] = useState("");
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [image, setImage] = useState(null);
    const [errors, setErrors ] = useState({});

    const handleSubmit = async (event) => {
        event.preventDefault();

        const formData = new FormData();
     formData.append("fullname[firstname]", firstname);
  formData.append("fullname[lastname]", lastname);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('image', image);

        try {
           const response = await AuthService.register(formData);
           const data = response.data;
           console.log(data);
       alert("Registration successful");
navigate('/login', { replace: true });

        }
        catch (error) {
            console.log(error);

            if(error.response && (error.response.status === 400 || error.response.status === 401)){

                if(error.response.data.errors){
                    const apiErrors = error.response.data.errors;
                    const newErrors = {};
                    apiErrors.forEach((apiError) => {
                        newErrors[apiError.path] = apiError.msg;
                    });
                    
                    setErrors(newErrors);
                }
                else{
                    alert(error.response.data.msg?error.response.data.msg:error.message);
                }

            }
            else{
                alert(error.message);
            }

            // alert("There was an error registering! " + error.message);
        }
    };

    return (
        <div className="container">
            <h1>Register</h1>
            <form onSubmit={handleSubmit}>
               <div className="form-group">
  <label>First Name</label>
  <input
    type="text"
    className="form-control"
    value={firstname}
    onChange={(e) => setFirstname(e.target.value)}
    placeholder="Enter first name"
  />
  {errors["fullname.firstname"] && (
    <div className="errorMessage">{errors["fullname.firstname"]}</div>
  )}
</div>

<div className="form-group">
  <label>Last Name</label>
  <input
    type="text"
    className="form-control"
    value={lastname}
    onChange={(e) => setLastname(e.target.value)}
    placeholder="Enter last name"
  />
</div>
                <div className="form-group">
                    <label>Select Image</label>
                    <input
                        type="file"
                        className="form-control"
                        onChange={(e) => setImage(e.target.files[0])}
                    />
                    {errors.image && <div className='errorMessage'>{errors.image}</div>}
                </div>
                <div className="form-group">
                    <label htmlFor="exampleInputEmail1">Email address</label>
                    <input
                        type="email"
                        className="form-control"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter email"
                    />
                    {errors.email && <div className='errorMessage'>{errors.email}</div>}

                </div>
                <div className="form-group">
                    <label htmlFor="exampleInputPassword1">Password</label>
                    <input
                        type="password"
                        className="form-control"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                    />
                    {errors.password && <div className='errorMessage'>{errors.password}</div>}

                </div>
                <button type="submit" className="btn btn-primary mt-2">Register</button>
            </form>
            <p className='mt-2'>
                You have an account? <Link to="/login">Login</Link>
            </p>
        </div>
    );
};

export default Register;