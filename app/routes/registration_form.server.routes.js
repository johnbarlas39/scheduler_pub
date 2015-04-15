// 'use strict';
var registration_form = require('../controllers/registration_form.server.controller');

module.exports = function(app) {
	
	//Define what will be triggered with a GET request to the root url
	app.get('/registration_form', registration_form.render);

	app.route('/registration_form')
		.post(registration_form.create);
};