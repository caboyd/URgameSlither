const World = require("./world");
const Leaderboard = require("../subjects/leaderboard");
const Snake = require("./snake");
const LeaderboardObserver = require("../observers/leaderboardObserver");
const EventEmitter = require('events');
const config = require('../config/config');
const message = require('../utils/message');
const math = require('../utils/math');



/**
 * @classdesc Represents a Snake Game
 * @class
 * @extends {EventEmitter}
 */
class Game extends EventEmitter {
	constructor() {
		super();
		/**
		 *
		 * @type {Date}
		 * @private
		 */
		this._lastUpdateSnakes = Date.now();
		/**
		 *
		 * @type {Date}
		 * @private
		 */
		this._lastUpdateSnakesData = Date.now();
		/**
		 *
		 * @type {number}
		 * @private
		 */
		this._count = 0;
		/**
		 *
		 * @type {number}
		 * @private
		 */
		this._fast_count = 0;
		/**
		 *
		 * @type {World}
		 * @private
		 */
		this._world = new World();
		/**
		 *
		 * @type {Array.<Snake>}
		 * @private
		 */
		this._snakes = [];
		/**
		 *
		 * @type {Leaderboard}
		 * @private
		 */
		this._leaderboard = new Leaderboard();
		/**
		 *
		 * @type {Map.<LeaderboardObserver>}
		 * @private
		 */
		this._leaderboardObservers = new Map();

	}

	/**
	 * @returns {World}
	 */
	get world() {
		return this._world;
	}


	/**
	 * Starts setInterval for the following game loops
	 * game update (Collision)
	 * snake updates (Snake Position)
	 * leaderboard updates
	 * snakedata updates (Snake Data Recording)
	 * world updates (Generating Food)
	 */
	startGame() {
		setInterval(this._update.bind(this), config["gameUpdateRate"]);
		setInterval(this._updateSnakes.bind(this), config["snakeUpdateRate"]);
		setInterval(this._updateLeaderboard.bind(this), config["leaderboardUpdateRate"]);
		setInterval(this._updateSnakesData.bind(this), config["dataUpdateRate"]);
		setInterval(this._updateWorld.bind(this), config["worldUpdateRate"]);
	}

	/**
	 * Calls _killSnake for the corresponding client id if it exists.
	 * Removes the leaderboardObserver corresponding to the client id from the
	 * leaderboard Subject and deletes the leaderboardObserver.
	 * @param {Number} id The id of a Client that has connecting and will have either a corresponding {@link Snake} or {@link LeaderboardObserver}
	 */
	clientClose(id) {
		let snake = this._snakes[id];
		if (snake !== undefined) {
			console.log(id + " removed snake");
			this._killSnake(id);

		}

		let lo = this._leaderboardObservers.get(id);
		if (lo !== undefined) {
			this._leaderboard.detach(lo);
			this._leaderboardObservers.delete(id);
		}


	}

	/**
	 * Calls update on the world
	 * This function is called from a setInterval at a specified rate in the StartGame function
	 * @private
	 */
	_updateWorld() {
		this._world.update();
	}

	/**
	 * Calls updateData on every snake in the game passing it a delta time
	 * This function is called from a setInterval at a specified rate in the StartGame function
	 * @private
	 */
	_updateSnakesData() {
		let now = Date.now();
		let deltaTime = now - this._lastUpdateSnakesData;
		this._lastUpdateSnakesData = now;
		this._snakes.forEach(snake => {
			snake.updateData(deltaTime);
		});
	}

	/**
	 * Calls update on every snake in the game passing it a delta time
	 * Increments the counts for the different snake update types
	 * When _fast_count mod 5 is 0, boosted snakes will be updated
	 * When _count mod 12 is 0, non-boosted snakes will be updated
	 * This function is called from a setInterval at a specified rate in the StartGame function
	 * @private
	 */
	_updateSnakes() {
		let now = Date.now();
		let deltaTime = now - this._lastUpdateSnakes;
		this._lastUpdateSnakes = now;

		this._count += 1;
		this._fast_count += 1;
		this._count %= 12;
		this._fast_count %= 10;

		if (parseInt(this._fast_count) % 5 == 0
				|| parseInt(this._count) % 12 == 0) {
			this._snakes.forEach(snake => {
				snake.update(deltaTime, this._count, this._fast_count);
			});
		}
	}

