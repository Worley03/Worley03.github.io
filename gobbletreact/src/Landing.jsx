import { useState } from 'react';
import './Landing.css'; // Assuming you have a separate CSS file for styling
import Logo from './assets/gobblet.png'; // Adjust the path as necessary
import socket from './socket.js';
import PropTypes from 'prop-types';

const Landing = ({ onLocalMultiplayer, onOnlineMultiplayer }) => {
    const [roomCode, setRoomCode] = useState('');
    const rulesPdfUrl = 'https://www.boardspace.net/gobblet/english/gobblet_rules.pdf'; // Replace with your actual URL

    const openRulesPdf = () => {
        window.open(rulesPdfUrl, '_blank');
    };

    const handleRoomCodeChange = (event) => {
        setRoomCode(event.target.value);
    };

    const handleJoinRoom = () => {
        socket.emit('checkRoom', roomCode, (isFull) => {
            if (!isFull) {
                onOnlineMultiplayer(roomCode);
            } else {
                alert('Room is full. Please try another room.');
            }
        });
    };

    const handleBlur = () => {
        document.body.style.zoom = 1.0;
    };

    const setViewportHeight = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    window.addEventListener('resize', setViewportHeight);
    setViewportHeight(); // Call on initial load


    return (
        <div className="landing-screen">
            <img src={Logo} alt="Gobblet" />
            <button onClick={openRulesPdf}>Game Rules</button>
            <button onClick={onLocalMultiplayer}>Local Multiplayer</button>
            <button 
                onClick={handleJoinRoom} 
                disabled={!roomCode.trim()} // Disable button if roomCode is empty
            >
                Create/Join Room
            </button>
            <input
                type="text"
                value={roomCode}
                onBlur={handleBlur}
                onChange={handleRoomCodeChange}
                placeholder={roomCode.trim() ? "" : "Enter Code"} // Conditional placeholder
            />
        </div>
    );
};

// Prop validation
Landing.propTypes = {
    onLocalMultiplayer: PropTypes.func.isRequired,
    onOnlineMultiplayer: PropTypes.func.isRequired,
  };

export default Landing;
