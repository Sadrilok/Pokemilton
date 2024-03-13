const PokemiltonWorld = require ('./PokemiltonWorld')
const Pokemilton = require('./Pokemilton')
const PokemiltonMaster = require('./PokemiltonMaster');
const PokemiltonArena = require('./PokemiltonArena');
const saveGameState = require('./saveGameState');

const fs = require('fs');
const { promises } = require('dns');
const { resolve } = require('path');

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

const clear = require('clear');

// ********** Saved game **********
// Load previous game
function loadPreviousGame () {
  // Read the file and parse the JSON
  let save = JSON.parse(fs.readFileSync('save.json', 'utf8'));
  if (save) {
    const worldData = save.PokemiltonWorld;
    const masterData = save.PokemiltonMaster;

    world = new PokemiltonWorld(worldData);
    world.reconstruct(worldData);

    master = new PokemiltonMaster(masterData);
    master.reconstruct(masterData);
    
    console.log('Loaded previous game. Continue your adventure!');
    console.log(world)
    console.log(master)
  } else {
    console.log('Error while loading previous game...')
  }

  return [master, world];
}

// ********** New game **********
// Player name
async function askForName () {
  let answer = '';

  while (answer.trim().length === 0) {
    answer = await new Promise((resolve) => {
      rl.question('👋🏻Welcome to the Pokemilton World! What\'s your name, Pokemilton Master ? ', resolve);
    });
  }
  answer = answer.trim();
  
  console.log(`🫡 Hello, ${answer}! Let your Pokemilton adventure begin!\n`);
  return answer;
}

// First Pokemilton
async function proposeFirstPokemilton (master, world) {
  const pokeChoices = [new Pokemilton(), new Pokemilton(), new Pokemilton()];

  for (let i = 0; i < 3; i++) {
    console.log(`[${i+1}] ${pokeChoices[i].name} - ✨ level: ${pokeChoices[i].level} - 💥 attack range: ${pokeChoices[i].attackRange} - 🛡️ defense range: ${pokeChoices[i].defenseRange} - 💖 initial Health Pool: ${pokeChoices[i].initHealthPool}`)
  }

  let answer = '';
  while (answer == 0 || answer > 3 || answer.trim().length === 0 || answer.match(/^[0-9]+$/) == null) {
    answer = await new Promise((resolve) => {
      rl.question('Choose your first Pokemilton (1-3): ', resolve);
    });
  }
  
  master.catchPokemilton(pokeChoices[answer-1]);
}

// Step for a new game
async function startNewGame () {
  world = new PokemiltonWorld();
  const name = await askForName();
  master = new PokemiltonMaster(name);
  await proposeFirstPokemilton(master, world);
  saveGameState(master, world);
  return [master, world];
}

// ********** Main functions **********
// Start new game
async function startGame () {
  clear();

  // Check if a game is already saved
  if (fs.existsSync('save.json')) {
    console.log(`❗ Previous game found!
    1. Load previous game
    2. Start a new game`);

    let answer = '';
    while (answer == 0 || answer > 2 || answer.trim().length === 0 || answer.match(/^[0-9]+$/) == null) {
      answer = await new Promise((resolve) => {
        rl.question('Choose and option (1-2): ', resolve);
      });
    }

    switch (answer) {
      case '1':
        [master, world] = loadPreviousGame();
        break;
      case '2':
        [master, world] = await startNewGame();
        break;
      }
    } else {
    await startNewGame();
  }
  return [master, world];
}

// Display menu + choice
async function menuActions (world, master, recall) {
  // clear();
  if (recall == false)
    world.oneDayPasses();

  let displayAgain = false;

  console.log(`\nWhat do you want to do today ?
  1. 💖   Heal Pokemilton
  2. 🧟   Revive Pokemilton
  3. 💨   Release Pokemilton
  4. 🏷️   Rename Pokemilton
  5. 🐾   See your Pokemilton
  6. 🎒   See your items
  7. 🚶🏻 Go for a walk
  8. 💤   Do nothing
  9. 👋🏻 Leave game`);

  let answer = '';
  while (answer == 0 || answer > 9 || answer.trim().length === 0 || answer.match(/^[0-9]+$/) == null) {
    answer = await new Promise((resolve) => {
      rl.question('Choose an option (1-9): ', resolve);
    });
  }
  
  let toSave = '0';
  switch (answer) {
    case '1':
      toSave = await master.processHeal();
      break;

    case '2':
      toSave = await master.processRevive();   
      break;

    case '3':
      toSave = await master.processRelease();
      break;

    case '4':
      toSave = await master.processRename();
      break;

    case '5':
      clear();
      master.showCollection(['all']);
      displayAgain = true;
      break;

    case '6':
      clear();
      master.showItems();
      displayAgain = true;
      break;

    case '7':
      toSave = await world.goForAWalk(master);
      break;

    case '8':
      console.log('\nYou decide to do nothing today. The day passes.');
      toSave = 2;
      break;

    case '9':
      console.log('👋🏻 See you soon in the Pokemilton World!');
      // Ensure game state is saved
      if (toSave == 1)
        saveGameState(master, world);
      rl.close();
      process.exit(1);
    }

    if (toSave == 0) {                    // → 0 = pas de sauvegarde
      displayAgain = true;
    } else if (toSave == 1) {             // → 1 = sauvegarde
      saveGameState(master, world);
    }                                     // else if (toSave == 2) → no action, day continue

    if (displayAgain)
      await menuActions(world, master, true);

    let fight = await world.randomizeEvent();

    switch (fight) {
      case false:
        // new day
        await menuActions(world, master, false);
        break;
      
      // Arena !
      case true:
        console.log(`⚠️ A wild Pokemilton appears !
        1. 💥 Fight !
        2. 🏃🏻Run`);

        let answer = '';
        while (answer == 0 || answer > 2 || answer.trim().length === 0 || answer.match(/^[0-9]+$/) == null) {
          answer = await new Promise((resolve) => {
            rl.question('Choose an option (1-2) ', (resolve));
          });
        }

        if (answer == 1) {
          let arena = new PokemiltonArena();
          await arena.startArena(master);
          await menuActions (world, master, false);
        }
        else {
          console.log('🙄 You decided to run ...');
          await menuActions(world, master, false);
        }
        break;
    }
}

(async () => {
  let master, world;
  [master, world] = await startGame();
  await menuActions(world, master, false);
})();