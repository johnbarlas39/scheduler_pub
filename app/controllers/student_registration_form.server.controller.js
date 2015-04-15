// 'use strict';

var School = require('mongoose').model('School');
var Student = require('mongoose').model('Student');
var helper = require('../../app/controllers/helper.server.controller');

exports.render = function(req, res) {

	var studentPhoneTypes = helper.phoneTypesStudent();
	var parentPhoneTypes = helper.phoneTypesParent();

	School.find ({}, function(err, schools) {
		res.render('student_registration_form', {
			title: 'Student Registration Form',
			user: req.user ? req.user : '',
			schools: schools,
			studentPhoneTypes: studentPhoneTypes,
			parentPhoneTypes: parentPhoneTypes
		});
	});
};


exports.create = function (req,res,next) {

	// Validate input //
	// TO DO
	
	function createStudent(req, callback) {
		var student = new Student();
		student.firstName = req.body.firstName;
		student.lastName = req.body.lastName;
		student.email = req.body.email;

		for (var i=0 ; i<req.body.phones.length ; i++) {
			if (req.body.phones[i].number.length > 0) {
				student.phone.push({"number": req.body.phones[i].number, "phoneType": req.body.phones[i].type});
			}
		}

		var parentPhones = [];
		for (var j=0 ; j<req.body.parents.length ; j++) {
			parentPhones = [];
			for (var k=0 ; k<req.body.parents[j].phone.length ; k++) {
				if (req.body.parents[j].phone[k].number.length > 0) {
					parentPhones.push({"number": req.body.parents[j].phone[k].number, "phoneType":req.body.parents[j].phone[k].type});
				}
			}

			student.parent.push({
				"firstName": req.body.parents[j].firstName,
				"lastName": req.body.parents[j].lastName,
				"email": req.body.parents[j].email,
				"phone": parentPhones
			});
		}
		student.school = req.body.school;

		student.save();
		callback(req, student);
	}

	function findSchool(req, student) {
		School.findById(req.body.school, function(err, school) {
			final(req, student, school);
		});
	}

	function final(req, student, school) {
		res.render('registration_form', {
			title: 'Registration Form',
			user: req.user ? req.user : '',
			school: school,
			student: student._id
		});
	}

	createStudent(req, findSchool);

};

function validateStudent (req) {
	console.log('In student validation');
	console.log(req.body);

	var secondPhone = false;
	var secondParent = false;
	var studentPhone_2, studentPhoneType_2;

	// Patterns needed
	var pattern_1 = /^[A-Za-z \-]+$/;	// for strings
	var pattern_2 = /^[0-9+\-]+$/ ;		// for numbers

	// Get info
	var firstName = req.body.firstName.trim();
	var lastName = req.body.lastName.trim();
	var email = req.body.email.trim();

	var phones = [];
	for (i=0 ; i<req.body.phones.length ; i++) {
		phones[i] = {
			number: req.body.phones[i].number.trim(),
			phoneType: req.body.phones[i].type.trim()
		};
	}

	var school = req.body.school;
	
	// Check that they are not empty
	function isEmpty (string) {
		if (string.length <= 0) { return false ; }
	}

	isEmpty(firstName);
	isEmpty(lastName);
	isEmpty(email);

	for (j=0 ; j<phones.length ; j++) {
		isEmpty(phones[j].number.length);
		isEmpty(phones[j].phoneType.length);
	}

	isEmpty(school);

}