	/**
	 * Calls the _detectCollisions Function
	 * @private
	 */
	_update() {
		this._detectCollisions();
	}

	/**
	 * Updates the leaderboard using a list of the snakes sorted by size descending.
	 * Top 10 snakes have a name and score array that is JSON stringified and placed in the leaderboard.
	 * @fires Game#leaderboardUpdate
	 * @private
	 */
	_updateLeaderboard() {
		//Removes nulls from the snakes array
		this._snakes.filter(function (e) {
			return e;
		});
		//If no snakes in game
		if (Object.keys(this._snakes).length <= 0) {
			this._leaderboard.setState(JSON.stringify([{name: "No one is playing", score: 0}]));
			return;
		}

		//Copy array
		let topSnakes = Array.from(this._snakes);

		//Sort array by snake length descending
		topSnakes.sort(function (a, b) {
			return b.length - a.length;
		});

		//Remove any null snakes if they exist
		topSnakes = topSnakes.filter(function (e) {
			return e
		});


		this.emit("leaderboardUpdate", topSnakes);

		//Chop array to only top 10 snakes
		topSnakes.slice(0, 10);

		//Modify the snakes so the objects only contain the snake name and score
		var cleanSnakes = [];
		for (var i = 0; i < topSnakes.length; i++) {
			cleanSnakes[i] = {name: topSnakes[i].name, score: topSnakes[i].getScore()};
		}

		//Update the leaderboard
		this._leaderboard.setState(JSON.stringify(cleanSnakes));

	}

	/**
	 * Handles messages from clients and processes them.
	 * <pre>
	 * There are the following message types for the Data.
	 * If the length is 1: Calls {@link Game#_snakeMovementMessage}
	 * If the length is > 1:
	 *  If the firstByte is 115 | 116: Calls {@link Game#_newSnakeMessage}
	 *  If the firstByte is 224: Calls  {@link Game#_newLeaderboardObserver}
	 * else throw error
	 * </pre>
	 * @param client
	 * @param data
	 */
	processMessage(client, data) {
		let firstByte;
		if (data.length === 0) {
			console.log('[SERVER] No Data to handle!');
			return;
		}
		if (data.length === 1) {
			this._snakeMovementMessage(client, data);
		} else {
			firstByte = message.readInt8(0, data);
			if (firstByte === 115) {
				this._newSnakeMessage(client, data);

			} // else if(firstByte === 255){
			// var msg = message.readString(3, data, data.byteLength);
			// send(conn.id, messages.highscore.build(conn.snake.name, msg));
			// delete clients[conn.id];
			// conn.close();
			else if (firstByte === 116) {
				this._newSnakeMessage(client, data);
			}
			else if (firstByte === 224) {
				this._newLeaderboardObserver(client, data);

			} else if (firstByte === 252) {
				this._snakeMovementMessage(client, data);
			}
			else {
				console.log("length:" + data.length);
				console.log('[ERROR] Unhandled message ' + firstByte);
				console.log(message.readInt8(0, data));
				console.log(message.readInt8(1, data));
				console.log(message.readInt8(2, data));
			}
		}
	}

	/**
	 * Removes a snake correspodning to the given client id from the the game
	 * Calls {@link Snake#finalRecord} to update the data of snake one last time
	 * @fires Game#snakeDied
	 * @param id
	 * @private
	 */
	_killSnake(id) {
		//Let the snake save data 1 last time
		this._snakes[id].finalRecord();

		this.emit("snakeDied", this._snakes[id], Object.keys(this._snakes).length);
		delete this._snakes[id];
	}

