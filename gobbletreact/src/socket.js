import io from 'socket.io-client';

// This creates a single socket instance.
const socket = io('http://localhost:3000', {
    reconnection: true,
    reconnectionAttempts: 5, // Number of attempts
    reconnectionDelay: 1000, // Delay between attempts in milliseconds
});

export default socket;