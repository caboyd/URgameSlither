var mongoose = require('mongoose');

var calculatedStatsSchema = new mongoose.Schema({

    totals:
        {
            all_time:
                {
                    boosts:
                        {
                            type: Number
                        },
                    deaths:
                        {
                            type: Number
                        },
                    duration:
                        {
                            type: Number
                        },
                    kills:
                        {
                            type: Number
                        },
                    length:
                        {
                            type: Number
                        },
                    uniques:
                        {
                            type: Number
                        }
                }
        }
});

var calculatedStats = mongoose.model('calculatedstats', calculatedStatsSchema);
module.exports = calculatedStats;