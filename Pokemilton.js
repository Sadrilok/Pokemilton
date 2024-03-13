const students = 
["Sop", "hie",
  "Man", "on",
  "Quen", "tin",
  "Sam", "uel",
  "Jona", "than",
  "Dan", "iel",
  "Cyr", "il",
  "Dam", "ien",
  "Auré", "liane",
  "Den", "is",
  "Emi", "lie",
  "Jér", "ôme",
  "Quen", "tin",
  "Nat", "alya",
  "Auré", "lien",
  "Chris", "tophe",
  "Gil", "les",
  "Cél", "ine",
  "Mari", "lou",
  "Lou", "is",
  "Math", "ilde",
  "Enk", "elan",
  "Ma", "rc",
  "Yas", "mine",
  "Sam", "uel",
  "Thom", "as",
  "Jul", "ien",
  "Greg", "ory",
  "Cyr", "ille",
  "Ken", "ny"
]

class Pokemilton {
  constructor() {
    this.name = this.generateRandomName();
    this.level = 1;
    this.experienceMeter = 0;
    this.attackRange = this.getRandomNumber(1, 8);
    this.defenseRange = this.getRandomNumber(1, 3);
    this.initHealthPool = this.getRandomNumber(10, 30);
    this.healthPool = this.initHealthPool;
    this.catchPhrase = this.generateCatchPhrase();
  }

  generateRandomName() {
    const randomStudent1 = students[Math.floor(Math.random() * students.length)];
    const randomStudent2 = students[Math.floor(Math.random() * students.length)];
    let name = `${randomStudent1}${randomStudent2}`;
    name = name.toLowerCase();
    name = name.charAt(0).toUpperCase() + name.slice(1)
    return name;
  }

  getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  generateCatchPhrase() {
    const phrases = ["I choose you!", "Let the battle begin!", "Pokemilton, go!"];
    return phrases[Math.floor(Math.random() * phrases.length)];
  }

  /* A Pokemilton™ can attack another Pokemilton™. 
  The damage done is a random number between the attacker's attack range 
  times its current level and reduced by the defender's defense range. 
  The defender's health pool is reduced by this amount.*/
  attack(defender) {
    let baseDamage = this.getRandomNumber(this.attackRange * this.level, this.attackRange) - defender.defenseRange + 1;
    let damage = baseDamage + this.getRandomNumber(-2, 2);
    if (damage < 0)
      damage *= -1;

    defender.healthPool -= damage;
    if (defender.healthPool < 0)
      defender.healthPool = 0;
    //console.log(`${this.name} attacks ${defender.name}! ${defender.name} loses ${damage} health, it has ${defender.healthPool} left.`);
    return damage;
  }   

  /* A Pokemilton™ can gain experience. 
  The experience meter is increased by a random number between 1 and 5 times the opposite Pokemilton™'s level.*/
  gainExperience(opponentLevel, world) {
    const experienceGain = this.getRandomNumber(1, 5) * opponentLevel;
    this.experienceMeter += experienceGain;
    console.log(`⬆️ ${this.name} gained ${experienceGain} experience points!`);
    console.log(`⬆️ ${this.name} has now ${this.experienceMeter}!`);
    if (this.experienceMeter >= this.level * 100)
      this.evolve(world);
    else 
      console.log(`✨ ${this.level * 100 - this.experienceMeter} left before level up!`);
  }

  /*When the experience level of a Pokemilton™ equals its current level times 100, it can evolve. 
  This increases its level by 1 and increases its attack range, defense range, and health pool by a random number between 1 and 5.*/
  evolve(world) {
    this.level += 1;
    const attackIncrease = this.getRandomNumber(1, 5);
    const defenseIncrease = this.getRandomNumber(1, 5);
    const healthIncrease = this.getRandomNumber(1, 5);

    this.attackRange += attackIncrease;
    this.defenseRange += defenseIncrease;
    this.healthPool += healthIncrease;

    console.log(`✨ ${this.name} evolved into a higher level! New stats: Level ${this.level}, Attack Range ${this.attackRange}, Defense Range ${this.defenseRange}, Health Pool ${this.healthPool}`);
    let logs = `${this.name} evolve to level ${this.level}!`;
    world.addLog(logs);
  }

  /*A Pokemilton™ can say its catch phrase.*/
  sayCatchPhrase() {
    console.log(`💬 "${this.catchPhrase}"`);
  }
}


module.exports = Pokemilton
