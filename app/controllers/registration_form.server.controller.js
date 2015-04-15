// 'use strict';

var DayRequest = require('mongoose').model('DayRequest');
var School = require('mongoose').model('School');
var Student = require('mongoose').model('Student');
var helper = require('../../app/controllers/helper.server.controller');

exports.render = function(req, res) {

	var studentPhoneTypes = helper.phoneTypesStudent();
	var parentPhoneTypes = helper.phoneTypesParent();

	School.find ({}, function(err, schools) {
		res.render('registration_form', {
			title: 'Registration Form',
			user: req.user ? req.user : '',
			schools: schools,
			studentPhoneTypes: studentPhoneTypes,
			parentPhoneTypes: parentPhoneTypes
		});
	});
};

exports.create = function (req,res,next) {
	  //////////////
	 // Validate //
	//////////////
	
	// TO DO
	
	  /////////////////////////////////////////////
	 // Get subject requests and update student //
	/////////////////////////////////////////////
	
	// * First gather all subject requests in the subjectRequest array * //
	var subjectRequest = [];
	var sub_array = req.body.subjectRequest;
	var len = sub_array.length;

	for (var i=0 ; i<len ; i++) {
		if (sub_array[i].subject !== '0' && sub_array[i].teacher !== '0') {
			subjectRequest.push({
				"subject": sub_array[i].subject,
				"teacher": sub_array[i].teacher,
				"examDate": sub_array[i].examDate,
				"hoursRequested": sub_array[i].hoursRequested,
				"requestedTutor": sub_array[i].requestedTutor
			});
		}
	}

	// * Then get comments * //
	var comments = req.body.comments;

	// * Update student document * //
	var conditions = {"subjectRequest": subjectRequest, "comments": comments};

	Student.update({"_id": req.body.student}, conditions, function(err) {
		if (err) { next(err); }
	});

	  /////////////////////////
	 // Create day requests //
	/////////////////////////
	
	var dayRequests = [];
	var day_array = req.body.dayRequests;
	var start , end ;

	// For each day
	for (var j=0 ; j<7 ; j++) {
		console.log(day_array[j]);
		// If there has been a day request
		if (day_array[j].sub[0].subject !== "0") {

			// For each subject requested for that day
			for (var k=0 ; k<day_array[j].sub.length ; k++) {

				// Create a new day request
				var dayRequest = new DayRequest();
				
				dayRequest.student = req.body.student;
				dayRequest.subject = day_array[j].sub[k].subject;
				dayRequest.hoursRequested = day_array[j].sub[k].hoursRequested;
				dayRequest.session = day_array[j].sub[k].session;
				dayRequest.availability = [];
				
				for (var l=0 ; l<day_array[j].availability.length ; l++) {
					
					start = helper.clearDate(day_array[j].availability[l].startTime);
					end = helper.clearDate(day_array[j].availability[l].endTime);

					dayRequest.availability.push({
						"startTime": start,
						"endTime": end
					});
				}

				dayRequest.backup = day_array[j].backUp;
				dayRequest.save();
			}
		}
	}

	res.render('index', {
		//Data passed dynamically to the ejs view template
		title: 'Scheduler',
		greetings: 'Welcome to Scheduler',
		user: req.user
	});

};

