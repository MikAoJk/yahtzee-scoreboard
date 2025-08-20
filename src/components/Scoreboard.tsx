'use client';

import React, {useState, useEffect} from 'react';

type Player = {
    id: string;
    name: string;
};

type ScoreCategory = {
    name: string;
    scores: { [playerId: string]: number };
};

const categoryNames = [
    'Ones', 'Twos', 'Threes', 'Fours', 'Fives', 'Sixes',
    'Three of a Kind', 'Four of a Kind', 'Full House',
    'Small Straight', 'Large Straight', 'Yahtzee', 'Chance'
];

const createInitialCategories = (players: Player[]): ScoreCategory[] => {
    return categoryNames.map(name => ({
        name,
        scores: players.reduce((acc, player) => {
            acc[player.id] = 0;
            return acc;
        }, {} as { [playerId: string]: number })
    }));
};

const bonusLimit = 84;
const bonusPoints = 100;

// localStorage keys
const STORAGE_KEYS = {
    PLAYERS: 'yahtzee-scoreboard-players',
    CATEGORIES: 'yahtzee-scoreboard-categories'
};

// localStorage utility functions
const saveToLocalStorage = (key: string, data: Player[] | ScoreCategory[]): void => {
    try {
        if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem(key, JSON.stringify(data));
        }
    } catch (error) {
        console.warn('Failed to save to localStorage:', error);
    }
};

const loadFromLocalStorage = <T,>(key: string, defaultValue: T): T => {
    try {
        if (typeof window !== 'undefined' && window.localStorage) {
            const stored = localStorage.getItem(key);
            if (stored) {
                return JSON.parse(stored);
            }
        }
    } catch (error) {
        console.warn('Failed to load from localStorage:', error);
    }
    return defaultValue;
};

const Scoreboard = () => {
    const [players, setPlayers] = useState<Player[]>([
        { id: '1', name: 'Player 1' }
    ]);
    const [categories, setCategories] = useState<ScoreCategory[]>(() => 
        createInitialCategories([{ id: '1', name: 'Player 1' }])
    );

    // Load data from localStorage on component mount
    useEffect(() => {
        const storedPlayers = loadFromLocalStorage(STORAGE_KEYS.PLAYERS, [{ id: '1', name: 'Player 1' }]);
        const storedCategories = loadFromLocalStorage(STORAGE_KEYS.CATEGORIES, createInitialCategories([{ id: '1', name: 'Player 1' }]));
        
        setPlayers(storedPlayers);
        setCategories(storedCategories);
    }, []);

    // Save players to localStorage when players change
    useEffect(() => {
        saveToLocalStorage(STORAGE_KEYS.PLAYERS, players);
    }, [players]);

    // Save categories to localStorage when categories change
    useEffect(() => {
        saveToLocalStorage(STORAGE_KEYS.CATEGORIES, categories);
    }, [categories]);

    const handleScoreChange = (categoryIndex: number, playerId: string, score: number) => {
        const updatedCategories = [...categories];
        updatedCategories[categoryIndex].scores[playerId] = isNaN(score) ? 0 : score;
        setCategories(updatedCategories);
    };

    const addPlayer = () => {
        const newPlayerId = Date.now().toString();
        const newPlayer = { id: newPlayerId, name: `Player ${players.length + 1}` };
        
        const updatedPlayers = [...players, newPlayer];
        setPlayers(updatedPlayers);
        
        const updatedCategories = categories.map(category => ({
            ...category,
            scores: { ...category.scores, [newPlayerId]: 0 }
        }));
        setCategories(updatedCategories);
    };

    const removePlayer = (playerId: string) => {
        if (players.length <= 1) return; // Keep at least one player
        
        const updatedPlayers = players.filter(player => player.id !== playerId);
        setPlayers(updatedPlayers);
        
        const updatedCategories = categories.map(category => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { [playerId]: _, ...remainingScores } = category.scores;
            return { ...category, scores: remainingScores };
        });
        setCategories(updatedCategories);
    };

    const updatePlayerName = (playerId: string, newName: string) => {
        const updatedPlayers = players.map(player => 
            player.id === playerId ? { ...player, name: newName } : player
        );
        setPlayers(updatedPlayers);
    };
    
    

    function isBonus(playerId: string): boolean {
        let tmpScore: number = 0;

        categories.forEach(category => {
            if (['Ones', 'Twos', 'Threes', 'Fours', 'Fives', 'Sixes'].includes(category.name)) {
                tmpScore += category.scores[playerId] || 0;
            }
        });

        return tmpScore >= bonusLimit;
    }

    function calculateTotalScore(playerId: string): number {
        const totalScore = categories.reduce((total, category) => {
            return total + (category.scores[playerId] || 0);
        }, 0);

        return isBonus(playerId) ? totalScore + bonusPoints : totalScore;
    }


    return (
        <div className="flex min-h-screen flex-col p-16 md:items-center md:p-24">
            <h1 className="mb-8 text-4xl font-extrabold leading-none tracking-tight md:text-5xl lg:text-6xl dark:text-w">
                Yahtzee Scoreboard
            </h1>
            
            {/* Player Management Controls */}
            <div className="mb-6 flex flex-wrap gap-4 items-center">
                <button
                    onClick={addPlayer}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500"
                >
                    Add Player
                </button>
                {players.map(player => (
                    <div key={player.id} className="flex items-center gap-2">
                        <input
                            type="text"
                            value={player.name}
                            onChange={(e) => updatePlayerName(player.id, e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                        {players.length > 1 && (
                            <button
                                onClick={() => removePlayer(player.id)}
                                className="px-2 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Scoreboard Table */}
            <table className="border-collapse border border-gray-300 dark:border-gray-600">
                <thead>
                    <tr>
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Category</th>
                        {players.map(player => (
                            <th key={player.id} className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">
                                {player.name}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {categories.map((category, categoryIndex) => (
                        <tr key={categoryIndex}>
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 font-medium">
                                {category.name}
                            </td>
                            {players.map(player => (
                                <td key={player.id} className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                                    <input
                                        type="number"
                                        className="w-16 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block mx-auto p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        value={category.scores[player.id] ?? 0}
                                        onChange={(e) => handleScoreChange(categoryIndex, player.id, parseInt(e.target.value))}
                                    />
                                </td>
                            ))}
                        </tr>
                    ))}
                    {/* Bonus Row */}
                    <tr className="bg-gray-100 dark:bg-gray-800">
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 font-medium">
                            Bonus (if upper ≥ {bonusLimit})
                        </td>
                        {players.map(player => (
                            <td key={player.id} className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">
                                {isBonus(player.id) ? bonusPoints : 0}
                            </td>
                        ))}
                    </tr>
                    {/* Total Row */}
                    <tr className="bg-gray-200 dark:bg-gray-700 font-bold">
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                            Total Score
                        </td>
                        {players.map(player => (
                            <td key={player.id} className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">
                                {calculateTotalScore(player.id)}
                            </td>
                        ))}
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default Scoreboard;
