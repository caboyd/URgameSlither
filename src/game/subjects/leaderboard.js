const Subject = require("./subject");

/**
 * @classdesc Class the represents a Leaderboard Subject that is observable
 * @class
 * @extends {Subject}
 */
class Leaderboard extends Subject {

	/**
	 * Initialize new empty Leaderboard
	 * @constructor
	 */
	constructor() {
		super();
		/**@type {string} 
		 * @private */
		this._leaderboard = "";
	}


	/**
	 * Returns the leaderboard state as a String
	 * @returns {string}
	 */
	getState() {
		return this._leaderboard;
	}
	
	/**
	 * Sets the leaderboard state to a given string
	 * @param leaderboard {string}
	 */
	setState(leaderboard) {
		this._leaderboard = leaderboard;
		this.notifyObservers();
	}
	

}

module.exports = Leaderboard;