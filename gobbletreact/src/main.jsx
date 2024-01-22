import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import Landing from './Landing.jsx';
import App from './App.jsx'; // Import your App component

const RootComponent = () => {
    const [currentPage, setCurrentPage] = useState('landing');

    const handleLocalMultiplayer = () => {
        setCurrentPage('game');
    };

    const returnToLanding = () => {
        setCurrentPage('landing');
    };

    return (
        <React.StrictMode>
            {currentPage === 'landing' && <Landing onLocalMultiplayer={handleLocalMultiplayer} />}
            {currentPage === 'game' && <App onReturnToLanding={returnToLanding} />}
        </React.StrictMode>
    );
};

ReactDOM.createRoot(document.getElementById('root')).render(<RootComponent />);
