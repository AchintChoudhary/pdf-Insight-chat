import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Sidebar from '../Sidebar/Sidebar';
import './Layout.css';

const Layout = ({ children }) => {
    return (
        <div className="wrapper d-flex align-items-stretch">
            <Sidebar/>
            <div id="content" className="p-4 p-md-5 pt-5">
                { children }
            </div>
        </div>
    );
}

export default Layout;