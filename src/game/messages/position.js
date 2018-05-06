var message = require('../utils/message');

var type = 'g'.charCodeAt(0);

exports.build = function (snake) {
	var arr = new Uint8Array(9);
	message.writeInt8(2, arr, type);
	message.writeInt16(3, arr, snake.id);
	message.writeInt16(5, arr, snake.head.x);
	message.writeInt16(7, arr, snake.head.y);
	return arr;
};

