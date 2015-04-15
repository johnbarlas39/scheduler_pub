'use strict';
//Get the schema created for the user model
var User = require('mongoose').model('User'),
passport = require('passport');


//Private method. Handles messages from errors (Mongoose error object)
//error code handles MongoDB indexing errors and Mongoose validation is handled
//with err.errors object
var getErrorMessage = function(err) {
	var message = '';

	if (err.code) {
		switch (err.code) {
			case 11000:
			case 11001:
				message = "Usename already exists";
				break;
			default:
				message = "Something went wrong";
		}
	} else {
		for (var errName in err.errors) {
			if (err.errors[errName].message) {
				message = err.errors[errName].message;
			}
		}
	}
	return message;
};

exports.renderSignin = function(req, res, next) {
	if (!req.user) {
		//Describes the view which will be rendered by the browser as well as values for the ejs
		res.render('signin', {
			title: 'Sign-in Form',
			messages: req.flash('error') || req.flash('info')
		});
	} else {

		//If a user is signed in redirect to root path
		return res.redirect('/');
	}
};

exports.renderSignup = function(req, res, next) {
	if (!req.user) {
		//Describes the view which will be rendered by the browser as well as values for the ejs
		res.render('signup', {
			title: 'Sign-up Form',
			messages: req.flash('error')
		});
	} else {

		//If a user is signed in redirect to root path
		return res.redirect('/');
	}
};

exports.signup = function(req, res, next) {
	if (!req.user) {
		var user = new User(req.body);
		var message = null;

		user.provider = 'local';

		user.save(function(err) {
			if (err) {
				var message = getErrorMessage(err);

				req.flash('error', message);

				//If a problem occured during the saving process redirect to the sign up page
				return res.redirect('/signup');
			}

			//Method provided by the Passport module and registers a new user.
			//It returns a user object to the res.user
			req.login(user, function(err) {
				if (err) {
					return next(err);
				} else {
					//If everything went ok redirect
					return res.redirect('/');
				}
			});
		});
	} else {
		//If a user is signed in redirect to root path
		return res.redirect('/');
	}
};

exports.signout = function(req, res) {
	//Method provided by the Passport module which invalidates the authenticated session
	req.logout();
	res.redirect('/');
};


// #################################################################################################################################
//Expose create functionality to the application <with middleware structure>
exports.create = function(req, res, next) {

	//Create a new user in the database by using information encapulated in the request's body
	var user = new User(req.body);

	//mongo operation in order to create/save a user instance
	user.save(function(err) {
		if (err) {
			return next(err);
		} else {
			res.json(user);
		}
	});
};

//Expose list all users functionality to the application <with middleware structure>
exports.list = function(req, res, next) {
	//The find method will trigger a query to the database and will call the callback function
	// with the result as the second param and the type of error (if exists) as the first param
	User.find({}, function(err, users) {
		if (err) {
			return next(err);
		} else {
			res.json(users);
		}
	});
};

//This middleware is called after the userByID below in order 
//to return as a response to the  GET request the user in a json data container
exports.read = function(req, res) {

	res.json(req.user);

};

//Find a user by its ID attribute and pass it to the next middleware read()
exports.userByID = function(req, res, next, id) {
	User.findOne({
		_id: id,
	}, function(err, user) {
		if (err) {
			return next(err);
		} else {
			//Add to the original request object a property called user 
			//which will contains user's info as aquired from the database
			req.user = user;
			next();
		}
	});
};

exports.update = function(req, res, next) {
	//req.body contains the key-value data that will be updated
	User.findByIdAndUpdate(req.user.id, req.body, function(err, user) {
		if (err) {
			return next(err);
		} else {
			res.json(user);
		}
	});
};

exports.delete = function(req, res, next) {
	req.user.remove(function(err) {
		if (err) {
			return next(err);
		} else {
			res.json(req.user);
		}
	});
};