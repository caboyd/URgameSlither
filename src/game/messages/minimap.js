// TODO? unused for now
 var message = require('../utils/message');

var type = 'u'.charCodeAt(0);

exports.build = function (snakes, world) {
	

	var b = new Array(80);
	
	for(var i = 0; i < 80; i++){
	    b[i] = new Array(80);
	    for (var j = 0; j < 80; j++){
	       b[i][j] = 0; 
      }
  }
	
  snakes.forEach(snake=>{
  	snake.parts.forEach(part=>{
  		"use strict";
			var i = Math.floor(part.y* 79 / (2*world.radius));
			if(i > 80) i = 80;
			var j = Math.floor(part.x * 79 / (2*world.radius)) ;
			if(j > 80) j = 80;
			b[i][j] = 1;
		})
	
  });

  var num = 0;
  var count = 0;
  var m = [];
  var skip = 0;
	for(var i = 0; i < 80; i++){
		for (var j = 0; j < 80; j++) {
			count++;
		    if(b[i][j]){
					if(skip > 7)
					{
						m.push(skip + 128);
						skip = 0;
					}
					num = (num << 1) + 1;
				}else{
		    	skip ++;
					num = (num << 1);
				}
					
				if(skip == 127) {
					m.push(skip + 128);
					skip = 0;
				}				
		    if(count >= 7 && count > skip){
		        m.push(num);
		        count = 0;
		        num = 0;
						skip = 0;
        }
		}
  }
  if(count > 0)
    m.push(num);
	var arr = new Uint8Array(3 + m.length);
	arr.set([0, 0, type]);
	arr.set(m,3);
	
    return arr;
};
