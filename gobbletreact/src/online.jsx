import React, { useState, useEffect } from 'react';
import './App.css';
import socket from './socket.js';

const GameBoard = ({ roomCode, onReturnToLanding }) => {
    const [selectedCup, setSelectedCup] = useState({ id: null, isSelected: false });
    const [gridCells, setGridCells] = useState(Array(16).fill([]));
    const [winner, setWinner] = useState(null);
    const [currentPlayer, setCurrentPlayer] = useState('player1');
    const [gameStarted, setGameStarted] = useState(null);
    const [playerRole, setPlayerRole] = useState(null);

    useEffect(() => {
        console.log(`Joining server`);
        socket.emit('joinRoom', roomCode);
    }, [roomCode]);

    useEffect(() => {
        const handleRoleAssigned = (role) => {
            setPlayerRole(role);
            if (role === 'player1') {
                setCurrentPlayer('player1');
            }
        };

        const handleGameStart = () => {
            setGameStarted(true);
        };

        const handleMoveMade = (data) => {
            console.log(`${data} recieved`);
            setGridCells(data.newGridCells);
            setCurrentPlayer(data.nextTurn);
        };

        socket.on('roleAssigned', handleRoleAssigned);
        socket.on('gameStart', handleGameStart);
        socket.on('moveMade', handleMoveMade);

        // Cleanup function
        return () => {
            socket.off('roleAssigned', handleRoleAssigned);
            socket.off('gameStart', handleGameStart);
            socket.off('moveMade', handleMoveMade);
        };
    }, [roomCode]); // Runs only when roomCode changes

    const handleCupClick = (cupId, event) => {
        event.stopPropagation();
        if (cupId.includes(currentPlayer)) {
            setSelectedCup({ id: cupId, isSelected: true });
        }
    };

    useEffect(() => {
        const handleGlobalClick = (event) => {
            if (!event.target.classList.contains('grid-cell') || !event.target.hasChildNodes()) {
                setSelectedCup({ id: null, isSelected: false });
            }
        };

        document.addEventListener('click', handleGlobalClick);
        return () => {
            document.removeEventListener('click', handleGlobalClick);
        };
    }, []);

    const handleGridCellClick = (cellIndex, event) => {
        if (gameStarted && currentPlayer === playerRole) {
            event.stopPropagation();
            const clickedStack = gridCells[cellIndex];
            // Allow the move only if it's the current player's turn
            if (selectedCup.isSelected && selectedCup.id) {
                const selectedCupSize = parseInt(selectedCup.id.split('-')[2]);
                const isCupFromStartingStack = !gridCells.flat().includes(selectedCup.id);
                const isCellEmpty = clickedStack.length === 0;
                const isTopCupSmaller = !isCellEmpty && parseInt(clickedStack[clickedStack.length - 1].split('-')[2]) > selectedCupSize;

                // If a cup is being moved from the starting stack, apply the special rule
                if (isCupFromStartingStack) {
                    if (isCellEmpty || isTopCupSmaller) {
                        if (isMoveValid(cellIndex, selectedCup, gridCells)) {
                            // Proceed with the move from the starting stack
                            const newGridCells = [...gridCells];
                            newGridCells[cellIndex] = [...clickedStack, selectedCup.id];
                            setGridCells(newGridCells);
                            //emit for SOCKET.io
                            setSelectedCup({ id: null, isSelected: false });
                            //switchTurn();
                            const moveData = {
                                room: roomCode, // Use the room code from props
                                cellIndex: cellIndex,
                                newGridCells: newGridCells
                            };

                            socket.emit('makeMove', moveData);
                            console.log(`${moveData}`);


                        } else {
                            // Invalid move from the starting stack
                            alert("Invalid Move: There must be 3 in a row to gobble from your hand.");
                        }
                    }
                } else {
                    // Logic for moving a piece that's already on the board
                    if (isCellEmpty || isTopCupSmaller) {
                        const newGridCells = gridCells.map((stack, index) => {
                            if (index === cellIndex) {
                                return [...stack, selectedCup.id];
                            } else {
                                return stack.filter(cupId => cupId !== selectedCup.id);
                            }
                        });
                        setGridCells(newGridCells);
                        //emit for SOCKET.io
                        setSelectedCup({ id: null, isSelected: false });
                        //switchTurn();
                        const moveData = {
                            room: roomCode, // Use the room code from props
                            cellIndex: cellIndex,
                            newGridCells: newGridCells
                        };

                        socket.emit('makeMove', moveData);
                    }
                }
            } else {
                // No cup is selected, select the top cup from the clicked cell
                console.log('Grid cell clicked:', cellIndex, 'Stack:', clickedStack);
                if (clickedStack.length > 0) {
                    const topCupId = clickedStack[clickedStack.length - 1];
                    setSelectedCup({ id: topCupId, isSelected: true });
                }
            }
        }
    };

    const handleLeaveRoom = () => {
        socket.emit('leaveRoom', roomCode);
        // Additional logic for redirecting the user, updating UI, etc.
    };

    useEffect(() => {
        const winningPlayer = checkForWin(gridCells);
        if (winningPlayer) {
            setWinner(winningPlayer);
            handleLeaveRoom();
        }
    }, [gridCells]);

    useEffect(() => {
        if (winner) {
            setTimeout(() => {
                alert(`${winner} wins!`);
                onReturnToLanding();
            }, 0);
        }
    }, [winner, onReturnToLanding]);

    return (
        <div className="mainpage">
            {!gameStarted && (
                <div className="waiting-message">
                    Waiting for opponent...
                </div>

            )}
            {!gameStarted && (
                <div className="typing-indicator1">
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                </div>
            )}
            {currentPlayer !== playerRole && currentPlayer === 'player2' && (
                <div className="typing-indicator2">
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                </div>
            )}
            {currentPlayer !== playerRole && currentPlayer === 'player1' && (
                <div className="typing-indicator1">
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                </div>
            )}
            <div className="game-board">
                <div className="grid">
                    {renderGrid(handleGridCellClick, gridCells, selectedCup)}
                </div>
            </div>
            <div className="playerstacks">
                {/* Player 1's Stacks */}
                <div className="player1stack">
                    {renderCupStack(4, 1, 1, handleCupClick, selectedCup, gridCells)} {/* Player 1, Stack 1 */}
                </div>
                <div className="player1stack1">
                    {renderCupStack(4, 1, 2, handleCupClick, selectedCup, gridCells)} {/* Player 1, Stack 2 */}
                </div>
                <div className="player1stack2">
                    {renderCupStack(4, 1, 3, handleCupClick, selectedCup, gridCells)} {/* Player 1, Stack 3 */}
                </div>

                {/* Player 2's Stacks */}
                <div className="player2stack">
                    {renderCupStack(4, 2, 1, handleCupClick, selectedCup, gridCells)} {/* Player 2, Stack 1 */}
                </div>
                <div className="player2stack1">
                    {renderCupStack(4, 2, 2, handleCupClick, selectedCup, gridCells)} {/* Player 2, Stack 2 */}
                </div>
                <div className="player2stack2">
                    {renderCupStack(4, 2, 3, handleCupClick, selectedCup, gridCells)} {/* Player 2, Stack 3 */}
                </div>
            </div>
        </div>
    );
};

