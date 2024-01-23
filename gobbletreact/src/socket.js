import io from 'socket.io-client';

// This creates a single socket instance.
const socket = io('http://localhost:3000');

export default socket;