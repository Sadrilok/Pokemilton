
const { clear } = require('console');
const Pokemilton = require('./Pokemilton');
const PokemiltonMaster = require('./PokemiltonMaster');
const { rawListeners } = require('process');
const saveGameState = require('./saveGameState');

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

class PokemiltonArena {
  constructor() {
    this.selected;
    this.place;       // sauvegarde pour liste du master
    this.wild = new Pokemilton();
    this.round = 1;
    this.winner;
    this.loser;
    this.tryToLeave = 0;
    this.actionRound = '';
    this.isEndBattle = false;
  }

  // player choose his pokemilton
  async choosePokemilton (master) {
    let choice = '';
    // if has many Pokemilton
    if (master.pokemiltonCollection.length > 1) {
      master.showCollection('all');
  
      while (choice == 0 || choice > master.pokemiltonCollection.length || choice.trim().length === 0 || choice.match(/^[0-9]+$/) == null) {
        choice = await new Promise((resolve) => {
          rl.question(`Enter the number of the Johnemon (1-${master.pokemiltonCollection.length}) `, resolve);
        });
      }
      choice--;
    }
    // if has only one
    else 
      choice = 0;

    this.place = choice;
  
    this.selected = this.copyPokemilton(master.pokemiltonCollection[choice]);
    
    console.log(`${master.name} sends out ${this.selected.name}! Let the battle begin!`)
  }

  // Get the selected Pokemilton as a Pokemilton object
  // Because when I take it back from the master's collection, it's an array
  copyPokemilton(pokemilton) {
    let copiedPokemilton = new Pokemilton();
    copiedPokemilton.name = pokemilton.name;
    copiedPokemilton.level = pokemilton.level;
    copiedPokemilton.experienceMeter = pokemilton.experienceMeter;
    copiedPokemilton.attackRange = pokemilton.attackRange;
    copiedPokemilton.defenseRange = pokemilton.defenseRange;
    copiedPokemilton.initHealthPool = pokemilton.initHealthPool;
    copiedPokemilton.healthPool = pokemilton.healthPool;
    copiedPokemilton.catchPhrase = pokemilton.catchPhrase;
    return copiedPokemilton;
  }

  // initialisation of the Arena
  async startArena (master) {
    clear();
    console.log("Let's fight !")
    console.log(`A wild level ${this.wild.level}, ${this.wild.name} appears ! It has ${this.wild.initHealthPool} health.`);
    
    await this.choosePokemilton(master);

    this.selected.sayCatchPhrase();
    await this.fightArena(master, true);
  }

  // Actions of rounds
  async fightArena(master, newRound) {
    if (newRound == true)
      this.isEndBattle = await this.startRound();
  
    if (this.isEndBattle == true) {
      if (this.actionRound == '4') {
        master.pokemiltonCollection[this.place] = this.selected;
        saveGameState(master, world);
      }
      else {
        this.logEndBattle(this.winner, this.loser);
      // If it the pokemilton's master who win
      if (master.pokemiltonCollection[this.place].name == this.winner.name) {
        this.winner.gainExperience(this.loser.level, world);
        master.pokemiltonCollection[this.place] = this.winner;
      } 
      // if it loses
      else {
        master.pokemiltonCollection[this.place] = this.loser;
      }
      master.pokemiltonCollection[this.place] = this.selected;
      saveGameState(master, world);
      return;
      }
    } 
    else {
      this.startNewRound();
      await this.fightArena(master, true);
    } 
  }

  /*Round menu*/
  async startRound() {
    this.actionRound = '';
  	console.log(`\n--- Round ${this.round} ---
    1. ⚔️  Attack
    2. 🤹🏻Try to catch
    3. 💖  Heal Pokemilton
    4. 🏃🏻Run away`);

    while (this.actionRound== 0 || this.actionRound> 4 || this.actionRound.trim().length === 0 || this.actionRound.match(/^[0-9]+$/) == null) {
      this.actionRound= await new Promise((resolve) => {
        rl.question('Enter the number of the action (1-4): ', resolve);
      })
    }

    switch(this.actionRound) {
      // attack the Pokemilton
      case '1':
        this.playerAttack();
        if (this.wild.healthPool == 0) {
          this.isEndBattle = true;
          this.winner = this.selected;
          this.loser = this.wild;
          break;
        }
        else {
          this.wildPokemiltonAction();
          this.isEndBattle = await this.checkBattleStatus(master);
          break;
        }
  
      // try to catch the Pokemilton
      case '2': 
        this.isEndBattle = this.tryToCatch(master, this.wild);
        if (this.isEndBattle == 0) {
          await this.fightArena(master, false);
        }
        else if (this.isEndBattle == true) {
          this.winner = this.selected;
          this.loser = this.wild;
        }
        break;
  
      // heal Pokemilton
      case '3':
        await master.healPokemilton(this.selected);
        this.wildPokemiltonAction();
        this.isEndBattle = await this.checkBattleStatus();
        break;
  
      // run
      case '4': 
        this.isEndBattle = this.tryToLeaveCombat();
        if (this.isEndBattle == false) {
            this.wildPokemiltonAction();
            this.isEndBattle = await this.checkBattleStatus(master);
        }
        break;
    }
    return this.isEndBattle;
  }


