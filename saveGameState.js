const fs = require('fs');

// Saving current game
function saveGameState (master, world) {
    const saveData = {
      save_on: new Date().toISOString(),
      PokemiltonWorld: world,
      PokemiltonMaster: master
    }
    fs.writeFileSync('save.json', JSON.stringify(saveData, null, 2));
    console.log('Game state saved!\n');
  }

  module.exports = saveGameState;