// 'use strict';
var student_registration_form = require('../controllers/student_registration_form.server.controller');

module.exports = function(app) {
	
	//Define what will be triggered with a GET request to the root url
	app.get('/student_registration_form', student_registration_form.render);

	app.route('/student_registration_form')
		.post(student_registration_form.create);
};