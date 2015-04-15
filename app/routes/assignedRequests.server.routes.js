var assignedRequests = require('../../app/controllers/assignedRequests.server.controller.js');

module.exports = function(app) {

	app.route('/assignedRequests').get(assignedRequests.list);

	app.route('/assignedRequests/add_new')
		.get(assignedRequests.renderAddNewAssignedRequest)
		.post(assignedRequests.create);
	
	app.route('/program').get(assignedRequests.renderProgram);
	app.route('/student_program/:studentId').get(assignedRequests.renderStudentProgram);

	app.route('/populateProgram')
		.get(assignedRequests.populateProgram)
		.post(assignedRequests.populateProgram);

	app.route('/populateStudentProgram').post(assignedRequests.getAssignments);
};