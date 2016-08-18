var connect = require('connect');
var bodyParser = require('body-parser');

var app = connect();
app.use(bodyParser.json());

module.exports = app;
