
var tutors = require('../../app/controllers/tutors.server.controller');

module.exports = function(app) {
	
	app.param('tutorId', tutors.tutorById);

	// Create a new tutor
	app.route('/tutors/add_new')
		.get(tutors.renderAddNewTutor)
		.post(tutors.create);

	// View all tutors
	app.route('/tutors')
		.get(tutors.list);

	// View a specific tutor
	app.route('/tutors/:tutorId')
		.get(tutors.read);

	// Update a specific tutor's details
	app.route('/tutors/:tutorId/update')
		.get(tutors.renderUpdate)
		.post(tutors.update);

	// Delete a specific tutor
	app.route('/tutors/:tutorId/delete')
		.get(tutors.renderDelete)
		.post(tutors.delete);
};