	/**
	 * Handles new LeaderboardObserver Messages. Creates a new {@link LeaderboardObserver}
	 * for the given client and attaches it to the {@link Leaderboard}
	 * @param {WebSocket} client
	 * @private
	 */
	_newLeaderboardObserver(client) {
		console.log("[DEBUG] New leaderboardObserver attached id: " + client.id);
		let lo = new LeaderboardObserver(client, this._leaderboard);
		this._leaderboardObservers.set(client.id, lo);
	}

	/**
	 * Handles the following types of movement messages from the client
	 * <pre>
	 * If first byte of the data is
	 * 0-250:
	 *  The value is a direction corresponding to a 360 degree value.
	 *  Calls {@link Snake#setExpectedAngle} for the snake corresponding to this client
	 * 251:
	 *  fires clientPing event
	 * 252:
	 *  The value is a angle with a base of 127. A value greater than 127 will turn a positive number of degrees
	 *  A value less than 127 will turn a negative number of degrees.
	 *  Calls {@link Snake#turn} with the degree value converted to radians
	 * 253:
	 *  Calls {@link Snake#SetBoost} with value true
	 * 254:
	 *  Calls {@link Snake#SetBoost} with value false
	 * </pre>
	 * @param {WebSocket} client
	 * @param {Number} data  - The message from the WebSocket - An Array of Bytes
	 * @private
	 * @fires Game#clientPing
	 */
	_snakeMovementMessage(client, data) {
		let radians, value;
		value = message.readInt8(0, data);
		let snake = this._snakes[client.id];
		if (snake === undefined) return;

		if (value === 251) {
			this.emit("clientPing", client.id);
		} else if (value <= 250) {
			// console.log('Snake going to', value);
			if (snake === undefined) return;

			//256 or 251
			radians = value * 2 * Math.PI / 251;
			snake.setExpectedAngle(radians);

		} else if (value === 252) {
			var value2 = message.readInt8(1, data);
			value2 = value2 - 127;
			if (value2 > 0) {
				radians = value2 * 2 * Math.PI / 256;
				snake.turn(radians);
			}
			else {
				value2 += 127;
				radians = value2 * 2 * Math.PI / 256;
				snake.turn(-radians);
			}
		} else if (value === 253) {
			//console.log('Snake in speed mode');
			snake.setBoost(true);
			//snake.speed *= 3;
		} else if (value === 254) {
			//	console.log('Snake in normal mode');
			//snake.speed = 1.79;
			snake.setBoost(false);
			// killPlayer(conn.id, 1);
			//messages.end.build(2);
		}
	}

	/**
	 * Loops through the heads of each snake and each food. If they are within range
	 * it will call {@Snake#increaseSize} and passing the size of the food
	 * and calls {@World#removeFood} for the given food
	 * @private
	 * @fires Game#foodEaten
	 */
	_foodCollisions() {
		let foods = this._world.foods;

		for (let i = foods.length - 1; i >= 0; i--) {
			let offset = 35;
			if (this._snakes.length > 0)
				this._snakes.forEach(snake => {
					if (foods[i] !== undefined) {
						if (( snake.head.x < (foods[i].position.x + offset) && snake.head.x > (foods[i].position.x - offset)
										&& snake.head.y < (foods[i].position.y + offset) && snake.head.y > (foods[i].position.y - offset))) {

							this.emit("foodEaten", snake, foods[i]);
							snake.increaseSize(foods[i].size);

							//This food is gone remove it
							this._world.removeFood(i);
						}
					}
				});
		}
	}

	/**
	 * Calls {@link Game#_snakeCollisions} and {@link Game#_foodCollisions}
	 * If any snakes are outside the {@link World#radius} it will call {@link Game#_killSnake}
	 * for that snake.
	 * @private
	 */
	_detectCollisions() {
		this._snakeCollisions();
		this._foodCollisions();

		//Out of radius detection
		let R = this._world.radius - 50;

		this._snakes.forEach(snake => {
			let r = Math.sqrt((Math.pow((snake.head.x - R), 2)) + (Math.pow((snake.head.y - R), 2)));
			if (r > R) {
				console.log('[DEBUG] Outside of Radius');
				this._killSnake(snake.id);
			}
		});
	}

