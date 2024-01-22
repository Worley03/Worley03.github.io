import React from 'react';
import './Landing.css'; // Assuming you have a separate CSS file for styling
import Logo from './assets/gobblet.png'; // Adjust the path as necessary

window.addEventListener('resize', () => {
    document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
});

// Set the variable initially
document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);


const Landing = ({ onLocalMultiplayer }) => {
    // URL to the PDF file containing the game rules
    const rulesPdfUrl = 'https://www.boardspace.net/gobblet/english/gobblet_rules.pdf'; // Replace with your actual URL

    // Function to open the PDF in a new tab
    const openRulesPdf = () => {
        window.open(rulesPdfUrl, '_blank');
    };

    return (
        <div className="landing-screen">
            <img src={Logo} alt="Gobblet" /> {/* Image added here */}
            <button onClick={openRulesPdf}>Game Rules</button> {/* Button for game rules */}
            <button onClick={onLocalMultiplayer}>Local Multiplayer</button>
            <button onClick={onLocalMultiplayer}>Create/Join Room</button>
        </div>
    );
};

export default Landing;