const checkForWin = (gridCells) => {
    // Check each row
    for (let row = 0; row < boardSize; row++) {
        if (checkLineForWin(gridCells, row * boardSize, 1)) {
            return checkLineForWin(gridCells, row * boardSize, 1);
        }
    }

    // Check each column
    for (let col = 0; col < boardSize; col++) {
        if (checkLineForWin(gridCells, col, boardSize)) {
            return checkLineForWin(gridCells, col, boardSize);
        }
    }

    // Check diagonals
    if (checkLineForWin(gridCells, 0, boardSize + 1)) { // Top-left to bottom-right
        return checkLineForWin(gridCells, 0, boardSize + 1);
    }
    if (checkLineForWin(gridCells, boardSize - 1, boardSize - 1)) { // Top-right to bottom-left
        return checkLineForWin(gridCells, boardSize - 1, boardSize - 1);
    }

    return null; // No win detected
};

const checkLineForWin = (gridCells, startIndex, step) => {
    let player1Count = 0;
    let player2Count = 0;

    for (let i = 0; i < boardSize; i++) {
        const cell = gridCells[startIndex + i * step];
        if (cell.length > 0) {
            const topPiece = cell[cell.length - 1];
            if (topPiece.includes('player1')) {
                player1Count++;
                player2Count = 0;
            } else if (topPiece.includes('player2')) {
                player2Count++;
                player1Count = 0;
            } else {
                player1Count = 0;
                player2Count = 0;
            }

            if (player1Count === 4) return 'White';
            if (player2Count === 4) return 'Black';
        } else {
            player1Count = 0;
            player2Count = 0;
        }
    }

    return null; // No win in this line
};


