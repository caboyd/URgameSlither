var message = require('../utils/message');

var type = 'c'.charCodeAt(0);

exports.build = function (food_x, food_y, snake_id) {
    var arr = new Uint8Array(9);
    message.writeInt8(2, arr, type);
    message.writeInt16(3, arr, food_x);
    message.writeInt16(5, arr, food_y);
	  message.writeInt16(7, arr, snake_id);
    return arr;
};
