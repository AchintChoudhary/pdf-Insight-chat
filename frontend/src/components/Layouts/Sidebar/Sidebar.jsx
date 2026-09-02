import { useState } from 'react';
import './Sidebar.css';
import { useNavigate } from 'react-router-dom';
import AuthService from '../../../services/AuthService';
import Menu from '../Menu/Menu';
const Sidebar = () => {
    const navigate = useNavigate();

    const [ sidebarActive, setSidebarActive ] = useState('');
    const userData = AuthService.getUserData();
    const currentUserName = userData?.fullname?.firstname || 'User';

    const sidebarToggle = () => {
        if(sidebarActive != ''){
            setSidebarActive('');
        }
        else{
            setSidebarActive('active');
        }
    }

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

            <Menu/>
          

        </nav>
    );
}

export default Sidebar;