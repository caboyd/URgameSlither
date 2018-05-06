/**
 * @module Messages
 */

/**
 * Builds the Direction message for the Snake
 * @method
 * @param {Snake} snake
 * @return {Uint8Array}
 */
exports.direction = require('./direction');

/**
 * Builds the Position message for the Snake
 * @method
 * @param {Snake} snake
 * @return {Uint8Array}
 */
exports.position = require('./position');

/**
 * Builds the Movement message for the Snake
 * @method
 * @param {Snake} snake
 * @return {Uint8Array}
 */
exports.movement = require('./movement');

/**
 * Builds the Initial message for any Snake
 * @method
 * @return {Uint8Array}
 */
exports.initial = require('./initial');

/**
 * Builds the Pong message
 * @method
 * @return {Uint8Array}
 */
exports.pong = require('./pong');

/**
 * Builds the leaderboard message for the snakes
 * @method
 * @param {Number} rank Rank of this snake compared to other snakes
 * @param {Number} players Number of players in game
 * @param {Array.<Snake> top Array of Snakes sorted by length descending
 * @return {Uint8Array}
 */
exports.leaderboard = require('./leaderboard');

/**
 * Builds the new snake message for a snake
 * @method
 * @param {Snake} The snake that is new
 * @return {Uint8Array}
 */
exports.snake = require('./snake');

/**
 * Builds the highscore message
 * @method
 * @param {String} text
 * @param {String} text2
 * @return {Uint8Array}
 */
exports.highscore = require('./highscore');

/**
 * Builds the food messages
 * @method
 * @param {Array.<Food>} The Array of food to put into the message
 * @return {Uint8Array}
 */
exports.food = require('./food');


/**
 * Builds the food has been eaten message
 * @method
 * @param {Number} food_x X position of the Food
 * @param {Number} food_y Y position of the Food
 * @param {Number} snake_id Id of the Snake that ate the food
 * @return {Uint8Array}
 */
exports.eat = require('./eat');

/**
 * Builds the end message for when a snake dies
 *  0-2; 0 is normal death, 1 is new highscore of the day, 2 is unknown
 * @method
 * @param {Number} endNum Type of Death 
 * @return {Uint8Array}
 */
exports.end = require('./end');

/**
 * Builds increase snake length message
 * @method
 * @param {Snake} The snake that increased in length
 * @return {Uint8Array}
 */
exports.increase = require('./increase');

/**
 * Builds decrease snake length message
 * @method
 * @param {Snake} The snake that decreased in length
 * @return {Uint8Array}
 */
exports.decrease = require('./decrease');

/**
 * Builds remove snake message
 * @method
 * @param {Snake} The snake that needs to be removed from the client
 * @param {Number} is_dead value indicating whether snake is dead or out of range
 * @return {Uint8Array}
 */
exports.removeSnake = require('./removesnake');


/**
 * Builds the snake last part fullness message
 * @method
 * @param {Snake} The snake that changed in size
 * @return {Uint8Array}
 */
exports.fullness = require('./fullness');

exports.sector = require('./sector');
exports.minimap = require('./minimap');