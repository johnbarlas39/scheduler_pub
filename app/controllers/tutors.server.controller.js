
// Get the tutor model
var Tutor = require('mongoose').model('Tutor');
var School = require('mongoose').model('School');

// CREATE //

exports.create = function(req,res,next) {

		var tutor = new Tutor ();
		tutor.firstName = req.body.firstName;

		if (req.body.lastName.length > 0) {
			tutor.lastName = req.body.lastName;
		}

		if (req.body.email.length > 0) {
			tutor.email = req.body.email;
		}

		if (req.body.availability.length > 0) {
			for ( i=0 ; i < req.body.availability.length ; i++ ) {
				tutor.availability[i].startTime = req.body.availability[i].startTime;
				tutor.availability[i].endTime = req.body.availability[i].endTime;
			}
		}

		if (req.body.subjects.length > 0) {
			for ( j=0 ; j < req.body.subjects.length ;j++ ) {
				tutor.subjects[i].name = req.body.subjects[i].name;
				tutor.subjects[i].school = req.body.subjects[i].school;
				tutor.subjects[i].teacher = req.body.subjects[i].teacher;
			}
		}

    	tutor.save(function(err) {
			if (err) 	{ return next(err); } 
			else 		{ return res.redirect('/tutors'); }
		});
};

exports.renderAddNewTutor = function(req, res) {
	res.render('tutor_form', {
		title: 'Add New Tutor',
		user: req.user ? req.user : ''
	});
};

// READ //

exports.list = function(req, res, next) {

	Tutor.find(function(err, tutors) {
		if (err) { return next(err); } 
		else { 
			res.render('tutors', {
				title: 'Tutors',
				tutors: tutors,
				user: req.user ? req.user : ''
			});
		}
	});
};

exports.read = function (req, res) {
	
	res.render('tutorView', {

		title: "Tutor's detailed information",
		tutor: req.tutor,
		user: req.user ? req.user : ''

	});
};

// UPDATE //

exports.update = function (req, res, next) {
	Tutor.findByIdAndUpdate(req.tutor._id, req.body, function(err, tutor) {
		if (err) 	{ return next(err); }
		else 		{ res.redirect('/tutors/' + req.tutor._id); }
	});
};

exports.renderUpdate = function (req, res) {
	res.render('tutorUpdate', {
		title: 'Edit tutor details',
		tutor: req.tutor,
		user: req.user ? req.user : ''
	});
};

// DELETE //

exports.delete = function (req, res, next) {
	req.tutor.remove(function(err) {
		if (err) {
			return next(err);
		} else {
			res.redirect('/tutors');
		}
	});
};

exports.renderDelete = function (req, res, next) {
	res.render('tutorDelete', {
		title: 'Delete tutor',
		tutor: req.tutor
	});
};

// Helper functions //

exports.tutorById = function(req, res, next, id) {
	Tutor.findById(id, function(err, tutor) {
		if (err) {return next(err);}
		else {
			req.tutor = tutor;
			next();
		}
	});
};

