
var students = require('../../app/controllers/students.server.controller');

module.exports = function(app) {
	
	app.route('/students')
		.get(students.list);

	app.route('/students/add_new')
		.get(students.renderAddNewStudent)
		.post(students.create);

	app.param('studentId', students.studentById);
	
	app.route('/students/:studentId')
		.get(students.read);

	app.route('/students/:studentId/update')
		.get(students.renderUpdate)
		.post(students.update);

	app.route('/students/:studentId/delete')
		.get(students.renderDelete)
		.post(students.delete);
};