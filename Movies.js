var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.Promise = global.Promise;

mongoose.connect(process.env.DB, {useUnifiedTopology: true,  useNewUrlParser: true } );
mongoose.connection.once('open', function(){
    console.log('Connected!');
}).on('error', function(error){
    console.log('Error: ', error);
});
mongoose.set('useCreateIndex', true);
//movies schema
var MoviesSchema = new Schema({
    title: String,
    year: Number,
    genre: String,
    cast: [{name: String, role: String}]
});

module.exports = mongoose.model('Movie', MoviesSchema);