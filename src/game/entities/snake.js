const EventEmitter = require('events');
const config = require('../config/config.js');
let UsersSnakes = require('../../app/models/userssnakes');




/**
 * @classdesc Represents a Snake within the {@Link Game}
 * @class
 */
class Snake extends EventEmitter {

	/**
	 * 
	 * @param {Number} id
	 * @param {String} cookie The cookie id of the client corresponding to this snake
	 * @param {String} name The name of the snake 
	 * @param {Number} color A number representing the color of the snake
	 * @param {Position} position The position of the head of the snake
	 */
	constructor(id, cookie, name, color, position) {
		super();

		/**
		 * 
		 * @type {Number}
		 * @private
		 */
		this._id = id;
		/**
		 * @type {String}
		 * @private
		 */
		this._name = name;
		/**
		 * A number representing the color of the snake
		 * @type {Number}
		 * @private
		 */
		this._color = color;
		/**
		 * The position of the head of the snake
		 *  @type {Position} 
		 * @private
		 * */
		this._head = position;

		/** Speed is a value from 5.79 to 14
		 *  @type {Number}
		 *  @private
		 */
		this._speed = config["nsp1"] + config["nsp2"];
		/**
		 * 
		 * @type {boolean}
		 * @private
		 */
		this._boost = false;
		
		/**
		 * A number used to hackily shrink the server side snake to more closely match the client
		 * @type {number}
		 * @private
		 */
		this._shrinkCount = 0;
		
		/**
		 * @type {Direction}
		 * @private
		 */
		this._direction = {
			x: 0,
			y: 0,
			//Start facing upwards
			angle: ((3 / 4) * Math.PI * 2),
			expectedAngle: ((3 / 4) * Math.PI * 2)
		};


		/**
		 * 
		 * @type {{cookie_id: String, length: number, duration: number, kills: number, boosts: number, interval_data: {length: Array, kills: Array}, largestSnake: number}}
		 * @private
		 */
		this._data = {
			cookie_id: cookie,
			length: 0,
			duration: 0,
			kills: 0,
			boosts: 0,
			interval_data: {
				length: [],
				kills: []
			},
			largestSnake: 0
		};
		
		/**
		 * 
		 * @type {{cookie_id: String, snake: {name: String, color: Number}}}
		 * @private
		 */
		this._user = {
			cookie_id: cookie,
			snake: {
				name: name,
				color: color
			}
		};

		/**
		 * 
		 * @type {number}
		 * @private
		 */
		this._initTime = Date.now();
		/**
		 * 
		 * @type {number}
		 * @private
		 */
		this._time = this._initTime;
		/**
		 * 
		 * @type {number}
		 * @private
		 */
		this._lastIntervalTime = this._initTime - config["intervalRate"];
		/**
		 * 
		 * @type {number}
		 * @private
		 */
		this._killCounter = 0;
		/**
		 * 
		 * @type {number}
		 * @private
		 */
		this._lastSpeedSent = 0;
		/**
		 * 
		 * @type {number}
		 * @private
		 */
		this._lastAngleSent = 0;
		
		/**
		 * Fullness amount of last part of snake
		 * Fam is a float between 0 and 1
		 * @type {number}
		 * @private
		 */
		this._fam = 0;
		/**
		 * Starting snake sections is 2
		 * Number of parts
		 * @type {number}
		 * @private
		 */
		this._sct = config["snakeStartSize"];

		//Unused, but needs to slow snake down when its turning
		//Currently snake looks too fast when making turns
		this._sc = Math.min(6, 1 + (this._sct - 2) / 106);
		this._scang = 0.13 + 0.87 * Math.pow((7 - this._sc) / 6, 2);
		this._spangdv = 4.8;
		this._spang = Math.max(this._speed / this._spangdv, 1);

		/**
		 * The number of snake parts plus the size of the last part
		 * @type {number}
		 * @private
		 */
		this._length = this._sct + this._fam;

		/**
		 * The snake parts
		 * @type {Array.<SnakePart>}
		 * @private
		 */
		this._parts = [];

		
		for (var i = this._sct - 2; i >= 0; i--) {
			this._parts.push({
				dx: 0,
				dy: config["maxSpeed"],
				x: this._head.x,
				y: this._head.y + config["maxSpeed"] * i
			});
		}

	}

