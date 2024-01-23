import express from 'express';
import http from 'http';
import * as socketIo from 'socket.io';

let currentTurn = 'player1'; // Initialize the turn to Player 1
let roomStates = {}; // Keeps track of the state of each room


const app = express();
const httpServer = http.createServer(app);
const io = new socketIo.Server(httpServer, {
    cors: {
        origin: "*", // Your client's URL
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('checkRoom', (room, callback) => {
        const roomSize = io.sockets.adapter.rooms.get(room)?.size || 0;
        const isFull = roomSize >= 2;
        callback(isFull);
    });


    socket.on('joinRoom', (room) => {
        const roomSize = io.sockets.adapter.rooms.get(room)?.size || 0;

        if (roomSize < 2) {
            socket.join(room);
            console.log(`User joined room: ${room}`);
            // Handle joining room logic here
            // Assign player role
            let playerRole = roomSize === 0 ? 'player1' : 'player2';
            console.log(`User with socket ID ${socket.id} joined room: ${room} as ${playerRole}`);
            socket.emit('roleAssigned', playerRole);

        } else {
            // Send a message back to the client if the room is full
            socket.emit('roomFull', `Room ${room} is already full`);
        }
        if (!roomStates[room]) {
            roomStates[room] = { players: [socket.id], currentPlayer: 'player1' };
        } else {
            roomStates[room].players.push(socket.id);
            // Notify both players that the game can start when the second player joins
            if (roomStates[room].players.length === 2) {
                io.to(room).emit('gameStart');
            }
        }
    });

    socket.on('makeMove', (data) => {
        const roomState = roomStates[data.room];
        // Process the move and determine the next turn
        if (socket.id === roomState.players[roomState.currentPlayer === 'player1' ? 0 : 1]) {
            currentTurn = currentTurn === 'player1' ? 'player2' : 'player1';
            roomState.currentPlayer = roomState.currentPlayer === 'player1' ? 'player2' : 'player1';
            io.to(data.room).emit('moveMade', {
                newGridCells: data.newGridCells,
                nextTurn: currentTurn
            });
        }
    });

    socket.on('leaveRoom', (room) => {
        console.log('player left')
        socket.leave(room);
        // Additional logic for notifying other player, updating room state, etc.
    });


    socket.on('disconnect', () => {
        console.log('Client disconnected');
        // Handle disconnect logic here
    });
});

// Start the HTTP server, not the Express app
httpServer.listen(3000, '192.168.7.250', () => {
    console.log('Server is running on port 3000');
});