const isMoveValid = (cellIndex, selectedCup, gridCells) => {
    const topPiece = gridCells[cellIndex].length > 0 ? gridCells[cellIndex][gridCells[cellIndex].length - 1] : null;
    const currentPlayer = selectedCup.id.includes('player1') ? 'player1' : 'player2';

    if (topPiece) {
        // Player 1's specific rule
        if (currentPlayer === 'player1' && topPiece.includes('player2')) {
            const playerTwoRows = checkForPlayerTwoRows(gridCells);
            if (!playerTwoRows.includes(cellIndex)) {
                return false; // Player 1 cannot cover Player 2's piece unless blocking a win
            }
        }

        // Player 2's specific rule (assuming similar logic)
        if (currentPlayer === 'player2' && topPiece.includes('player1')) {
            // Define and call a similar function for Player 2, if needed
            const playerOneRows = checkForPlayerOneRows(gridCells);
            if (!playerOneRows.includes(cellIndex)) {
                return false; // Player 2's specific rule
            }
        }
    }

    // If the cell is empty, or the move is valid according to the rules, allow the move
    return true;
};


const boardSize = 4; // Assuming a 4x4 board

const checkForPlayerTwoRows = (gridCells) => {
    const winningPositions = [];

    // Check rows
    for (let row = 0; row < boardSize; row++) {
        let playerTwoCount = 0;
        for (let col = 0; col < boardSize; col++) {
            const cell = gridCells[row * boardSize + col];
            if (cell.some(cupId => cupId.includes('player2'))) {
                playerTwoCount++;
            }
        }
        if (playerTwoCount >= 3) {
            for (let col = 0; col < boardSize; col++) {
                winningPositions.push(row * boardSize + col);
            }
        }
    }

    // Check columns
    for (let col = 0; col < boardSize; col++) {
        let playerTwoCount = 0;
        for (let row = 0; row < boardSize; row++) {
            const cell = gridCells[row * boardSize + col];
            if (cell.some(cupId => cupId.includes('player2'))) {
                playerTwoCount++;
            }
        }
        if (playerTwoCount >= 3) {
            for (let row = 0; row < boardSize; row++) {
                winningPositions.push(row * boardSize + col);
            }
        }
    }

    // Check diagonals
    const diagonals = [
        [0, 5, 10, 15], // Top-left to bottom-right
        [3, 6, 9, 12]   // Top-right to bottom-left
    ];

    diagonals.forEach((diagonal) => {
        let playerTwoCount = 0;
        diagonal.forEach(index => {
            const cell = gridCells[index];
            if (cell.some(cupId => cupId.includes('player2'))) {
                playerTwoCount++;
            }
        });
        if (playerTwoCount >= 3) {
            diagonal.forEach(index => {
                winningPositions.push(index);
            });
        }
    });

    return winningPositions;
};

