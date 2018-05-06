let express = require('express');
let CalculatedStats = require('../models/calculatedstats');
let Users = require('../models/users');
let DailyStats = require('../models/dailyStats');

let UserService = require('./userService');

let instance = null;
var now = new Date();
var startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

/**
 * @classdesc Holds the calculated statistics data, and performas calculations to update it
 * and store it in the database
 * @class
 */
class StatsSingleton {
    
    /**
     * @param  express
     * @constructor
     */
    constructor(express) {

			/**
       * @type {Object}
       * @private
			 */
			this.express = express;

        //if instance is null
        if (!instance) {
            instance = this;
        }
        else
            return instance;

        DailyStats.findOne({'createdOn': {$gt: startOfToday}}, function (err, initDailyStats) {

            if (!initDailyStats) {
                initDailyStats = new DailyStats();

                //calculate initial records when the server starts
                UserService.GetUsersSnakesAfterDate(startOfToday, function (usersSnakes) {
                    for (var x = 0; x < usersSnakes.length; x++) {
                        initDailyStats.totals.boosts += usersSnakes[x].boosts;
                        initDailyStats.totals.deaths += 1;
                        initDailyStats.totals.duration += usersSnakes[x].duration;
                        initDailyStats.totals.kills += usersSnakes[x].kills;
                        initDailyStats.totals.length += usersSnakes[x].length;

                        //Calculate the interval_data
                        for (var i = 0; i < usersSnakes[x].interval_data.length.length; i++) {
                            //calculate highscore data
                            if (initDailyStats.interval_data.highScore[i]) {
                                if (initDailyStats.interval_data.highScore[i] < usersSnakes[x].interval_data.length[i]) {
                                    initDailyStats.interval_data.highScore[i] = usersSnakes[x].interval_data.length[i];
                                }
                            }
                            else {
                                initDailyStats.interval_data.highScore[i] = usersSnakes[x].interval_data.length[i]
                            }
                            //calculate sums data
                            if (initDailyStats.interval_data.sums[i]) {
                                initDailyStats.interval_data.sums[i] += usersSnakes[x].interval_data.length[i];
                                initDailyStats.interval_data.counter[i]++;
                            }
                            else {
                                initDailyStats.interval_data.sums[i] = usersSnakes[x].interval_data.length[i];
                                initDailyStats.interval_data.counter[i] = 1;
                            }
                            //calculate averages data
                            if (isNaN(initDailyStats.interval_data.averages[i])) {
                                initDailyStats.interval_data.averages[i] = 0;
                            }
                            initDailyStats.interval_data.averages[i] = initDailyStats.interval_data.sums[i] / (initDailyStats.interval_data.counter[i]);
                        }
                    }
                    //save new record with updated information into the DB
                    initDailyStats.save(function (err) {
                        if (err) console.error(err);
                    })
                });
            }

					/**
           * @type {DailyStats}
           * @private
					 */
					this.cachedDailyStats = initDailyStats;

        }.bind(this));

        CalculatedStats.findOne({}, function (err, initCalcStats) {

            if (!initCalcStats) {
                initCalcStats = new CalculatedStats();

                UserService.GetUsersSnakesAfterDate((startOfToday - startOfToday), function (usersSnakes) {
                    for (var x = 0; x < usersSnakes.length; x++) {
                        initCalcStats.totals.all_time.boosts += usersSnakes[x].boosts;
                        initCalcStats.totals.all_time.deaths += 1;
                        initCalcStats.totals.all_time.duration += usersSnakes[x].duration;
                        initCalcStats.totals.all_time.kills += usersSnakes[x].kills;
                        initCalcStats.totals.all_time.length += usersSnakes[x].length;
                    }

                    initCalcStats.save(function (err) {
                        if (err) console.error(err);
                    })
                });
            }
					/**
           * @type {CalculatedStats}
           * @private
					 */
					this.cachedCalculatedStats = initCalcStats;
        }.bind(this));

        return instance;
    }

    /**
     * Gets the Calculated stats model
     * @param {Object} res
     * @param {function} next
     * @param {function} Callback
     */
    GetCalculatedStats(res, next, Callback) {
        CalculatedStats.findOne({}, function (err, calculatedStats) {
            if (err) {
                return next(err);
            }
            if (!calculatedStats) {
                new CalculatedStats();
            }
            Callback(calculatedStats);
        });
    }

    /**
     * Gets the Daily Stats model
		 * @param {Object} res
		 * @param {function} next
		 * @param {function} Callback
     */
    GetDailyStats(res, next, Callback) {
        DailyStats.findOne({'createdOn': {$gt: startOfToday}}, function (err, dailyStats) {
            if (err) {
                return next(err);
            }
            if (!dailyStats) {
                new DailyStats();
            }

            Callback(dailyStats);
        });
    }

