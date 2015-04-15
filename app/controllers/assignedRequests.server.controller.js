
// Get the assigned request model
var AssignedRequest = require('mongoose').model('AssignedRequest');
var School = require('mongoose').model('School');
var Student = require('mongoose').model('Student');
var Tutor = require('mongoose').model('Tutor');

var async = require('async');

// Function that adds new assigned request to database
exports.create = function(req,res,next) {
	
	var fullNameStudent = req.body.student.split(' ');
	var fullNameTutor   = req.body.tutor.split(' ');

	Student.find( {'firstName' : fullNameStudent[0], lastName: fullNameStudent[1]}, function (err,students) {

		Tutor.find( {'firstName' : fullNameTutor[0], lastName: fullNameTutor[1]}, function (err,tutors) {

			var assignedRequest = new AssignedRequest ({
				student:    students[0].id,
				tutor:      tutors[0].id,
				subject:    req.body.subject,
				startTime:  req.body.startTime,
				endTime:    req.body.endTime
			});

			assignedRequest.save(function(err) {
				if (err)  { return next(err); }
				else      { return res.redirect('f/assignedRequests'); }
			});
		});
    });
};

exports.list = function(req, res, next) {
	AssignedRequest.find({}, function(err, assignedRequests) {
		if (err) { return next(err); } 
		else { res.json(assignedRequests); }
	});
};

exports.render = function(req, res) {
	res.render('assignedRequests', {
		title: 'Assigned Requests',
		user: req.user ? req.user : ''
	});
};

exports.renderAddNewAssignedRequest = function(req, res) {
	res.render('assigned_request_form', {
		title: 'AddNew',
		user: req.user ? req.user : ''
	});
};

exports.renderProgram = function(req, res) {
	Tutor.find(function (err,tutors) {
		res.render('program', {
			title: 'Program',
			user: req.user ? req.user : '',
			tutors: tutors
		});
	});
};


exports.populateProgram = function (req, res, next) {
	console.log("backend");
	console.log(req.body);

	var tutor = req.body.tutor;
	var date = new Date(req.body.date);
	var day = date.getDate();

	var assignments = [];
	var student;

	async.series([
		function (callback) {
			AssignedRequest.find ( {tutor: tutor} ).lean().exec( function (err, assigns) {
				assignments = assigns.filter( function (assign) {
					return assign.startTime.getDate() == day;
				});
				callback();
			});
		},
		function (callback) {
			async.forEach(assignments, function(assignment, callback) {

				Student.findById(assignment.student, function (err, student) {
					assignment.studentName = student.fullName;
					
					var subject = student.subjectRequest.filter( function(subj) {
						return assignment.subject == subj.subject;
					});

					assignment.teacher = subject[0].teacher;

					
					School.findById(student.school, function(err, school) {
						assignment.school = school.name;
						callback();
					});

				});
			}, function(err) {
				if (err) {return next(err);}
				else {callback();}
			});
		},
	], function (err) {
		if (err) { return next(err) ; }
		else {
			req.assignments = assignments;
			res.json(req.assignments);
		}
	});
	
};

exports.renderStudentProgram = function (req,res,next) {
	
	Student.findById(req.params.studentId, function(err,student) {
		res.render('student_program', {
			title: 'Student Program',
			user: req.user ? req.user : '',
			student: student
		});
	});
};

exports.getAssignments = function (req,res,next) {
	console.log(req.body);
	AssignedRequest.find({student: req.body.studentId}).populate('tutor', 'firstName').exec(function (err, assigns) {
		res.json(assigns);
	});
};