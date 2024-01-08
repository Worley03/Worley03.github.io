// GameBoard.js

import React, { useState } from 'react';
import './App.css';

const GameBoard = () => {
    const [selectedCup, setSelectedCup] = useState({ id: null, isSelected: false });
    const [gridCells, setGridCells] = useState(Array(16).fill(null));

    const handleCupClick = (cupId) => {
        setSelectedCup({ id: cupId, isSelected: true });
    };


    const handleGridCellClick = (cellIndex) => {
        if (selectedCup.isSelected) {
            const newGridCells = [...gridCells];

            // Check if the cup is already on the board and remove it from its current position
            const currentCupIndex = newGridCells.findIndex(cup => cup === selectedCup.id);
            if (currentCupIndex !== -1) {
                newGridCells[currentCupIndex] = null;
            }

            // Place the selected cup in the new cell
            newGridCells[cellIndex] = selectedCup.id;

            setGridCells(newGridCells);
            setSelectedCup({ id: null, isSelected: false }); // Reset selected cup
        }
    };

    return (
        <div className="mainpage">
            <div className="game-board">
                <div className="grid">
                    {renderGrid(handleGridCellClick, gridCells)}
                </div>
            </div>
            <div className="playerstacks">
                {/* Player 1's Stacks */}
                <div className="player1stack">
                    {renderCupStack(4, 1, 1, handleCupClick, selectedCup)} {/* Player 1, Stack 1 */}
                </div>
                <div className="player1stack1">
                    {renderCupStack(4, 1, 2, handleCupClick, selectedCup)} {/* Player 1, Stack 2 */}
                </div>
                <div className="player1stack2">
                    {renderCupStack(4, 1, 3, handleCupClick, selectedCup)} {/* Player 1, Stack 3 */}
                </div>

                {/* Player 2's Stacks */}
                <div className="player2stack">
                    {renderCupStack(4, 2, 1, handleCupClick, selectedCup)} {/* Player 2, Stack 1 */}
                </div>
                <div className="player2stack1">
                    {renderCupStack(4, 2, 2, handleCupClick, selectedCup)} {/* Player 2, Stack 2 */}
                </div>
                <div className="player2stack2">
                    {renderCupStack(4, 2, 3, handleCupClick, selectedCup)} {/* Player 2, Stack 3 */}
                </div>
            </div>
        </div>
    );
};

const renderGrid = (handleGridCellClick, gridCells) => {
    if (!gridCells || gridCells.length !== 16) {
        return null; // or handle the error appropriately
    }

    const rows = [];
    for (let i = 0; i < 4; i++) {
        const cells = [];
        for (let j = 0; j < 4; j++) {
            const cellIndex = i * 4 + j;
            const cupId = gridCells[cellIndex];

            // Extracting the size information from the cupId
            // Assuming cupId is something like 'player1-stack2-cup0'
            const cupSize = cupId ? cupId.split('-').pop() : null;

            cells.push(
                <div
                    key={cellIndex}
                    className="grid-cell"
                    onClick={() => handleGridCellClick(cellIndex)}
                >
                    {cupSize && (
                        <div className={`cup cup-${cupSize}`}>
                            {/* Add any cup content or styling as needed */}
                        </div>
                    )}
                </div>
            );
        }
        rows.push(<div key={i} className="grid-row">{cells}</div>);
    }
    return rows;
};




const renderCupStack = (stackSize, playerNumber, stackNumber, handleCupClick, selectedCup) => {
    const cups = [];
    for (let i = 0; i < stackSize; i++) {
        const cupId = `player${playerNumber}-stack${stackNumber}-${i}`; // cup size info as ${i}
        const isSelected = selectedCup && selectedCup.id === cupId && selectedCup.isSelected;
        cups.push(
            <div
                key={cupId}
                id={cupId}
                className={`cup cup-${i} ${isSelected ? 'selected-cup' : ''}`}
                onClick={() => handleCupClick(cupId)}
            >
                {/* Add any cup content or styling as needed */}
            </div>
        );
    }
    return cups;
};


export default GameBoard;