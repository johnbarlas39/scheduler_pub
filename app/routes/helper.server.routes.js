var helpers = require('../../app/controllers/helper.server.controller');
var pdf = require('../../app/controllers/pdf.server.controller');
var mail = require('../../app/controllers/mail.server.controller');

module.exports = function(app) {
	
	app.param('schoolId', helpers.findSchoolById);
	app.param('subjectName', helpers.findTeacherBySubjectName);
	app.param('combo', helpers.findStudentsForScheduling);
	app.param(':zero', helpers.allSubjects);

	app.route('/helpers/get_all_subjects/:zero').get(helpers.readSchool);
	app.route('/helpers/get_subjects/:schoolId').get(helpers.readSchool);
	app.route('/schedules/students/:file').get(helpers.downloadScheduleS);
	app.route('/schedules/tutors/:file').get(helpers.downloadScheduleT);
	
	app.route('/helpers/get_sub_teacher/:schoolId/:subjectName').get(helpers.readTeachers);
	
	app.route('/helpers/get_students_scheduling/:combo').get(helpers.readStudentsForScheduling);

	app.route('/helpers/assignClass').post(helpers.assignClass);

	app.route('/helpers/saveRowEdit').post(helpers.saveRowEdit);


	// PDF
	app.route('/helpers/pdf').post(pdf.makePdf);

	// EMAIL
	app.route('/helpers/mail').post(mail.sendMail);
};