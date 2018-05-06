const config = require('../config/config.js');
const math = require('../utils/math');
const EventEmitter = require('events');
const Food = require ("./food");

const minFoodSize = config['minFoodSize'];
const maxFoodSize = config['maxFoodSize'];
const maxFoodColors = config['maxFoodColors'];
const maxFood = config['food'];

/**
 * New Food Generated Event
 * @event World#newFoods
 * @property {Array.<Food>} An array of the new foods generated
 */


/**
 * @classdesc Represents the world for the snake game. Has a radius and contains the Foods
 * @class
 */
class World extends EventEmitter {

	constructor() {
		super();
		/**
		 * 
		 * @type {Array.<Food>}
		 * @private
		 */
		this._foods = [];
		/**
		 * 
		 * @type {Map.<Snake>}
		 * @private
		 */
		this._snakes = new Map();
		/**
		 * @readonly
		 * @type {Number}
		 * @private
		 */
		this._radius = config["gameRadius"];

		this._generateFood(maxFood);
	}

	get foods(){
		return this._foods;
	}

	getFoods(){
		return this._foods;
	}
	
	get radius() {
		return this._radius;
	}

	/**
	 * Removes the food at the given index in the food array
	 * @param index
	 */
	removeFood(index){
		this._foods.splice(index,1);
		
	}

	/**
	 * If the current food amount is less than the max food
	 * then new food will be gerenated using {@link World#_generateFood)
	 */
	update(){
		var diff = maxFood -this._foods.length ;
		
		if(diff > 0){
			var newFoods = this._generateFood(diff);
			this.emit("newFoods", newFoods);
		}
		
	}

	/**
	 * Creates a new food with the following parameters and appends
	 * it to the foods array.
	 * @param x X Coordinate
	 * @param y Y Coordinate
	 * @param size Size of Food
	 * @param color Number represending color of Food
	 * @return {Food}
	 * @private
	 */
	_newFoodAt(x,y,size,color){
		let id = (y * this.radius * 3) + x;
		let f = new Food(id, {x,y}, size, color);
		this._foods.push(f);
		return f;
	}

	/**
	 * Turns the positions of the parts of a snake into new Food using
	 * {@link World#_newFoodAt} function
	 * @fires World#newFoods
	 * @param snake
	 */
	deadSnakeFood(snake){
		var newFoods = [];
		for(var i = 0; i < snake.parts.length; i++){
			var f = this._newFoodAt(snake.parts[i].x, snake.parts[i].y, 110, snake.color);
			newFoods.push(f);
		}
		this.emit("newFoods", newFoods);
	}


	/**
	 * Generates a number of food given by the amount at random locations.
	 * Appends these foods to the foods array
	 * @param {Number} amount
	 * @return {Array}
	 * @private
	 */
	_generateFood (amount) {
		var newFoods = [];
		for (let i = 0; i < amount; i++) {
			let a = math.randomSpawnPoint();
			let pos = {x:a.x,y:a.y};
			let id = (pos.y * this.radius * 3) + pos.x;
			let color = math.randomInt(0, maxFoodColors);
			let size = math.randomInt(minFoodSize, maxFoodSize);

			let f = new Food(id, pos, size, color);
			this._foods.push(f);
			 newFoods.push(f);

		}
		return newFoods;
	}
	

}

module.exports = World;
