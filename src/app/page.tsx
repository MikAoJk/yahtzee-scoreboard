import Head from 'next/head';
import Scoreboard from '../components/Scoreboard';

export default function Home() {
  return (
      <div>
        <Head>
          <title>Yahtzee Scoreboard</title>
          <meta name="description" content="A simple Yahtzee scoreboard"/>
          <link rel="icon" href="/favicon.ico"/>
        </Head>
        <main>
          <Scoreboard/>
        </main>
      </div>
  );
}
