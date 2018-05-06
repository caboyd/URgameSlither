const message = require('../utils/message');
const config = require('../config/config.js');

exports.build = function (snake) {
	var arr;
	var messageCode = 'e'.charCodeAt(0);

	if (snake.direction.increasing)
		messageCode = '4'.charCodeAt(0);
	else
		messageCode = 'e'.charCodeAt(0);

	if (snake.direction.angle == snake.lastAngleSent) {
		if (snake.speed == snake.lastSpeedSent) {

			arr = new Uint8Array(6);
			message.writeInt8(2, arr, messageCode);
			message.writeInt16(3, arr, snake.id);
			message.writeInt8(5, arr, snake.direction.angle * 255 / (2 * Math.PI));
			//message.writeInt8(6, arr, snake.speed * 18);
		} else {
			arr = new Uint8Array(7);
			message.writeInt8(2, arr, messageCode);
			message.writeInt16(3, arr, snake.id);
			message.writeInt8(5, arr, snake.direction.angle * 255 / (2 * Math.PI));
			message.writeInt8(6, arr, snake.speed * 18);
		}
	} else {

		arr = new Uint8Array(8);
		message.writeInt8(2, arr, messageCode);
		message.writeInt16(3, arr, snake.id);
		message.writeInt8(5, arr, snake.direction.angle * 255 / (2 * Math.PI));
		message.writeInt8(6, arr, snake.direction.expectedAngle * 255 / (2 * Math.PI));
		message.writeInt8(7, arr, snake.speed * 18);
	}

		
	return arr;

};