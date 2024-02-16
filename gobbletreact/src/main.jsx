import { useState } from 'react';
import ReactDOM from 'react-dom/client';
import Landing from './Landing.jsx';
import LocalMultiplayer from './local.jsx'; // Import your LocalMultiplayer component
import OnlineMultiplayer from './online.jsx'; // Import your OnlineMultiplayer component

// eslint-disable-next-line react-refresh/only-export-components
const RootComponent = () => {
    const [currentPage, setCurrentPage] = useState('landing');
    const [roomCode, setRoomCode] = useState(''); // State to store room code

    const handleLocalMultiplayer = () => {
        setCurrentPage('local');
    };

    const handleOnlineMultiplayer = (code) => {
        console.log('load multiplayer')
        setRoomCode(code); // Update the room code state
        setCurrentPage('online');
    };

    const returnToLanding = () => {
        console.log('return to landing')
        setCurrentPage('landing');
    };

    return (
        <div>
            {currentPage === 'landing' && <Landing onLocalMultiplayer={handleLocalMultiplayer} onOnlineMultiplayer={handleOnlineMultiplayer} />}
            {currentPage === 'local' && <LocalMultiplayer onReturnToLanding={returnToLanding} />}
            {currentPage === 'online' && <OnlineMultiplayer roomCode={roomCode} onReturnToLanding={returnToLanding} />}
        </div>
    );
};

ReactDOM.createRoot(document.getElementById('root')).render(<RootComponent />);