  // the player's pokemilton attack the wild
  playerAttack() {
    // 10% de rater son attaque
    let miss = Math.floor(Math.random() * 100);
    if (miss < 10) {
      console.log(`🤷🏻 ${this.selected.name} miss ${this.wild.name}!`)
    } else {
    let damage = this.selected.attack(this.wild);
    console.log(`⚔️ ${this.selected.name} attacks ${this.wild.name}! ${this.wild.name} loses ${damage} health, it has ${this.wild.healthPool} left.`);
    }
  }

  // master try to catch the wild pokemilton
  // if return 0 → no POKEBALL
  // if return true → catch it
  // if return false → miss it
  tryToCatch(master, pokemilton) {
    if (master.POKEBALLS == 0) {
      console.log('❌ You don\'t have any POKEBALL!')
      return 0;
    } else {
      master.POKEBALLS--;
      console.log(`🤹🏻${master.name} throws a POKEBALLS!`)
      let throwBall = Math.random() * 100;
      
      let probaToCatch = 100 - (pokemilton.healthPool / pokemilton.initHealthPool) * 100;
      if (throwBall <= probaToCatch) {
        console.log(`🎉 The wild ${pokemilton.name} has been caught! `)
        master.catchPokemilton(pokemilton);
        return true;
      } else {
        console.log(`🤷🏻 You miss the wild ${pokemilton.name}!`)
        return false;
      }
    }
  }

  tryToLeaveCombat() {
    if (this.tryToLeave > 2) {
      console.log('😠 You have to fight now! ')
      return false;
    }
      
    let probaToLeave = Math.floor(Math.random() * this.wild.level * 100);
    if (probaToLeave < 50 * this.wild.level) {
      
      console.log('😏 You can\'t leave!');
      this.tryToLeave++;
      return false;
    }
    else {
      console.log('🙄 You run from to combat, coward!')
      return true;
    }
  }

  // the wild pokemilton attack the player's pokemilton
  wildPokemiltonAction() {
    // 10% de rater son attaque
    let miss = Math.floor(Math.random() * 100);
    if (miss < 10) {
      console.log(`🐺🤷🏻 ${this.wild.name} miss ${this.selected.name}!`)
    }
    else {
      let damage = this.wild.attack(this.selected);
      console.log(`🐺⚔️ ${this.wild.name} attacks ${this.selected.name}! ${this.selected.name} loses ${damage} health, it has ${this.selected.healthPool} left.`);
    }
  }

  async checkBattleStatus(master) {
    // If the player loses
    if (this.selected.healthPool == 0) {
      master.pokemiltonCollection[this.place] = this.selected;
      // If he possess other Pokemilton
      if (master.pokemiltonCollection.length > 1) {
        console.log('💀 Your Pokemilton is dead!\n  1. Choose another Pokemilton\n  2. Finish battle');

        let answer = '';
        while (answer == 0 || answer > 2 || answer.trim().length === 0 || answer.match(/^[0-9]+$/) == null) {
          answer = await new Promise((resolve) => {
            rl.question('Your choice (1-2): ', resolve);
          });
        }
        switch (answer) {
          // Continue battle with another Pokemilton
          case '1':
            await this.choosePokemilton(master);
            return false;
          
          // End battle
          case '2':
            this.winner = this.wild;
            this.loser = this.selected;
            return true;
        }
      }
      // If he only has one Pokemilton
      else {
        this.winner = this.wild;
        this.loser = this.selected;
        return true;
      }
    }
    // if the wild Pokemilton loses 
    else if (this.wild.healthPool == 0) {
      this.winner = this.selected;
      this.loser = this.wild;
      return true;
    } else {
      return false;
    }
  }

  startNewRound() {
    this.round += 1;
  }

  // TODO: si fin bataille car attrapé poke, afficher le message !
  logEndBattle(winner, loser) {
    clear();
    console.log('\n--- Battle over ---');
    console.log(`👑 Winner : ${this.winner.name}`);
    console.log(`💀 Loser: ${this.loser.name}`);
    // si winner = poke du master → alors gagne xp
  }
}


module.exports = PokemiltonArena