	/**
	 * Updates the position of a snake using delta time.
	 * Boosted snakes update 2.4 times as often as slow snakes
	 * @param deltaTime Time in milliseconds since last update
	 * @param count counter for updating slow snakes
	 * @param fast_count Counter for updating boosted snakes
	 */
	update(deltaTime, count, fast_count) {
		for (; this._shrinkCount < parseInt(this.parts.length / 20); this._shrinkCount++) {
			this._shrink();
		}

		if (this._boost && this._length > 2 && this._speed > 7 || this._speed > 11) {
			if (parseInt(fast_count) % 5 == 0) {
				this._updateDirection(deltaTime * 5);
				this._updatePosition(deltaTime * 5);
			}
		} else {
			if (parseInt(count) % 12 == 0) {
				this._updateDirection(deltaTime * 12);
				this._updatePosition(deltaTime * 12);
			}
		}
	}

	/**
	 * Updates the {@link Snake#_data} for the snake before the data is sent to the app server
	 */
	finalRecord() {
		this._data.length = this.getScore();
		this._data.duration = (Date.now() - this._initTime) / 1000;
		this._data.interval_data.length.push(this.getScore());
		this._data.interval_data.kills.push(this._killCounter);
	}

	/**
	 * Updates the value of the largest snake that this snake has killed
	 * @param length - the {@link Snake#getScore} of the snake killed
	 */
	snakeKill(length) {
		this._data.largestSnake = Math.max(length, this._data.largestSnake);
		this._killCounter++;
		this._data.kills++;
	}

	/**
	 * Saves new data every time the interval rate is reached. Set to 5 seconds.
	 * @param deltaTime Time elapsed in milliseconds since last update
	 */
	updateData(deltaTime) {
		this._time += deltaTime;
		//Record data now
		if (this._time - this._lastIntervalTime > config["intervalRate"]) {
			this._lastIntervalTime = this._lastIntervalTime + config["intervalRate"];
			this._data.interval_data.length.push(this.getScore());
			this._data.interval_data.kills.push(this._killCounter);
			this._killCounter = 0;
		}
	}

	/**
	 * Returns the score for the snake
	 * @return {number}
	 */
	getScore() {
		var fpsls = config["fpsls"];
		var fmlts = config["fmlts"];
		var a = Math.floor(15 * (fpsls[this._sct] + this._fam / fmlts[this._sct] - 1) - 5) / 1;
		return a;
	}

	/**
	 * Returns the last snake part
	 * @return {SnakePart}
	 */
	get body() {
		return this._parts[0];
		//return this._parts[this._parts.length-1];
	}

	/**
	 * Sets the boost to the enabled value
	 * @param {boolean} enabled
	 */
	setBoost(enabled) {
		this._boost = enabled;
	}

	/**
	 * updates the {@link Snake#_direction#expectedAngle} by the radians value
	 * @param radians Amount of radians to turn (positive or negative)
	 */
	turn(radians) {
		var old = this._direction.angle;
		old += radians;
		//	console.log(radians);
		if (old > Math.PI * 2) old -= Math.PI * 2;
		if (old < 0) old += Math.PI * 2;

		this._direction.expectedAngle = old;

	}

	/**
	 * sets the {@link Snake#_direction#expectedAngle} of the snake
	 * @param radians Angle to be set to
	 */
	setExpectedAngle(radians) {
		var degrees = radians * (180 / Math.PI);
		//	console.log(degrees);
		this._direction.expectedAngle = radians;
	}

	/**
	 * sets the {@link Snake#_direction#expectedAngle} of the snake
	 * @param radians Angle to be set to
	 */
	setAngle(radians) {
		this.setExpectedAngle(radians);
	}
	
	/**
	 * @readonly
	 * @return {String}
	 */
	get name() {
		return this._name;
	}

	/**
	 * @readonly
	 * @return {Number}
	 */
	get color() {
		return this._color;
	}

	/**
	 * @readonly
	 * @return {number}
	 */
	get lastSpeedSent() {
		return this._lastSpeedSent;
	}

	/**
	 * @readonly
	 * @return {number}
	 */
	get lastAngleSent() {
		return this._lastAngleSent;
	}

	/**
	 * @readonly
	 * @type {{cookie_id: String, snake: {name: String, color: Number}}}
	 */
	get user() {
		return this._user;
	}

	/**
	 * @readonly
	 * @return {Number}
	 */
	get angle(){
		return this._direction.angle;
	}

	/**
	 * @return {Number}
	 */
	get expectedAngle(){
		return this._direction.expectedAngle;
	}

	/**
	 * @readonly
	 * @return {number}
	 */
	get time() {
		return this._time;
	}

	/**
	 * @readonly
	 * @return {Number}
	 */
	get id() {
		return this._id;
	}

