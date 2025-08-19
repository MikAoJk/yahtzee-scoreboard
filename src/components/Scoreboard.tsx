'use client';

import React, {useState} from 'react';

type ScoreCategory = {
    name: string;
    score: number;
};

const initialCategories: ScoreCategory[] = [
    {name: 'Ones', score: 0},
    {name: 'Twos', score: 0},
    {name: 'Threes', score: 0},
    {name: 'Fours', score: 0},
    {name: 'Fives', score: 0},
    {name: 'Sixes', score: 0},
    {name: 'Three of a Kind', score: 0},
    {name: 'Four of a Kind', score: 0},
    {name: 'Full House', score: 0},
    {name: 'Small Straight', score: 0},
    {name: 'Large Straight', score: 0},
    {name: 'Yahtzee', score: 0},
    {name: 'Chance', score: 0},
];

const bonusLimit = 84;
const bonusPoints = 100;

const Scoreboard = () => {
    const [categories, setCategories] = useState<ScoreCategory[]>(initialCategories);
    const [totalScore, setTotalscore] = useState<number>(0);

    const handleScoreChange = (index: number, score: number) => {
        const updatedCategories = [...categories];
        updatedCategories[index].score = score;
        setCategories(updatedCategories);
        const updatedTotalscore = calculateTotalscore();
        setTotalscore(updatedTotalscore);
        };
    
    

    function isBonus(): boolean {
        let tmpScore: number = 0

        categories.forEach(
            category => {
                if (category.name === 'Ones' || category.name === 'Twos' || category.name === 'Threes' || category.name === 'Fours' || category.name === 'Fives' || category.name === 'Sixes') {
                    tmpScore += category.score;
                }
            }
        )

        return tmpScore >= bonusLimit;

    }

    function calculateTotalscore() {
        if(isBonus()) {
            return  categories.map(category=>category.score).reduce((a,b)=>a+b) + bonusPoints;
        }
        else {
            return  categories.map(category=>category.score).reduce((a,b)=>a+b);

        }
    }


    return (
        <div className="flex min-h-screen flex-col p-16 md:items-center md:p-24">
            <h1 className="mb-8 text-4xl font-extrabold leading-none tracking-tight md:text-5xl lg:text-6xl dark:text-w">Yahtzee
                Scoreboard</h1>
            <table>
                <thead>
                <tr>
                    <th>Category</th>
                    <th>Score</th>
                </tr>
                </thead>
                <tbody>
                {categories.map((category, index) => (
                    <tr key={index}>
                        <td>{category.name}</td>
                        <td className="pb-5 mt-20">
                                <input
                                    type="number"
                                    className="w-16 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    value={category.score ?? 0}
                                    onChange={(e) => handleScoreChange(index, parseInt(e.target.value))}/>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
            <p>Total score: {totalScore}</p>
        </div>
    );
};

export default Scoreboard;