const checkForPlayerOneRows = (gridCells) => {
    const winningPositions = [];

    // Check rows
    for (let row = 0; row < boardSize; row++) {
        let playerOneCount = 0;
        for (let col = 0; col < boardSize; col++) {
            const cell = gridCells[row * boardSize + col];
            if (cell.some(cupId => cupId.includes('player1'))) {
                playerOneCount++;
            }
        }
        if (playerOneCount >= 3) {
            for (let col = 0; col < boardSize; col++) {
                winningPositions.push(row * boardSize + col);
            }
        }
    }

    // Check columns
    for (let col = 0; col < boardSize; col++) {
        let playerOneCount = 0;
        for (let row = 0; row < boardSize; row++) {
            const cell = gridCells[row * boardSize + col];
            if (cell.some(cupId => cupId.includes('player1'))) {
                playerOneCount++;
            }
        }
        if (playerOneCount >= 3) {
            for (let row = 0; row < boardSize; row++) {
                winningPositions.push(row * boardSize + col);
            }
        }
    }

    // Check diagonals
    const diagonals = [
        [0, 5, 10, 15], // Top-left to bottom-right
        [3, 6, 9, 12]   // Top-right to bottom-left
    ];

    diagonals.forEach((diagonal) => {
        let playerOneCount = 0;
        diagonal.forEach(index => {
            const cell = gridCells[index];
            if (cell.some(cupId => cupId.includes('player1'))) {
                playerOneCount++;
            }
        });
        if (playerOneCount >= 3) {
            diagonal.forEach(index => {
                winningPositions.push(index);
            });
        }
    });

    return winningPositions;
};


const renderGrid = (handleGridCellClick, gridCells, selectedCup) => {
    if (!gridCells || gridCells.length !== 16) {
        return null; // or handle the error appropriately
    }

    const rows = [];
    for (let i = 0; i < 4; i++) {
        const cells = [];
        for (let j = 0; j < 4; j++) {
            const cellIndex = i * 4 + j;
            const stack = gridCells[cellIndex];

            cells.push(
                <div
                    key={cellIndex}
                    className="grid-cell"
                    onClick={(e) => handleGridCellClick(cellIndex, e)}
                >
                    {stack.map(cupId => {
                        // Determine the player based on the cupId
                        const playerClass = cupId.includes('player1') ? 'player1' : 'player2';
                        const isSelected = selectedCup.id === cupId && selectedCup.isSelected;
                        const cupSizeClass = `cup-${cupId.split('-').pop()}`;

                        return (
                            <div
                                key={cupId}
                                className={`cup ${playerClass} ${cupSizeClass} ${isSelected ? 'selected-cup' : ''}`}
                            >
                                {/* Cup content */}
                            </div>
                        );
                    })}
                </div>
            );
        }
        rows.push(<div key={i} className="grid-row">{cells}</div>);

    }

    return rows;
};




const renderCupStack = (stackSize, playerNumber, stackNumber, handleCupClick, selectedCup, gridCells) => {
    const cups = [];
    for (let i = 0; i < stackSize; i++) {
        const cupId = `player${playerNumber}-stack${stackNumber}-${i}`;
        const cupClass = `cup player${playerNumber}`;

        // Check if the cup is on the board
        const isOnBoard = gridCells.some(cellStack => cellStack.includes(cupId));

        if (!isOnBoard) {
            const isSelected = selectedCup.id === cupId && selectedCup.isSelected;
            cups.push(
                <div
                    key={cupId}
                    id={cupId}
                    className={`${cupClass} cup-${i} ${isSelected ? 'selected-cup' : ''}`}
                    onClick={(e) => handleCupClick(cupId, e)}
                >
                    {/* Cup content */}
                </div>
            );
        }
    }
    return cups;
};



export default GameBoard;