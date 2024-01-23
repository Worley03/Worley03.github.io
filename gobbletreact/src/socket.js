import io from 'socket.io-client';

// This creates a single socket instance.
const socket = io('http://192.168.68.131:3000');

export default socket;