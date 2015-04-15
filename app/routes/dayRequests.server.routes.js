
var dayRequests = require('../../app/controllers/dayRequests.server.controller.js');
var students = require('../../app/controllers/students.server.controller.js');

module.exports = function(app) {

	app.param('studentId', students.studentById);
	app.param('dayRequestId', dayRequests.dayRequestById);

	// Create new day request
	app.route('/students/:studentId/dayRequests/add_new')
		.get(dayRequests.renderAddNewDayRequest)
		.post(dayRequests.create);
	
	// View all day requests for a student
	app.route('/students/:studentId/dayRequests')
		.get(dayRequests.list);

	// View a specific day request for a student
	app.route('/students/:studentId/dayRequests/:dayRequestId')
		.get(dayRequests.read);

	// Update the details of a student's day request
	app.route('/students/:studentId/dayRequests/:dayRequestId/update')
		.get(dayRequests.renderUpdate)
		.post(dayRequests.update);

	// Delete a student's day request
	app.route('/students/:studentId/dayRequests/:dayRequestId/delete')
		.get(dayRequests.renderDelete)
		.post(dayRequests.delete);

};