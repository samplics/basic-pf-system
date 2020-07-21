const crypto = require('crypto');

const serverSeed = "";
const publicSeed = "";
const gameID = "";

function getResults(serverSeed, publicSeed, gameID){
  const gameSeed = crypto.createHash('sha256').update(`${serverSeed}_${publicSeed}_${gameID}`).digest('hex');
  console.log(`Game Seed: ${gameSeed}`);
  const result = parseInt(gameSeed.substr(0, 8), 16) % 10000;
  console.log(`Game Result: ${result}`);
}

getResults(serverSeed, publicSeed, gameID);
