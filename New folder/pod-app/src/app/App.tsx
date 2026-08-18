import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Routes from './routes';
import Header from '../components/Header';
import './styles/globals.css';

const App = () => {
    return (
        <Router>
            <Header />
            <Routes />
        </Router>
    );
};

export default App;