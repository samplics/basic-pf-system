# basic-pf-system
Basic Provably fair system for custom roulette game roughly based off of csgo empire's

example.js is just using node-chron to generate a game every 30 seconds, and new server info once a day at midnight

generates numbers for a dice-like roulette game where you bet on a range of numbers
just uses sha256 hashes, so you could easily get different number formats from the hashes
uses mongodb to store all information, im not super good with databases lol

check.js is a code example you would give to the client to check the game results.

[![Run on Repl.it](https://repl.it/badge/github/samplics/basic-pf-system)](https://repl.it/github/samplics/basic-pf-system)