
// Get the school model
var School = require('mongoose').model('School');




// CREATE //

exports.create = function(req,res,next) {
	
	var school = new School(req.body);			// Get request's body

	school.save(function(err){
		if (err)	{ return next(err); }					// Send error to next middleware
		else 		{ return res.redirect('/schools'); }	// If successful, redirect to /schools
	});
};

exports.renderAddNewSchool = function(req, res) {
	res.render('school_form', {
		title: 'Add New School',
		user: req.user ? req.user : ''
	});
};

// READ //

exports.list = function(req, res, next) {

	School.find(function(err, schools) {
		
		if (err) { return next(err); } 
		else { 
			res.render('schools', {
				title: 'Schools',
				schools: schools,
				user: req.user ? req.user : ''
			}); 
		}
	});
};

exports.getSchools = function (req,res,next) {
	
	console.log("in get schools");

	School.find(function(err,schools) {
		if (err) { return next(err) ; }
		else { res.json(schools) ; }
	});
};

exports.read = function(req, res) {
	res.render('schoolView', {
		title: "School's detailed information",
		school: req.school,
		user: req.user ? req.user : ''
	});
};

// UPDATE //

exports.update = function(req, res, next) {

	School.findByIdAndUpdate(req.school._id, req.body, function(err, school) {
		if (err) 	{ return next(err); }
		else 		{ res.redirect('/schools/' + req.school._id); }
	});
};

exports.renderUpdate = function(req, res) {

	res.render('schoolUpdate', {
		title: 'Edit school details',
		school: req.school,
		user: req.user ? req.user : ''
	});
};

// DELETE //

exports.delete = function(req, res, next) {
	req.school.remove(function(err) { 
		if (err) 	{ return next(err); }
		else 		{ res.redirect('/schools'); }
	});
};

exports.renderDelete = function (req, res, next) {
	res.render('schoolDelete', {
		title: 'Delete school',
		school: req.school
	});
};


// Helper functions //

exports.schoolById = function(req,res,next,id) {
	School.findById( id, function(err, school) {
		if (err) { return next(err); }
		else {
			req.school = school;
			next();
		}
	});
};
