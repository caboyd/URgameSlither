const Game = require("./entities/game");
const NetworkSystem = require("./networksystem");

const WebSocketServer = require('ws').Server;
const WebSocket = require('ws');
let config = require('./config/config.js');

/**
 * Class representing a WebSocket Server for a Game
 * @class
 */
class GameServer {

	/**
	 * Initializes a new Game
	 * Initializes a new NetworkSystem
	 * @constructor
	 */
	constructor() {
		/**@type {Array.<WebSocket>} */
		this._clients = [];
		/**@type {Game} */
		this._game = new Game();
		/**@type {NetworkSystem} */
		this._networkSystem = new NetworkSystem(this._game, this._game.world);
		/**@type {WebSocketServer} */
		this._server = null;
	}

	/**
	 * Starts a new Websocket server that will accept Websocket connections at
	 * the path specified in the config file. Starts the Game
	 */
	startServer() {
		
		this._game.startGame();
		
		this._server = new WebSocketServer({port: config['port'], path: config['path']}, function () {
			console.log('[SERVER] Server Started at 127.0.0.1:' + config['port'] + '! Waiting for Connections...');
			//console.log("[BOTS] Bot Status: Bot's are currently unavailable! Please try again later.");
			//console.log('[BOTS] Creating ' + config['bots'] + ' bots!');
			//console.log('[BOTS] Bots successfully loaded: ' + botCount + (botCount === 0 ? "\n[BOTS] Reason: Bot's aren't implemented yet. Please try again later" : ''));
		});

		if (this._server.readyState === this._server.OPEN) {
			this._server.on('connection', this.onConnection.bind(this));
		} else {
			console.log(this._server.readyState);
		}
	}


	/**
	 * Handles the connection of client WebSockets 
	 * Adds the client to the list of clients
	 * @param {WebSocket} client - a new WebSocket connection
	 */
	onConnection(client) {
		GameServer._counter = (GameServer._counter || 1);
		if (Object.keys(this._clients).length >= config['maxConnections']) {
			console.log('[SERVER] Too many connections. Closing newest connections!');
			client.close();
			return;
		}
		try {
			client.id = ++GameServer._counter;
			this._clients[client.id] = client;
		} catch (e) {
			console.log('[ERROR] ' + e);
		}
		client.on('message', this.onMessage.bind(this,client));
		client.on('error', this.onError.bind(this));
		client.on('close', this.onClose.bind(this, client));
	}

	/**
	 * Handles messages received from client WebSocket and passes 
	 * them to the Game processMessage Function
	 * @param {WebSocket} client - The WebSocket sending a message
	 * @param {Array.<Number>} data	- The message from the WebSocket - An Array of Bytes
	 */
	onMessage(client, data) {
		this._game.processMessage(client, data);
	}

	/**
	 * Handles the closing of a WebSocket connection.
	 * Call the clientClose function on the Game class
	 * Removes the client from the list of clients
	 * @param {WebSocket} client - The client WebSocket that closed the connection
	 */
	onClose(client) {
		console.log( "[DEBUG] Closing client with id: " + client.id);
		this._game.clientClose(client.id);
		delete this._clients[client.id];
	}
	
	
	onError(client, e){
		console.error("GameServer onError for client id: " + client.id + " \n" + e);
	}
}



module.exports = GameServer;