
var School = require('mongoose').model('School');
var Student = require('mongoose').model('Student');
var Tutor = require('mongoose').model('Tutor');

exports.create = function(req,res) {

	School.find(function (err, schools) {
		Tutor.find(function(err,tutors) {
			res.render('schedulingView', {
				title: 'Scheduling',
				user: req.user ? req.user : '',
				userFullName: req.user ? req.user.userFullName : '',
				schools: schools,
				tutors: tutors
			});
		});
	});

};