    /**
     * Updates the daily stats with a new snake and player count
     * @param {UsersSnakes} snakeDetails
     * @param {number} playerCount
     * @param {function} next
     */
    UpdateDailyStats(snakeDetails, playerCount, next) {

        DailyStats.findOneAndUpdate({'createdOn': {$gt: startOfToday}}, {}, {
            upsert: true,
            setDefaultsOnInsert: true
        }, function (err, dailyStats) {
            if (err) return next(err);

            //Calculate the interval_data
            for (var i = 0; i < snakeDetails.interval_data.length.length; i++) {

                if (this.cachedDailyStats.interval_data.highScore[i]) {
                    if (this.cachedDailyStats.interval_data.highScore[i] < snakeDetails.interval_data.length[i]) {
                        dailyStats.interval_data.highScore[i] = snakeDetails.interval_data.length[i];
                    }
                }
                else {
                    dailyStats.interval_data.highScore[i] = snakeDetails.interval_data.length[i]
                }

                if (this.cachedDailyStats.interval_data.sums[i]) {
                    dailyStats.interval_data.sums[i] = this.cachedDailyStats.interval_data.sums[i] + snakeDetails.interval_data.length[i];
                    dailyStats.interval_data.counter[i]++;
                }
                else {
                    dailyStats.interval_data.sums[i] = snakeDetails.interval_data.length[i];
                    dailyStats.interval_data.counter[i] = 1;
                }
            }

            for (var i = 0; i < dailyStats.interval_data.sums.length; i++) {
                //adding 1 to the death because' for the first record, the deaths haven't been calculated yet.
                dailyStats.interval_data.averages[i] = dailyStats.interval_data.sums[i] / (dailyStats.interval_data.counter[i]);
            }

            //calculate the peak
            if (this.cachedDailyStats.peak.concurrent < playerCount) {
                dailyStats.peak.concurrent = playerCount;
                dailyStats.peak.time = new Date();
            }
            else if (this.cachedDailyStats == playerCount) {
                dailyStats.peak.time = new Date();
            }

            //calculate the totals
            dailyStats.totals.boosts = this.cachedDailyStats.totals.boosts + snakeDetails.boosts;
            dailyStats.totals.deaths = this.cachedDailyStats.totals.deaths + 1;
            dailyStats.totals.duration = this.cachedDailyStats.totals.duration + snakeDetails.duration;
            dailyStats.totals.kills = this.cachedDailyStats.totals.kills + snakeDetails.kills;
            dailyStats.totals.length = this.cachedDailyStats.totals.length + snakeDetails.length;

            Users.count({'updatedAt': {$gt: startOfToday}}, function (err, uniqueUsers) {
                if (err) return next(err);

                if (this.cachedDailyStats.totals.unique_users < uniqueUsers)
                    dailyStats.totals.unique_users = this.cachedDailyStats.totals.unique_users + uniqueUsers;


                if ((this.cachedDailyStats.totals.unique_users === null) || (this.cachedDailyStats.totals.unique_users < uniqueUsers)) {
                    dailyStats.totals.unique_users = uniqueUsers;
                }

                this.cachedDailyStats = dailyStats;

                DailyStats.findOneAndUpdate({'createdOn': {$gt: startOfToday}}, dailyStats, function (err, result) {
                    if (err) return next(err);
                });

            }.bind(this));
        }.bind(this));
    }

    /**
     *  Updates calculated stats
     * @param {UsersSnakes} snakeDetails
     * @param {function} next
     */
    UpdateCalculatedStats(snakeDetails, next) {

        CalculatedStats.findOne({}, function (err, calculatedStats) {

            if (!calculatedStats) {
                return next("Calculated stats in UpdateCalculatedStats in statsSingleton returned null");
            }

            calculatedStats.totals.all_time.boosts = this.cachedCalculatedStats.totals.all_time.boosts + snakeDetails.boosts;
            calculatedStats.totals.all_time.deaths = this.cachedCalculatedStats.totals.all_time.deaths + 1;
            calculatedStats.totals.all_time.duration = this.cachedCalculatedStats.totals.all_time.duration + snakeDetails.duration;
            calculatedStats.totals.all_time.kills = this.cachedCalculatedStats.totals.all_time.kills + snakeDetails.kills;
            calculatedStats.totals.all_time.length = this.cachedCalculatedStats.totals.all_time.length + snakeDetails.length

            this.cachedCalculatedStats = calculatedStats;

            CalculatedStats.findOneAndUpdate({}, calculatedStats, function (err, result) {
                if (err) return next(err);
            });

        }.bind(this));
    }

}

module.exports = StatsSingleton;
