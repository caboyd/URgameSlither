/**
 * @namespace
 * @property {Number} port The port for the WebSocket Server
 * @property {String} path The path for the entry point of the WebSocket Server
 * @property {Number} bots The number of bots (Not Used)
 * @property {Number} maxConnections The number of max connectsion, includes LeaderboardObservers and Snakes
 * @property {String} highscoreName Default Highscore name
 * @property {String} highscoreMsg Default Highscore Message
 * @property {Number} food The number of Food allowed in the game
 * @property {Number} maxFoodColors The highest value the food color can be
 * @property {Number} minFoodSize The minimum size a food will get generated as
 * @property {Number} maxFoodSize The maximum size a food will get generated as
 * @property {Number} foodPerSpawn The max extra food to spawn per snake (Not Used)
 * @property {Number} gameRadius The size of the game world
 * @property {Number} sectorSize The size of a sector (Not Used)
 * @property {Number} gameUpdateRate  The number in milliseconds between each game update
 * @property {Number} snakeUpdateRate The number in milliseconds between each snake position update
 * @property {Number} leaderboardUpdateRate The number in milliseconds between each leaderboard update
 * @property {Number} worldUpdateRate The number in milliseconds between each world update
 * @property {Number} dataUpdateRate The number in milliseconds between each snake data update
 * @property {Number} nsp1 - The base speed of a snake
 * @property {Number} nsp2 - The amount of speed of a snake that is affected by its size
 * @property {Number} maxSpeed - The max speed of a snake (14 is max) Number must satisfy (x*18)< 255.
 * @property {Number} snakeStartSize - The number of parts a snake start with
 * @property {Number} spangdv Divider to calculate snake angular speed (Not Used)
 * @property {Number} foodToGrow The amount of food size needed to eat to grow 1 part
 * @property {Number} speedMult Speed Multiplier 
 * @property {Number} speedBonus A flat speed bonus
 * @property {Number} intervalRate The amount of milliseconds need before snake data is updated
 * @property {Number} shrinkFactor server side snake shrinking multiplier
 * @property {Array.<Number>} fmlts Used to calculate score of fullness of last part of snake
 * @property {Array.<Number>} fpsls Used to calculate Score for the number of parts a snake has
 */
var GameConfig = {
	port: 8080,
	path: '/game/socket',
	bots: 0, // Not Implemented
	maxConnections: 80,
	highscoreName: "How to change Highscore Msg",
	highscoreMsg: "Set this message in the config",
	food: 500,
	maxFoodColors: 8,
	minFoodSize: 25,
	maxFoodSize: 75,
	foodPerSpawn: 1000, // Not Implemented
	gameRadius: 2000,//21600,
	sectorSize: 300,
	gameUpdateRate: 40,
	snakeUpdateRate: 15,
	leaderboardUpdateRate: 4000,
	worldUpdateRate: 5000,
	dataUpdateRate: 1000,
	nsp1: 5.39,
	nsp2: 0.4,
	maxSpeed: 12,
	snakeStartSize: 2,
	spangdv: 4.8,
	foodToGrow: 200,
	speedMult: 1,
	speedBonus: 0,
	//5 seconds
	intervalRate: 5000,
	shrinkFactor: 1
};


(function setMscps(mscps ) {
	 mscps || (mscps = 411);
	fmlts = [mscps + 1 + 2048];
	fpsls = [mscps + 1 + 2048];

	for (var i = 0; i <= mscps; i++) {
		fmlts[i] = (i >= mscps ? fmlts[i - 1] : Math.pow(1 - 1.0 * i / mscps, 2.25));
		fpsls[i] = (i === 0 ? 0 : fpsls[i - 1] + 1.0 / fmlts[i - 1]);
	}

	var fmltsFiller = fmlts[mscps];
	var fpslsFiller = fpsls[mscps];

	for (var i = 0; i < 2048; i++) {
		fmlts[mscps + 1 + i] = fmltsFiller;
		fpsls[mscps + 1 + i] = fpslsFiller;
	}
	GameConfig["fpsls"] = fpsls;
	GameConfig["fmlts"] = fmlts;
})();

module.exports = GameConfig;