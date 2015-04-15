
//Get the schema created for the Student model
var Student = require('mongoose').model('Student');
var School = require('mongoose').model('School');
var Tutor = require('mongoose').model('Tutor');

var helper = require('./helper.server.controller.js');

// CREATE //

exports.create = function(req, res, next) {

		var student = new Student(req.body);

    	student.save(function(err) {
			if (err) 	{ return next(err); }
			else 		{ return res.redirect('/students'); }
		});
};

/*
// Version of list with forced synchronous execution
exports.list = function(req, res, next) {

	var events = require('events');
	var EventEmitter = events.EventEmitter;

	var flowController = new EventEmitter();

	flowController.on('start', function() {
		studentsList = [];
		i = 0;
		Student.find(function (err, students) {
			flowController.emit('2', students, studentsList, i);
		});
	});

	flowController.on('2', function(students, studentsList, i) {
		if (i >= students.length) {
			flowController.emit('3', studentsList);
		}
		else {
			School.findById(students[i].school, function(err, schoolFound) {
				var studentInfo = {};

				studentInfo.lastName = students[i].lastName;
				studentInfo.firstName = students[i].firstName;
				studentInfo.school = schoolFound.name;
				studentInfo.id = students[i].id;

				studentsList.push(studentInfo);
				flowController.emit('2', students, studentsList, i+1);
			});
			
		}
	});

	flowController.on('3', function(studentsList) {
		res.render('students', {
			title: 'Students',
			students: studentsList
		});
	});

	flowController.emit('start');
};
*/

exports.renderAddNewStudent = function(req, res) {
	res.render('student_form', {
		title: 'Add New Student',
		user: req.user ? req.user : ''
	});
};


// READ //

exports.list = function(req, res, next) {

	Student.find().populate('school', 'name').exec(function(err, students) {
			
		if (err) {return next(err);}
		else {
			res.render('students', {
				title: 'Students',
				students: students,
				user: req.user ? req.user : ''
			});
		}
	});
};

exports.read = function (req, res) {

	School.findById(req.student.school, function(err, schoolFound) {
		
			res.render('studentView', {
				title: "Student's detailed information",
				school: schoolFound.name,
				student: req.student,
				user: req.user ? req.user : ''
			});
		
	});
};

// UPDATE //

exports.update = function (req, res, next) {

	Student.findByIdAndUpdate(req.student._id, req.body, function(err, student) {
		if (err) 	{ return next(err); }
		else 		{ res.redirect('/students/' + req.student._id); }
	});
};

exports.renderUpdate = function (req, res) {
	
	School.findById(req.student.school, function(err, school) {
	
		res.render('studentUpdate', {
			title: 'Edit student details',
			student: req.student,
			school: school.name,
			user: req.user ? req.user : ''
		});
	
	});

};

// DELETE //

exports.delete = function (req, res, next) {
	req.student.remove(function(err) {
		if (err) {
			return next(err);
		} else {
			res.redirect('/students');
		}
	});
};

exports.renderDelete = function (req, res, next) {
	res.render('studentDelete', {
		title: 'Delete student',
		student: req.student
	});
};

// Helper functions //

exports.studentById = function(req, res, next, id) {
	Student.findById(id, function(err, student) {
		if (err) {return next(err);}
		else {
			req.student = student;
			next();
		}
	});
};
