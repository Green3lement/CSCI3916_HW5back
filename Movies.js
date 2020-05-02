var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.Promise = global.Promise;

mongoose.connect(process.env.DB, {useUnifiedTopology: true,  useNewUrlParser: true } );
mongoose.set('useCreateIndex', true);
//movies schema
var MoviesSchema = new Schema({
    title: String,
    year: Number,
    genre: String,
    cast: [{name: String, role: String}],
    imageURL: { type: String, required: true}
});

module.exports = mongoose.model('Movie', MoviesSchema);
