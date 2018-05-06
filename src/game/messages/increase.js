var message = require('../utils/message');

var type = 'n'.charCodeAt(0);

exports.build = function (snake) {
    var arr = new Uint8Array(12);
    message.writeInt8(2, arr, type);
	  message.writeInt16(3, arr, snake.id);
    message.writeInt16(5, arr, snake.head.x);
    message.writeInt16(7, arr, snake.head.y);
	  message.writeInt24(9, arr, snake.fam * 16777215);
    return arr;
};
