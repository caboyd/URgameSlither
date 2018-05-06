var message = require('../utils/message');

var type = 'G'.charCodeAt(0);

exports.build = function (snake) {
    var arr = new Uint8Array(7);
    message.writeInt8(2, arr, type);
    message.writeInt16(3, arr, snake.id);
    message.writeInt8(5, arr, snake.direction.x + 128);
    message.writeInt8(6, arr, snake.direction.y + 128);
    return arr;
};
