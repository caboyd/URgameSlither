/**
 *  @module Utils/Message
 */

/**
 * Write a 24 bit integer to an array
 * @param {number} offset Byte offset in array
 * @param {Array.<*>} data The Array to write to
 * @param {number} number the Value to write
 * @return {number}
 */
exports.writeInt24 = function (offset, data, number) {
	var byte1, byte2, byte3;
	number = Math.floor(number);
	if (number > 16777215) {
		throw new Error('Int24 out of bound');
	}
	byte1 = number >> 16 & 0xFF;
	byte2 = number >> 8 & 0xFF;
	byte3 = number & 0xFF;
	data[offset] = byte1;
	data[offset + 1] = byte2;
	data[offset + 2] = byte3;
	return 3;
};

/**
 * Write a 16 bit integer to an array
 * @param {number} offset Byte offset in array
 * @param {Array.<*>} data The Array to write to
 * @param {number} number the Value to write
 * @return {number}
 */
exports.writeInt16 = function (offset, data, number) {
	var byte1, byte2;
	number = Math.floor(number);
	if (number > 65535) {
		throw new Error('Int16 out of bound. Current number: ' + number);
	}
	byte1 = number >> 8 & 0xFF;
	byte2 = number & 0xFF;
	data[offset] = byte1;
	data[offset + 1] = byte2;
	return 2;
};
/**
 * Write an 8 bit integer to an array
 * @param {number} offset Byte offset in array
 * @param {Array.<*>} data The Array to write to
 * @param {number} number the Value to write
 * @return {number}
 */
exports.writeInt8 = function (offset, data, number) {
	var byte1;
	number = Math.floor(number);
	if (number > 255) {
		throw new Error('Int8 out of bound. Current Number: ' + number);
	}
	byte1 = number & 0xFF;
	data[offset] = byte1;
	return 1;
};

/**
 * Write a string to an array
 * @param {number} offset Byte offset in array
 * @param {Array.<*>} data The Array to write to
 * @param {String} string the Value to write
 */
exports.writeString = function (offset, data, string) {
	var i;
	i = 0;
	while (i < string.length) {
		this.writeInt8(offset + i, data, string.charCodeAt(i));
		i++;
	}
	return string.length;
};

/**
 * read an 8 bit integer from an array
 * @param {number} offset Byte offset in array
 * @param {Array.<*>} data The Array to read from
 * @return {*}
 */
exports.readInt8 = function (offset, data) {
	return data[offset];
};
/**
 * read a 24 bit integer from an array
 * @param {number} offset Byte offset in array
 * @param {Array.<*>} data The Array to read from
 * @return {number|*}
 */
exports.readInt24 = function (offset, data) {
	var byte1, byte2, byte3, int;
	byte1 = data[offset];
	byte2 = data[offset + 1];
	byte3 = data[offset + 2];
	int = byte1 << 16 | byte2 << 8 | byte3;
	return int;
};
/**
 * Reads a string of a length from an array
 * @param {number} offset Byte offset in array
 * @param {Array.<*>} data The Array to read from
 * @param {number} length The length to read 
 * @return {string}
 */
exports.readString = function (offset, data, length) {
	var i, string;
	string = '';
	i = offset;
	while (i < length) {
		string += String.fromCharCode(data[i]);
		i++;
	}
	return string;
};
