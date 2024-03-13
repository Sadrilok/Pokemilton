const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

const clear = require('clear');

class PokemiltonMaster {
  constructor(name, json) {
    this.name = name;
    this.pokemiltonCollection = [];
    this.healingItems = 5;              // Initial number of healing items
    this.reviveItems = 3;               // Initial number of revive items
    this.POKEBALLS = 10;                // Initial number of POKEBALLS

    if (json) {
      this.reconstruct(json);
    }
  }

  reconstruct(json) {
    Object.assign(this, json);
  }

  // A Pokemilton™Master can rename a Pokemilton™ in its collection. 
  async renamePokemilton(pokemilton, name) {
    pokemilton.name = name;
    return 1;
  }

  // The player choose the Pokemilton to rename
  async processRename() {
    clear();
    let toSave = 0;
    let oldName;
    let newName = '';
    let choice = '';
  
    // If has many Pokemilton
    if (this.pokemiltonCollection.length > 1) {
      console.log(`Here's your Pokemiltons:`);
      this.showCollection('');
      
      while (choice == 0 || choice > this.pokemiltonCollection.length || choice.trim().length === 0 || choice.match(/^[0-9]+$/) == null) {
        choice = await new Promise((resolve) => {
          rl.question(`Which Pokemilton do you want to rename? (1-${this.pokemiltonCollection.length}) `, resolve);
        });
      }
      choice--;
    }
    // If has only one Pokemilton
    else 
      choice = 0;
  
    oldName = this.pokemiltonCollection[choice].name;
  
    while (newName.trim().length === 0) {
      newName = await new Promise((resolve) => {
        rl.question(`How do you want to rename ${oldName}? `, resolve);
      });
    }
    
    toSave = this.renamePokemilton(this.pokemiltonCollection[choice], newName);
    let logs = `${this.name} rename ${oldName} in ${newName}!`
    world.addLog(logs);
    return toSave;
  }

  /* A Pokemilton™Master can heal a Pokemilton™ in its collection. 
  This restores the Pokemilton™'s health pool to its original value.*/
  // This function return if the pokemilton can be healed (+ does it) or not
  async healPokemilton(pokemilton) {
    if (pokemilton.healthPool != pokemilton.initHealthPool && pokemilton.healthPool != 0) {
      if (this.healingItems > 0) {
        pokemilton.healthPool = pokemilton.initHealthPool;
        this.healingItems -= 1;
        console.log(`💖 Your Pokemilton is healed! You have ${this.healingItems} healing items left.`)
        return 1;
      }
      else {
        console.log('❌ You don\'t have any healing items left!');
        return 0;
      }
    } else if (pokemilton.healthPool == pokemilton.initHealthPool) {
      console.log('🌟 His health is already at his maximum!');
      return 0;
    } else {
      console.log('☠️ Your Pokemilton is dead, you have to revive it!')
      return 0;
    }
  }

  // When the player when to heal a Pokemilton, he has to choose it
  async processHeal() {
    clear();
    let toSave = 0;
    // If has many Pokemilton
    if (this.pokemiltonCollection.length > 1) {
      console.log(`Here's your Pokemiltons:`);
      this.showCollection(['initHealthPool', 'healthPool']);
  
      let choice = '';
      while (choice == 0 || choice > this.pokemiltonCollection.length || choice.trim().length === 0 || choice.match(/^[0-9]+$/) == null) {
        choice = await new Promise((resolve) => {
          rl.question(`Which Pokemilton do you want to heal? (1-${this.pokemiltonCollection.length}) `, resolve);
        });
      }
      toSave = this.healPokemilton(this.pokemiltonCollection[choice - 1]);
    } 
    // If has only one Poke
    else {
      toSave = this.healPokemilton(this.pokemiltonCollection[0])
    }
    return toSave;
  }

  /*A Pokemilton™Master can revive a Pokemilton™ in its collection. 
  This restores the Pokemilton™'s health pool to its original value.*/
  // This function return if the pokemilton can be revived (+ does it) or not
  async revivePokemilton(pokemilton) {
    if (pokemilton.healthPool == 0) {
      if (this.reviveItems != 0) {
        pokemilton.healthPool = Math.ceil(pokemilton.initHealthPool / 2);
        this.reviveItems -= 1;
        console.log(`🧟 Your Pokemilton is revived! You have ${this.reviveItems} revive items left.`)
        return 1;
      }
      else {
        console.log('❌ You don\'t have any revive items left!');
        return 0;
      }
    }
    else {
      console.log(`🤕 Your Pokemilton is not dead, you can still heal him!`);
      return 0;
    }
  }

