/**
 * @classdesc Interface class for Observer in Observer Pattern
 * @interface
 */
class Observer
{
	/**
	 * This constructor will throw an error if an object of this abstract
	 * class tries to be constructed.
	 * @constructor
	 */
	constructor(){
		if (new.target === Observer) {
			throw new TypeError("Cannot construct Interface Classes");
		}
	}

	/**
	 * Virtual update function
	 * @virtual
	 */
	update(){};
	
}

module.exports = Observer;