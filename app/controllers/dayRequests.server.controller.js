
//Get the schema created for the Student model
var DayRequest = require('mongoose').model('DayRequest');
var Student = require('mongoose').model('Student');

// CREATE //

exports.create = function(req, res, next) {

	var dayRequest = new DayRequest (req.body);

	dayRequest.save (function (err) {
		if (err) {return next(err);} 
		else {
			return res.redirect('/students/' + req.student._id + '/dayRequests');
		}
	});
};

exports.renderAddNewDayRequest = function(req, res) {

	res.render('dayRequest_form', {
		title: 'Add New Day Request',
		student: req.student
	});
};

// READ //

exports.list = function(req, res, next) {

	Student.findById(req.student._id, function(err,studentFound) {
		DayRequest.find({"student":studentFound._id}, function(err, dayRequests) {

			if (err) {
				return next(err);
			} else {
				res.render('dayRequests', {
					title: 'Day Requests',
					dayRequests: dayRequests,
					student: studentFound
				});
			}

		});
	});
};

exports.read = function (req, res) {
	Student.findById(req.dayRequest.student, function(err, student) {
		res.render('dayRequestView', {
			title: 'Day Request Details',
			student: student,
			dayRequest: req.dayRequest
		});
	});
};

// UPDATE //

exports.update = function (req, res, next) {
	DayRequest.findByIdAndUpdate(req.dayRequest._id, req.body, function(err, dayRequest) {
		if (err) {return next(err);}
		else {
			res.redirect('/students/' + req.student._id + '/dayRequests/' + req.dayRequest._id );
		}
	});
};

exports.renderUpdate = function (req, res) {
	res.render('dayRequestUpdate', {
		title: 'Edit day request details',
		dayRequest: req.dayRequest,
		student: req.student
	});
};

// DELETE //

exports.delete = function (req, res, next) {
	req.dayRequest.remove( function (err) {
		if (err) {return next(err);}
		else {
			res.redirect('/students/' + req.student._id + '/dayRequests/');
		}
	});
};

exports.renderDelete = function (req, res) {
	res.render('dayRequestDelete', {
		title: 'Delete this day request',
		dayRequest: req.dayRequest,
		student: req.student
	});
};


// Helper functions //

exports.dayRequestById = function(req, res, next, id) {
	DayRequest.findById(id, function(err, dayRequest) {
		if (err) {return next(err);}
		else {
			req.dayRequest = dayRequest;
			next();
		}
	});
};

