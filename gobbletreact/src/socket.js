import io from 'socket.io-client';

// This creates a single socket instance.
const socket = io('http://192.168.7.250:3000');

export default socket;