	/**
	 * Calls {@link Game#_eachSnakeCollision} for each snake
	 * @private
	 */
	_snakeCollisions() {
		this._snakes.forEach(head => {
			this._eachSnakeCollision(head);
		});
	}

	/**
	 * Checks if a snake head is colliding with a body part of any other snakes
	 * If there is a collision the following function are called
	 * <pre>
	 * Calls {@link Snake#snakeKill} - Calls it on the snake that got the kill
	 * Calls {@Link World#deadSnakeFood} - Generate foods
	 * Calls {@link Game#_killSnake} - Kills the colliding snake
	 * </pre>
	 * @param head
	 * @private
	 */
	_eachSnakeCollision(head) {
		var h = head.head;
		this._snakes.forEach(snake => {
			//TODO this offset should be larger for bigger snakes
			let offset = 30;
			if (head !== snake) {
				var p = snake.parts;
				for (var i = 0; i < p.length; i++) {
					if (( h.x < (p[i].x + offset) && h.x > (p[i].x - offset)
									&& h.y < (p[i].y + offset) && h.y > (p[i].y - offset))) {
						this.world.deadSnakeFood(head);
						snake.snakeKill(head.getScore());
						this._killSnake(head.id);
						return;
					}
				}
			}
		});
	}

	/**
	 * Handles the message for when a new snake is connecting to the game.
	 * Creates a new Snake in the game and adds it to the list of snakes.
	 * <pre>
	 * The message has the following information:
	 * if firstByte is 115:
	 * 	snake color, snake name
	 * if firstByte is 116:
	 * 	snake color, cookie length, cookie_id, snake name
	 * </pre>
	 * @fires Game#newClientSnake
	 * @param {WebSocket} client
	 * @param {Number} data  - The message from the WebSocket - An Array of Bytes
	 * @private
	 */
	_newSnakeMessage(client, data) {
		let firstByte = message.readInt8(0, data);
		let skin, name, cookie, cookie_length;
		if (firstByte === 115) {
			skin = message.readInt8(2, data);
			name = message.readString(3, data, data.byteLength);
			cookie = "no one";
		} else if (firstByte === 116) {
			skin = message.readInt8(1, data);
			cookie_length = message.readInt8(2, data);
			cookie = message.readString(3, data, cookie_length + 3);
			name = message.readString(3 + cookie_length, data, data.byteLength);
		}
		console.log(cookie);
		//TODO Need to get cookie
		//id cooke name color position
		let snake = new Snake(client.id, cookie, name, skin, math.randomSpawnPoint());

		this._snakes[client.id] = snake;

		this.emit('newClientSnake', client, this._snakes, snake, this._world.foods);
		console.log(client.id + " new snake");
		//console.log((snake.name === '' ? '[DEBUG] An unnamed snake' : '[DEBUG] A new snake called ' + snake.name) + ' has connected!');
	}
}


/**
 * New Snake Player Event
 * @event Game#newClientSnake
 * @param {WebSocket} client The Client for the new Snake
 * @param {Array.<Snake>} snakes Array of all Snakes
 * @param {Snake} snake The Client's Snake
 * @param {Array.<Food>} foods Array of all Foods
 */

/**
 * Snake Died Event
 * @event Game#snakeDied
 * @param {Array.<Snake>} snake The snake that died
 * @param {Number} playerCount The number of snakes in the game before this snake died
 */


/**
 * Client Ping Event
 * @event Game#clientPing
 * @param {Number} id The id of the client that sent the ping message
 */


/**
 * Food Eaten Event
 * @event Game#foodEaten
 * @param {Snake} snake The snake that ate the food
 * @param {Food} food The food that the snake ate
 */

/**
 * Leaderboard Updated Event
 * @event Game#leaderboardUpdate
 * @param {Array.<Snake>} topSnakes List of all snakes sorted by length descending
 */




module.exports = Game;