	/**
	 * @readonly
	 * @return {{cookie_id: String, length: number, duration: number, kills: number, boosts: number, interval_data: {length: Array, kills: Array}, largestSnake: number}}
	 */
	get data() {
		return this._data;
	}

	/**
	 * @readonly
	 * @return {Array.<SnakePart>}
	 */
	get parts() {
		return this._parts;
	}

	/**
	 * @readonly
	 * @return {Direction}
	 */
	get direction() {
		return this._direction;
	}

	/**
	 * @readonly
	 * @return {Number}
	 */
	get speed() {
		return this._speed;
	}

	/**
	 * @readonly
	 * @return {Position}
	 */
	get head() {
		return this._head;
	}

	/**
	 * @readonly
	 * @return {number}
	 */
	get sct() {
		return this._sct;
	}

	/**
	 * @readonly
	 * @return {number}
	 */
	get length() {
		return this._length;
	}

	/**
	 * @readonly
	 * @return {number}
	 */
	get fam() {
		return this._fam;
	}

	/**
	 * Updates the position of the snake
	 * @param deltaTime Time passed in milliseconds since last update
	 * @fires Snake#updateSmall
	 * @fires Snake#update
	 * @private
	 */
	_updatePosition(deltaTime) {
		var sc = Math.min(6, 1 + (this._sct - 2) / 106);
		var baseSpeed = config["nsp1"] + config["nsp2"];
		//Bigger snakes move slower
		var scale = baseSpeed / (config["nsp1"] + (config["nsp2"] * sc) + 0.1);

		if (this._boost && this._length > 2) {
			this._speed += 1.45;

			if (this._speed > config["maxSpeed"]) this._speed = config["maxSpeed"];
		} else {
			this._speed -= 1.95;
			if (this._speed < baseSpeed) this._speed = baseSpeed;
		}

		//This is speed formula used in client
		let formula = deltaTime / 8 * this._speed / 4;

		//Multiply by scale to slow down larger snakes
		let distance = scale * formula;
		distance = distance * config["speedMult"] + config["speedBonus"];
		this._direction.x = parseInt(Math.cos(this._direction.angle) * distance);
		this._direction.y = parseInt(Math.sin(this._direction.angle) * distance);
		this._head.x += this._direction.x;
		this._head.y += this._direction.y;

		var sizeChange = baseSpeed - this._speed;
		if (sizeChange !== 0)
			this.increaseSize(sizeChange * 4);

		this._updateParts();
		if (Math.abs(this._direction.x) < 120 && Math.abs(this._direction.y) < 120) {
			this.emit("updateSmall", this);
		} else {
			this.emit('update', this);
		}
		this._lastSpeedSent = this._speed;
		this._lastAngleSent = this._direction.angle;
	}

	/**
	 * Function to shrink the size of the snake on the server to more 
	 * closely match the size of the snake on the client
	 * @private
	 */
	_shrink() {
		var p = this.parts;
		var last = Object.assign({}, this.head);
		var shrink = 1.1;
		for (var i = this.parts.length - 1; i >= 0; i--) {
			p[i].x += last.dx * shrink;
			p[i].y += last.dy * shrink;
			var temp = Object.assign({}, p[i]);
			p[i] = Object.assign({}, last);
			p[i].dx = last.x - temp.x;
			p[i].dy = last.y - temp.y;
			temp.x += p[i].dx * shrink/2;
			temp.y += p[i].dy * shrink/2;
			last = temp;
		}
	}

	/**
	 * Moves each part of the snake into the position of the 
	 * part next to it
	 * @private
	 */
	_updateParts() {

		var p = this.parts;
		var last = Object.assign({}, this.head);

		for (var i = this.parts.length - 1; i >= 0; i--) {

			var temp = Object.assign({}, p[i]);
			p[i] = Object.assign({}, last);
			//p[i].dx = last.x - temp.x;
			//p[i].dy = last.y - temp.y;
			//temp.x += p[i].dx* 0.4;
			//temp.y += p[i].dy* 0.4;
			last = temp;

		}
	}

