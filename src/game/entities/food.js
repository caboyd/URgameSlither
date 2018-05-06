/**
 * Represents a position in an XY plane
 * @typedef {Object} Position
 * @property {Number} x X coordinate
 * @property {Number} y Y coordinate
 */

/**@classdesc Represents a Food item in the game that can be eaten by a {@link Snake}.
 * It exists in the the {@link World}
 * @class
 */
class Food {

	/**
	 * Initialize a new food with the given id, Position, size, and color
	 * @param {Number} id 
	 * @param {Position} position - Position of the food in an xy plane
	 * @param {Number} size - Size of the food
	 * @param {Number} color - A number representing the color of the food
	 */
	constructor(id, position, size, color) {
		/**
		 * 
		 * @type {Number}
		 * @private
		 */
		this._id = id;
		/**
		 * 
		 * @type {Position}
		 * @private
		 */
		this._position = position;
		/**
		 * 
		 * @type {Number}
		 * @private
		 */
		this._size = size;
		/**
		 * 
		 * @type {Number}
		 * @private
		 */
		this._color = color;
		
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
	 * @type {Position}
	 */
	get position() {
		return this._position;
	}

	/**
	 * @readonly
	 * @type {Number}
	 */
	get color() {
		return this._color;
	}

	/**
	 * @readonly
	 * @type {Number}
	 */
	get size() {
		return this._size;
	}
}

module.exports = Food;