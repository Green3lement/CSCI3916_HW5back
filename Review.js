var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.Promise = global.Promise;

mongoose.connect(process.env.DB,{useUnifiedTopology: true,  useNewUrlParser: true } );

mongoose.set('useCreateIndex', true);

var ReviewSchema = new Schema({
    'title': String,
    'username': String,
    'rating': Number
});

module.exports = mongoose.model('Review', ReviewSchema);