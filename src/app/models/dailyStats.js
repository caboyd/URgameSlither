var mongoose = require('mongoose');
/**
 * Daily Stats Schema
 * @constructor DailyStats
 */
var dailyStatsSchema = new mongoose.Schema({

    createdOn:
        {
            type: Date,
            default: Date.now()
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
    peak:
        {
            concurrent:
                {
                    type: Number,
                    default: 0
                },
            time:
                {
                    type: Date
                }
        },
    totals:
        {
            boosts:
                {
                    type: Number,
                    default: 0
                },
            deaths:
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
                },
            unique_users:
                {
                    type: Number,
                    default: 0
                }

        }

},{timestamps: true});

var dailyStats = mongoose.model('dailystats', dailyStatsSchema);
module.exports = dailyStats;
