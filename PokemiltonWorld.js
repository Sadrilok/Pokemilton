
const PokemiltonArena = require('./PokemiltonArena')
const Pokemilton = require('./Pokemilton');
const { rawListeners } = require('process');

class PokemiltonWorld {
  constructor(json) {
    this.day = 1;
    this.logs = [];

    if (json) {
    this.reconstruct(json);
    }
  }

  reconstruct(json) {
    Object.assign(this, json);
 }

  /*The day is increased by 1.*/
  oneDayPasses () {
    this.day += 1;
    console.log(`\n☀️ Day ${this.day} in Pokemilton World:`);
  }
  
  /* false = Nothing happens → new day
  true = wild pokemilton */
  async randomizeEvent() {
    let event = Math.ceil(Math.random() * 100);
    if (event < 35) {
      console.log("😊 It's a peacefull day today ...\n");
      return false;
    } 
    else 
      return true;
  }
 
  /*A string is added to the logs array. 
  with the structure: "Day ${day}: ${log}". 
  Each time that a console.log is showned to the user, it should also be saved in the logs*/
  addLog(newLog){
    this.logs.push(`Day ${this.day}: ${newLog}`);
  }

  async goForAWalk(master) {
    let event = Math.random() * 100;
    // The player find an object
    if (event <= 40) {
      let randomItem = Math.random() * 100;
      if (randomItem <= 50) {
        console.log('\n➕ You find a healing item!');
        master.healingItems++;
      } else if (randomItem > 50 && randomItem <= 80) {
        console.log('\n➕ You find a revive item!');
        master.reviveItems++;
      } else {
        console.log('\n➕ You find a POKEBALL!');
        master.POKEBALLS++;
      }
    } 
    // A wild Pokemilton appears
    else if (event > 50 && event <= 60) {
      console.log(`\n⚠️ A wild Pokemilton appears !
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
    } 
    // Nothing happens
    else {
      console.log(`\n🌞 It's a beautiful day today!`)
      return 2;
    }
    return 1;
  }
}


module.exports = PokemiltonWorld
