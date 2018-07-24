var mongoose = require('mongoose');
mongoose.Promise = Promise;

mongoose.connect(process.env.DB_PATH, {useMongoClient: true});
