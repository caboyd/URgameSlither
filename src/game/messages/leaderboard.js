var message = require('../utils/message');

var type = 'l'.charCodeAt(0);

exports.build = function (rank, players, top) {
	var arr;
    var length = 0;
    top.forEach(snake =>{
        "use strict";
        length += snake.name.length;
    });
	
    arr = new Uint8Array((8 + length) + players * 7);
    var b = 0;
    b += message.writeInt8(b, arr, 0);
    b += message.writeInt8(b, arr, 0);
    b += message.writeInt8(b, arr, type);
    b += message.writeInt8(b, arr, rank > 10 ? 0 : rank);
    b += message.writeInt16(b, arr, 1);
    b += message.writeInt16(b, arr, players);
    i = 0;
	top.forEach( snake => {
        "use strict";
      //length formula
      //Math.floor(15 * (fpsls[K] + u / fmlts[K] - 1) - 5) / 1
			b += message.writeInt16(b, arr, snake.sct);
			b += message.writeInt24(b, arr, snake.fam * 16777215);
			b += message.writeInt8(b, arr, snake.color);
			b += message.writeInt8(b, arr, snake.name.length);
			b += message.writeString(b, arr, snake.name);
    });
        
        
   
    
    return arr;
};
