
var scheduling = require('../controllers/scheduling.server.controller');

module.exports = function(app) {
	
	app.route('/scheduling')
		.get(scheduling.create);
};