	/**
	 * Updates the snakes direction, turning it towards its expected angle
	 * @param deltaTime The time passed in milliseconds since the last update
	 * @fires Snake#direction
	 * @private
	 */
	_updateDirection(deltaTime) {
		if (this._direction.angle == this._direction.expectedAngle) {
			return;
		}
		var rads = this._direction.expectedAngle;
		var radsOld = this._direction.angle;

		var maxRads = Math.PI * deltaTime / 800;

		var diff = radsOld - rads;

		if (Math.abs(diff) < maxRads || Math.abs(diff) > Math.PI * 2 - maxRads) {

			this._direction.angle = this._direction.expectedAngle;
			return;
		}
		//This makes sure to turn in correct direction
		if (radsOld > rads) {
			if (diff - Math.PI > 0) {
				this._direction.increasing = true;
				//	console.log("increasing1");
				radsOld += maxRads;
			}
			if (diff - Math.PI < 0) {
				//	console.log("decreasing1");
				this._direction.increasing = false;
				radsOld -= maxRads;
			}
		} else if (radsOld < rads) {
			if (diff + Math.PI > 0) {
				radsOld += maxRads;
				this._direction.increasing = true;
				//console.log("increasing2");
			}
			if (diff + Math.PI < 0) {
				//	console.log("decreasing2");
				radsOld -= maxRads;
				this._direction.increasing = false;
			}
		}

		if (radsOld < 0) radsOld += Math.PI * 2;
		if (radsOld > Math.PI * 2) radsOld -= Math.PI * 2;

		if (radsOld < 0) throw "weird angle";
		if (radsOld > Math.PI * 2) throw "weird angle";

		var rad = radsOld;
		this._direction.angle = rad;

		//unused
		this.emit("direction", this);

		// this.scang = 0.13 + 0.87 * Math.pow((7 - this._sc) / 6, 2);
		// this._spang = Math.max(this._speed / this._spangdv, 1);
		//this._direction.angle = ((0.033 * 1e3) * rad * this.scang * this.spang)
	}

	/**
	 * Increases the size of the snake by the given amount
	 * @fires Snake#increase
	 * @fires Snake#decrease
	 * @fires Snake#fam
	 * @param amount
	 */
	increaseSize(amount) {
		var lastScore = this.getScore();
		var fmlts = config["fmlts"];
		amount = fmlts[this._sct] * amount;

		this._fam += amount / config["foodToGrow"];
		if (this._fam > 2) this._fam = 1.95;

		if (this._fam > 1) {
			this._fam -= 1;
			this._sct += 1;
			this.emit("increase", this);


			var xdiff = this.head.x - this.parts[this.parts.length - 1].x;
			var ydiff = this.head.y - this.parts[this.parts.length - 1].y;

			this._parts.push({
				dx: xdiff,
				dy: ydiff,
				x: this._head.x,
				y: this._head.y
			});

			//Hack to make server side snake shorter
			// if (parseInt(this.parts.length) % 50 === 0)
			// 	this._shrink();

			//console.log((this.parts));
		} else if (this._fam < 0) {
			if (this._sct > 2) {
				this._sct -= 1;
				this._fam += 1;
				this.emit("decrease", this);
				if (this._parts.length > 2)
					this._parts.splice(0, 1);
			} else {
				this._fam = 0;
				this.emit("fam", this);
			}
		} else {
			this.emit("fam", this);
		}
		this._length = this._sct + this._fam;
		//console.log("sct:" + this._sct + " fam: " + this._fam);
		if (this.getScore() < lastScore) {
			this._data.boosts += (lastScore - this.getScore());
		}
	}


}



module.exports = Snake;


/**
 * Represents a Direction as a Position XY offset, an actual angle,
 * and and angle the Direction is turning towards
 * <pre>
 * Angle is a value from 0 to 2Pi
 * 0 is facing right
 * Pi/2 is facing downwards
 * Pi is facing left
 * 3Pi/2 is facing upwards
 * </pre>
 * @typedef {Object} Direction
 * @property {Number} x The value last moved in the X axis
 * @property {Number} y The value last moved in the Y axis
 * @property {Number} angle The actual angle of the Snake
 * @property {Number} expectedAngle The angle the snake is turning towards
 */


/**
 * Represents a SnakePart which has a position and distance from a previous part
 * @typedef {Object} SnakePart
 * @property {Number} x The X position
 * @property {Number} y The Y position
 * @property {Number} dx The x distance between this and the previous part
 * @property {Number} dy The y distance between this and the previous part
 */


/**
 * Snake Size Increase Event
 * @event Snake#increase
 * @param {Snake} The snake that increased in size
 */

/**
 * Snake Size decrease Event
 * @event Snake#decrease
 * @param {Snake} The snake that decreased in size
 */

/**
 * Snake Last part fullness amount changed Event
 * @event Snake#fam
 * @param {Snake} The snake that changed in size
 */



/**
 * Snake updateSmall Event
 * Used when snake position is updated a small amount
 * @event Snake#updateSmall
 * @param {Snake} The snake that changed position
 */


/**
 * Snake updated Event
 * Used when snake position is updated a large amount
 * @event Snake#update
 * @param {Snake} The snake that changed position
 */







