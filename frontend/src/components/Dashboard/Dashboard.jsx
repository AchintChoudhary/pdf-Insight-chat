import React, { useEffect , useRef, useState} from 'react';
import './Dashboard.css';
import Layout from '../Layouts/Layout/Layout';
import AuthService from '../../services/AuthService';

const Dashboard = () => {

    // const userData = AuthService.getUserData();

    return (
        <Layout>
            <h2 className="mb-4"></h2>
        </Layout>
    );
}

export default Dashboard;