var index = require('../controllers/index.server.controller');

module.exports = function(app) {
	
	//Define what will be triggered with a GET request to the root url
	app.get('/', index.render);
};