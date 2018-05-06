const message = require('../utils/message.js');
const type = 's'.charCodeAt(0);

exports.build = function (snake, is_dead) {
	let arr = new Uint8Array(6);
	var b = 0;
	b += message.writeInt8(b, arr, 0);
	b += message.writeInt8(b, arr, 0);
	b += message.writeInt8(b, arr, type);
	b += message.writeInt16(b, arr, snake.id);
	b += message.writeInt8(b, arr, is_dead ? 1 : 0);

	return arr;
};
