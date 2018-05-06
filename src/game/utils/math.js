/**
 * @module Utils/Math
 */

var config = require('../config/config.js');

/**
 * Returns a random integer between min and max
 * @param {Number} min Minimum number
 * @param {Number} max Maximum number
 * @return {Number}
 */
exports.randomInt = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Returns a valid spawn location within the game radius
 * @return {Position}
 */
exports.randomSpawnPoint = function () {
	var angle =  Math.random() * 2 * Math.PI;
	var radius_sq = 0.7* Math.random() * config['gameRadius'] * config['gameRadius'];
    return {
        x: Math.sqrt(radius_sq) * Math.cos(angle)+  config['gameRadius'],
        y: Math.sqrt(radius_sq) * Math.sin(angle)+ config['gameRadius'] 
    };
    
    
};
 
exports.chunk = function (arr, chunkSize) {
    var R, i;
    R = [];
    i = 0;
    while (i < arr.length) {
        R.push(arr.slice(i, i + chunkSize));
        i += chunkSize;
    }
    return R;
};
