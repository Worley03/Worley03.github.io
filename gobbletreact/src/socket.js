import io from 'socket.io-client';

// This creates a single socket instance.
const socket = io('https://gobblet-express-backend.onrender.com');

export default socket;