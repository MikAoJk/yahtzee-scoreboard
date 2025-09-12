# yahtzee-scoreboard

A digital scoreboard for both Classic Yahtzee and Maxi Yatzy games, built with modern web technologies.

## Features

* **Dual Game Mode Support**: Switch between Classic Yahtzee and Maxi Yatzy
* **Multiple Players**: Add and manage multiple players with editable names
* **Automatic Scoring**: Calculates bonuses and totals automatically
* **Session Persistence**: Game mode, players, and scores are saved in browser localStorage
* **Responsive Design**: Works on desktop and mobile devices

### Game Modes

**Classic Yahtzee (5 dice)**
- Standard 13 categories: Ones through Sixes, Three of a Kind, Four of a Kind, Full House, Small Straight, Large Straight, Yahtzee, Chance
- Bonus: 50 points if upper section ≥ 63 points

**Maxi Yatzy (6 dice)**
- 16 categories: Ones through Sixes, One Pair, Two Pairs, Three Pairs, Small Straight (1-5), Large Straight (2-6), Full Straight (1-6), House (Full House), Tower (4 of a kind), Maxi Yatzy (5 of a kind), Chance
- Bonus: 50 points if upper section ≥ 84 points

## Technologies used

* NPM
* TypeScript
* Next.js
* Tailwind

## Getting Started

### Prerequisites

#### NPM

Make sure you have NPM installed
I recommend that you use, a package manager for installing npm:
https://nodejs.org/en/download/package-manager#nvm
or you can follow this guide:
https://docs.npmjs.com/downloading-and-installing-node-js-and-npm

You can check which npm version you have installed

```bash
npm --version
```

Install deps:

```bash
npm run build
```

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployed to GitHub pages

The application is live at: https://mikaojk.github.io/yahtzee-scoreboard

## Contact

This project is maintained by [CODEOWNERS](CODEOWNERS)

Questions and/or feature requests?
Please create an [issue](https://github.com/MikAoJk/yahtzee-scoreboard/issues)

## ✏️ Contributing

To get started, please fork the repo and checkout a new branch and create a pull request