  // When the player when to revive a Pokemilton, he has to choose it
  async processRevive() {
    clear();
    let toSave = 0;
    // If has many Pokemilton
    if (this.pokemiltonCollection.length > 1) {
      console.log(`Here's your Pokemiltons:`);
      this.showCollection(['initHealthPool', 'healthPool']);
  
      let choice = '';
      while (choice == 0 || choice > this.pokemiltonCollection.length || choice.trim().length === 0 || choice.match(/^[0-9]+$/) == null) {
        choice = await new Promise((resolve) => {
          rl.question(`Which Pokemilton do you want to revive? (1-${this.pokemiltonCollection.length}) `, resolve);
        });
      }
      toSave = this.revivePokemilton(this.pokemiltonCollection[choice - 1]);
    }
    // If has only one
    else {
      toSave = this.revivePokemilton(this.pokemiltonCollection[0]);
    }
    return toSave;
  }
  
  /*A Pokemilton™Master can catch a Pokemilton™. 
  This adds the Pokemilton™ to the Pokemilton™Master's collection.*/
  catchPokemilton(pokemilton) {
    this.pokemiltonCollection.push(pokemilton);
    let logs = `${this.name} received ${this.pokemiltonCollection[0].name}!`
    console.log('➕ ' + logs);
    world.addLog(logs);
  }

  /* A Pokemilton™Master can release a Pokemilton™ from its collection. 
  This removes the Pokemilton™ from the Pokemilton™Master's collection.*/
  async releasePokemilton(pokemilton) {
    const index = this.pokemiltonCollection.indexOf(pokemilton);
    this.pokemiltonCollection.splice(index, 1);
    return 1;
  }
  
  // the player choose which Pokemilton to release
  // Error if only one left
  async processRelease() {
    clear();
    let toSave = 0;
    // If has many Pokemilton
    if (this.pokemiltonCollection.length > 1) {
      console.log(`Here\'s your Pokemiltons:`)
      this.showCollection(['all']);
  
      let choice = '';
      while (choice == 0 ||choice > this.pokemiltonCollection.length || choice.trim().length === 0 || choice.match(/^[0-9]+$/) == null) {
        choice = await new Promise((resolve) => {
          rl.question(`Which Pokemilton do you want to release? (1-${this.pokemiltonCollection.length}) `, resolve);
        });
      }
      toSave = this.releasePokemilton(this.pokemiltonCollection[choice - 1]);
    } 
    // if has only one poke → can't release !
    else {
      console.log('You only have one Pokemilton left!');
    }
    return toSave;
  }

  /*The Pokemilton™Master's collection is displayed in the console.*/
  showCollection(arr) {
    console.log(`👦🏻${this.name}'s collection: `) 
    for (let i = 0; i < this.pokemiltonCollection.length; i++) {
        let stat = `[${i+1}] ${this.pokemiltonCollection[i].name}`;

        if (arr.includes('level'))
          stat += ` - ✨ level: ${this.pokemiltonCollection[i].level}`;
        if (arr.includes('attackRange'))
          stat += ` - 💥 attack range: ${this.pokemiltonCollection[i].attackRange}`;
        if (arr.includes('defenseRange'))
          stat += ` - 🛡️ defense range: ${this.pokemiltonCollection[i].defenseRange}`;
        if (arr.includes('initHealthPool'))
          stat += ` - 💖 initial Health Pool: ${this.pokemiltonCollection[i].initHealthPool}`;
        if (arr.includes('healthPool'))
          stat += ` - ❤️ Health Pool: ${this.pokemiltonCollection[i].healthPool}`;
        if (arr.includes('all'))
          stat += ` - ✨ level: ${this.pokemiltonCollection[i].level} - 💥 attack range: ${this.pokemiltonCollection[i].attackRange} - 🛡️ defense range: ${this.pokemiltonCollection[i].defenseRange} - 💖 initial Health Pool: ${this.pokemiltonCollection[i].initHealthPool} - ❤️ Health Pool: ${this.pokemiltonCollection[i].healthPool}`;

        console.log(stat);
    }
  }

  showItems() {
    console.log(`👦🏻${this.name}'s items: `);
    console.log(`Healing items: ${this.healingItems}`)
    console.log(`Revive items: ${this.reviveItems}`)
    console.log(`POKEBALLS: ${this.POKEBALLS}`)
  }
}

module.exports = PokemiltonMaster