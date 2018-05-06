const Observer = require("./observer");
const Leaderboard = require("../subjects/leaderboard");

/**
 * @classdesc  Represents a LeaderboardObserver which sends messages 
 * directly to a Client. The message contains the state of the Leaderboard 
 * that this class is observing 
 * @class
 * @implements {Observer}
 */
class LeaderboardObserver extends Observer{

	/**
	 * Initialize a new LeaderboardObserver that will communicate
	 * with the given client WebSocket 
	 * and attach itself to the given Leaderboard subject
	 * @param client {WebSocket}
	 * @param leaderboard {Leaderboard}
	 */
	constructor(client, leaderboard){
		super();
		/**@type {WebSocket}
		 * @private */
		this._client = client;
		/**@type {Leaderboard}
		 * @private */
		this._subject = leaderboard;
		/**@type {string}
		 * @private */
		this._leaderboard = "";
		
		leaderboard.attach(this);	
	}

	/**
	 * Gets the leaderboard state from the Leaderboard subject
	 * and sends the state to the client WebSocket
	 * @override
	 */
	update(){
		this._leaderboard  = this._subject.getState();

		if(this._client.readyState == 1 )
			this._client.send(this._leaderboard);
	}
}

module.exports = LeaderboardObserver;
