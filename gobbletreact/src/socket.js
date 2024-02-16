import io from 'socket.io-client';

// This creates a single socket instance.
const socket = io('https://gobblet-express-backend.onrender.com', {
    reconnection: true,
    reconnectionAttempts: 120, // Number of attempts
    reconnectionDelay: 1000, // Delay between attempts in milliseconds
});

socket.on("connect", () => {
    console.log("Tried to recover", socket.recovered);
});

export default socket;