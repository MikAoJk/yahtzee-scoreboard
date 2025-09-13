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

type GameMode = 'classic' | 'maxi';

const classicCategoryNames = [
    'Ones', 'Twos', 'Threes', 'Fours', 'Fives', 'Sixes',
    'Three of a Kind', 'Four of a Kind', 'Full House',
    'Small Straight', 'Large Straight', 'Yahtzee', 'Chance'
];

const maxiCategoryNames = [
    'Ones', 'Twos', 'Threes', 'Fours', 'Fives', 'Sixes',
    'One Pair', 'Two Pairs', 'Three Pairs', 'Small Straight (1-5)',
    'Large Straight (2-6)', 'Full Straight (1-6)', 'House (Full House)',
    'Tower (4 of a kind)', 'Maxi Yatzy (5 of a kind)', 'Chance'
];

const getCategoryNames = (mode: GameMode): string[] => {
    return mode === 'classic' ? classicCategoryNames : maxiCategoryNames;
};

const createInitialCategories = (players: Player[], mode: GameMode): ScoreCategory[] => {
    const categoryNames = getCategoryNames(mode);
    return categoryNames.map(name => ({
        name,
        scores: players.reduce((acc, player) => {
            acc[player.id] = 0;
            return acc;
        }, {} as { [playerId: string]: number })
    }));
};

const getGameModeConfig = (mode: GameMode) => {
    return {
        bonusLimit: mode === 'classic' ? 63 : 84,
        bonusPoints: mode === 'classic' ? 50 : 100,
        title: mode === 'classic' ? 'Yahtzee Scoreboard' : 'Maxi Yatzy Scoreboard'
    };
};

// localStorage keys
const STORAGE_KEYS = {
    PLAYERS: 'yahtzee-scoreboard-players',
    CATEGORIES: 'yahtzee-scoreboard-categories',
    GAME_MODE: 'yahtzee-scoreboard-game-mode'
};

// localStorage utility functions
const saveToLocalStorage = <T,>(key: string, data: T): void => {
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
    const [gameMode, setGameMode] = useState<GameMode>('classic');
    const [players, setPlayers] = useState<Player[]>([
        { id: '1', name: 'Player 1' }
    ]);
    const [categories, setCategories] = useState<ScoreCategory[]>(() => 
        createInitialCategories([{ id: '1', name: 'Player 1' }], 'classic')
    );

    const gameConfig = getGameModeConfig(gameMode);

    // Load data from localStorage on component mount
    useEffect(() => {
        const storedGameMode = loadFromLocalStorage(STORAGE_KEYS.GAME_MODE, 'classic' as GameMode);
        const storedPlayers = loadFromLocalStorage(STORAGE_KEYS.PLAYERS, [{ id: '1', name: 'Player 1' }]);
        const storedCategories = loadFromLocalStorage(STORAGE_KEYS.CATEGORIES, createInitialCategories([{ id: '1', name: 'Player 1' }], storedGameMode));
        
        setGameMode(storedGameMode);
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

    // Save game mode to localStorage when it changes
    useEffect(() => {
        saveToLocalStorage(STORAGE_KEYS.GAME_MODE, gameMode);
    }, [gameMode]);

    const handleScoreChange = (categoryIndex: number, playerId: string, inputValue: string) => {
        const updatedCategories = [...categories];
        
        // Handle empty input as 0
        if (inputValue === '') {
            updatedCategories[categoryIndex].scores[playerId] = 0;
        } else {
            // Remove leading zeros and convert to number
            const cleanedValue = inputValue.replace(/^0+/, '') || '0';
            const score = parseInt(cleanedValue, 10);
            updatedCategories[categoryIndex].scores[playerId] = isNaN(score) ? 0 : score;
        }
        
        setCategories(updatedCategories);
    };

    const switchGameMode = (newMode: GameMode) => {
        if (newMode === gameMode) return;
        
        setGameMode(newMode);
        
        // Reset categories when switching game mode
        const updatedCategories = createInitialCategories(players, newMode);
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

        return tmpScore >= gameConfig.bonusLimit;
    }

    function calculateTotalScore(playerId: string): number {
        const totalScore = categories.reduce((total, category) => {
            return total + (category.scores[playerId] || 0);
        }, 0);

        return isBonus(playerId) ? totalScore + gameConfig.bonusPoints : totalScore;
    }


    return (
        <div className="flex min-h-screen flex-col p-16 md:items-center md:p-24">
            <h1 className="mb-8 text-4xl font-extrabold leading-none tracking-tight md:text-5xl lg:text-6xl dark:text-white">
                {gameConfig.title}
            </h1>
            
            {/* Game Mode Selector */}
            <div className="mb-6 flex flex-wrap gap-4 items-center justify-center">
                <div className="flex items-center gap-2">
                    <label className="text-lg font-medium">Game Mode:</label>
                    <div className="flex gap-2">
                        <button
                            onClick={() => switchGameMode('classic')}
                            className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                                gameMode === 'classic'
                                    ? 'bg-blue-500 text-white border-blue-500'
                                    : 'bg-white text-blue-500 border-blue-500 hover:bg-blue-50 dark:bg-gray-700 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-gray-600'
                            }`}
                        >
                            Classic Yahtzee
                        </button>
                        <button
                            onClick={() => switchGameMode('maxi')}
                            className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                                gameMode === 'maxi'
                                    ? 'bg-purple-500 text-white border-purple-500'
                                    : 'bg-white text-purple-500 border-purple-500 hover:bg-purple-50 dark:bg-gray-700 dark:text-purple-400 dark:border-purple-400 dark:hover:bg-gray-600'
                            }`}
                        >
                            Maxi Yatzy
                        </button>
                    </div>
                </div>
            </div>
            
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
                                        value={category.scores[player.id] === 0 ? '' : category.scores[player.id] ?? ''}
                                        onChange={(e) => handleScoreChange(categoryIndex, player.id, e.target.value)}
                                    />
                                </td>
                            ))}
                        </tr>
                    ))}
                    {/* Bonus Row */}
                    <tr className="bg-gray-100 dark:bg-gray-800">
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 font-medium">
                            Bonus (if upper ≥ {gameConfig.bonusLimit})
                        </td>
                        {players.map(player => (
                            <td key={player.id} className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">
                                {isBonus(player.id) ? gameConfig.bonusPoints : 0}
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
