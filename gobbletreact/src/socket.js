import io from 'socket.io-client';

// This creates a single socket instance.
const socket = io('https://gobblet-express-backend.onrender.com', {
    reconnection: true,
    reconnectionAttempts: 10, // Number of attempts
    reconnectionDelay: 1000, // Delay between attempts in milliseconds
});

export default socket;