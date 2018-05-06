let express = require('express');

let Users = require('../models/users');
let UsersStats = require('../models/usersStats');
let UsersSnakes = require('../models/userssnakes');

/**
 *  Static helper class to get and update model related to the User model
 */
class UserService {
    /**
     *
     * @param {Object} express
     * @constructor
     */
    constructor(express) {
			/**
       * @private
			 * @type {Object}
			 */
			this.express = express;
    }

    /**
     *  Gets a user model by the users cookie_id
     * @param {String} cookie_id
     * @param {Object} res
     * @param {function} next
     * @param {function} Callback
     */
    static GetUser(cookie_id, res, next, Callback) {
        Users.findOne({'cookie_id': cookie_id}, function (err, users) {
            if (err) {
                return next(err);
            }

            if (!users) {
                users = new Users();
            }

            Callback(users);
        });
    }

    /**
     *  Gets a list of UsersSnakes that were created after the specified date
     * @param {Date} startOfToday
     * @param {function} Callback
     */
    static GetUsersSnakesAfterDate(startOfToday, Callback) {
        UsersSnakes.find({'createdOn': {$gte: startOfToday}}, function (err, usersSnakes) {
            if (err) {
                throw("Wasn't able to find usersSnakes in GetUsersSnakesAfterDate in userService " + err);
            }
            if (!usersSnakes) {
                usersSnakes = new UsersSnakes();
            }

            Callback(usersSnakes);
        });
    }

    /**
     *  Gets the UsersStats model for a user by their cookie_id
     * @param {String} cookie_id
     * @param {Object} res
     * @param {function} next
     * @param {function} Callback
     */
    static GetUsersStats(cookie_id, res, next, Callback) {
        UsersStats.findOne({'cookie_id': cookie_id}, function (err, usersStats) {
            if (err) {
                return next(err);
            }
            if (!usersStats) {
                usersStats = new UsersStats({best_snake: new UsersSnakes()}); //cause' best_snake can't be defaulted in the model
            }

            Callback(usersStats);
        });
    }

    /**
     *  Updates a user model or creates a new on if they dont exists in the database
     * @param {Users} userDetails
     * @param {function} next
     */
    static UpdateUsers(userDetails, next) {

        Users.update({cookie_id: userDetails.cookie_id}, userDetails, {upsert: true}, function (err, result) {

            if (err) return next("Can't run Users.update in userService: " + err);
            else if (result.ok == '0') return next("Result from Users.update in UserService: " + JSON.stringify(result));
        });
    }

    /**
     *  Updates the users stats model with their new snake details
     * @param {UsersSnakes} snakeDetails
     * @param {function} next
     */
    static UpdateUsersStats(snakeDetails, next) {

        //creating a user stats record if one doesn't exist already
        UsersStats.update({cookie_id: snakeDetails.cookie_id}, {}, {
            upsert: true,
            setDefaultsOnInsert: true
        }, function (err, result) {

            if (err) return next("UsersStats.update didn't work in UserService: " + err);
            else if (result.ok == '0') return next("Result from UsersStats.update in UserService: " + JSON.stringify(result));

            //Now, find the created/exisiting record with this cookie_id
            UsersStats.findOne({cookie_id: snakeDetails.cookie_id}, function (err, userStatsRecord) {

                if (!userStatsRecord)
                    userStatsRecord = new UsersStats();

                //update best snake
                if (snakeDetails.length > userStatsRecord.best_snake.length) {
                    userStatsRecord.best_snake = snakeDetails;
                }

                //  update totals
                userStatsRecord.totals.boosts = userStatsRecord.totals.boosts + snakeDetails.boosts;
                userStatsRecord.totals.deaths = userStatsRecord.totals.deaths + 1;
                userStatsRecord.totals.duration = userStatsRecord.totals.duration + snakeDetails.duration;
                userStatsRecord.totals.kills = userStatsRecord.totals.kills + snakeDetails.kills;
                userStatsRecord.totals.length = userStatsRecord.totals.length + snakeDetails.length;

                //update cumulative_moving_average_snake_length
                userStatsRecord.cumulative_moving_average_snake_length.push(userStatsRecord.totals.length / userStatsRecord.totals.deaths);

                //update interval_data
                for (var i = 0; i < snakeDetails.interval_data.length.length; i++) {

                    if (userStatsRecord.interval_data.highScore[i]) {
                        if (userStatsRecord.interval_data.highScore[i] < snakeDetails.interval_data.length[i]) {
                            userStatsRecord.interval_data.highScore[i] = snakeDetails.interval_data.length[i];
                        }
                    }
                    else {
                        userStatsRecord.interval_data.highScore[i] = snakeDetails.interval_data.length[i];
                    }

                    //if there's already something in sums at i
                    if (userStatsRecord.interval_data.sums[i]) {
                        userStatsRecord.interval_data.sums[i] = userStatsRecord.interval_data.sums[i] + snakeDetails.interval_data.length[i];
                        userStatsRecord.interval_data.counter[i]++;
                    }
                    else {
                        userStatsRecord.interval_data.sums[i] = snakeDetails.interval_data.length[i];
                        userStatsRecord.interval_data.counter[i] = 1;
                    }

                    userStatsRecord.interval_data.averages[i] = userStatsRecord.interval_data.sums[i] / (userStatsRecord.interval_data.counter[i]);
                }

                //update records
                if (snakeDetails.kills > userStatsRecord.records.highest_kills)
                    userStatsRecord.records.highest_kills = snakeDetails.kills;

                if (snakeDetails.largestSnake > userStatsRecord.records.largest_snake_killed_length)
                    userStatsRecord.records.largest_snake_killed_length = snakeDetails.largestSnake;

                //update last modified date
                userStatsRecord.lastModifiedOn = new Date();

                //save the new calculate data into the cookie_id record.
                UsersStats.findOneAndUpdate({cookie_id: snakeDetails.cookie_id}, userStatsRecord, function (err, result) {
                    if (err) return next(err);
                    else if (result.ok == '0') return next(JSON.stringify(result));

                });
            });

        });
    }

    /**
     *  Insert a new UsersSnakes model into the database
     * @param {UsersSnakes} snakeDetails
     * @param {function} next
     */
    static InsertUsersSnake(snakeDetails, next) {

        const saveSnakeDetails = new UsersSnakes(snakeDetails);

        saveSnakeDetails.save(function (err) {
            if (err) return next("InsertUsersSnake wasn't able to save snake: " + err);
        });
    }

}

module.exports = UserService;
