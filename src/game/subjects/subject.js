/**
 * @classdesc Abstract class for Subject in Observer Pattern
 * @abstract
 */
class Subject {

	constructor() {
		if (new.target === Subject) {
			throw new TypeError("Cannot construct Abstract instances directly");
		}
		/**@type {Array.<Observer>}
		 * @private */
		this._observers = [];
	}

	/**
	 * Attaches a given observer to the observer array
	 * @param observer {Observer} - The observer to attach
	 */
	attach(observer) {
		this._observers.push(observer);
		this.notifyObservers();
	}

	/**
	 * Removes a given observer from the observer array
	 * @param observer {Observer} The Observer to detach
	 * @returns {boolean} Returns true if the given observer was detached
	 */
	detach(observer) {
		this._observers.forEach((o, i) => {
			if (o === observer) {
				this._observers.splice(i, 1);
				return true;
			}
		});
		return false;
	}

	/**
	 * Calls update function on each observer in the array
	 */
	notifyObservers() {
		this._observers.forEach(observer => {
			observer.update(this);
		})
	}
}

module.exports = Subject;