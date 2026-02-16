const mongoose = require('mongoose');
require('dotenv').config()
const CONNECTED_TO_DB = mongoose.connect(process.env.MONGO_URI)

module.exports = {
    CONNECTED_TO_DB
}