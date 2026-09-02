import React,{ useState, useEffect } from 'react';
import './Sidebar.css';
import { useNavigate } from 'react-router-dom';
import AuthService from '../../../../services/AuthService';

const Sidebar = () => {
    const navigate = useNavigate();

    const [ sidebarActive, setSidebarActive ] = useState('');
    const [ currentUserName, setCurrentUserName ] = useState('');
    const [ isAdmin, setIsAdmin ] = useState(false);
    const userData = AuthService.getUserData();

    const sidebarToggle = () => {
        if(sidebarActive != ''){
            setSidebarActive('');
        }
        else{
            setSidebarActive('active');
        }
    }

    useEffect(()=>{
        setCurrentUserName(userData?.fullname?.firstname || "User");

       setIsAdmin(userData?.is_admin || false);

    },[]);

    const handleLogout = () => {
        AuthService.logoutUser();
        navigate('/login', { replace: true });
    };

    return (
        <nav id="sidebar" className={ sidebarActive }>
            <div className="custom-menu">
                <button type="button" id="sidebarCollapse" onClick={ sidebarToggle } className="btn btn-primary">
                   <i className="ri-menu-line"></i>
                    <span className="sr-only">Toggle Menu</span>
                </button>
            </div>
            <div className="topbar">
                <a href="#">Hii, { currentUserName }</a>
                <button className='btn btn-secondary logoutBtn' onClick={handleLogout}>Log Out</button>
            </div>
            <div className='text-center'>
                
            </div>
            <ul className="list-unstyled components mb-5">
                
                {isAdmin ? (
                    <li className="active">
                        <a href="#">Admin</a>
                    </li>
                ) : (
                    <li className="active">
                        <a href="#">User</a>
                    </li>
                )}
                
            </ul>

        </nav>
    );
}

export default Sidebar;