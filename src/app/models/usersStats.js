var mongoose = require('mongoose');
let UsersSnakes = require('./userssnakes');

/**
 * Users Stats Schema
 * @constructor UsersStats
 */
var usersStatsSchema = new mongoose.Schema({
    best_snake: UsersSnakes.schema,
    cookie_id:
        {
            type: String,
            default: ""
        },
    cumulative_moving_average_snake_length:  //
        {
            type: [Number],
            default: []
        },
    interval_data:
        {
            averages:
                {
                    type: [Number],
                    default: []
                },
            sums:
                {
                    type: [Number],
                    default: []
                },
            counter:
                {
                    type: [Number],
                    default: []
                },
            highScore:
                {
                    type: [Number],
                    default: []
                }

        },
    lastModifiedOn:
        {
            type: Date,
            default: Date.now()
        },

    records:
        {
            highest_kills:
                {
                    type: Number,
                    default: 0
                },
            largest_snake_killed_length:
                {
                    type: Number,
                    default: 0
                }
        },
    totals:  //averages on stats page are the totoals/#ofgames
        {
            boosts:
                {
                    type: Number,
                    default: 0
                },
            deaths:  //game played
                {
                    type: Number,
                    default: 0
                },
            duration:
                {
                    type: Number,
                    default: 0
                },
            kills:
                {
                    type: Number,
                    default: 0
                },
            length:
                {
                    type: Number,
                    default: 0
                }

        }

});

var usersStats = mongoose.model('users.stats', usersStatsSchema);
module.exports = usersStats;