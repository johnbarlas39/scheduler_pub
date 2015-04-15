
var schools = require('../../app/controllers/schools.server.controller.js');

module.exports = function(app) {

	app.route('/schools')
		.get(schools.list);

	app.route('/schools/add_new')
		.get(schools.renderAddNewSchool)
		.post(schools.create);


	app.route('/schools/getSchools').get(schools.getSchools);


	app.param('schoolId', schools.schoolById);
	
	app.route('/schools/:schoolId')
		.get(schools.read);

	app.route('/schools/:schoolId/update')
		.get(schools.renderUpdate)
		.post(schools.update);

	app.route('/schools/:schoolId/delete')
		.get(schools.renderDelete)
		.post(schools.delete);


};