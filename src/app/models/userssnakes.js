var mongoose = require('mongoose');

/**
 * Users Snakes Schema
 * @constructor UsersSnakes
 */
var usersSnakesSchema = new mongoose.Schema({
    cookie_id:
        {
            type: String,
            default: ""
        },
    boosts:
        {
            type: Number,
            default: 0
        },
    createdOn:
        {
            type: Date,
            default: Date.now()
        },
    duration:
        {
            type: Number,
            default: 0
        },
    interval_data:
        {
            length:
                {
                    type: [Number],
                    default: []
                },
            kills:
                {
                    type: [Number],
                    default: []
                }
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
});

var usersSnakes = mongoose.model('users.snakes', usersSnakesSchema);
module.exports = usersSnakes;