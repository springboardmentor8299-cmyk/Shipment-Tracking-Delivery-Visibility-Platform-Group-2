import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="header">
            <h1 className="header-title">Proof of Delivery</h1>
            <nav className="header-nav">
                <ul>
                    <li><a href="/">Home</a></li>
                    <li><a href="/delivery-proof">Delivery Proof</a></li>
                    <li><a href="/summary">Summary</a></li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;