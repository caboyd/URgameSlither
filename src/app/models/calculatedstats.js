var mongoose = require('mongoose');
/**
 * CalculatedStats Schema
 * @constructor CalculatedStats
 */
var calculatedStatsSchema = new mongoose.Schema({

    totals:
        {
            all_time:
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
                        }
                }
        }
},{timestamps: true});

var calculatedStats = mongoose.model('calculatedstats', calculatedStatsSchema);
module.exports = calculatedStats;