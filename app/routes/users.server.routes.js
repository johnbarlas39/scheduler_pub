var users = require('../../app/controllers/users.server.controller'),
passport  = require('passport');

module.exports = function(app) {
	
	//Define what will be triggered with a POST request to this url </users>
	app.route('/users')
		.post(users.create)
		.get(users.list);
	
	//The .param will be called before any of these actions (post,get,put,delete)
	//This mechanism will ensure that the user property will be added in the request
	app.param('userId', users.userByID);
	app.route('/users/:userId')
		.get(users.read)
		.put(users.update)
		.delete(users.delete);
	
	//Describe the actions on the specific route
	//render will be triggered upon GET
	//POST requests will trigger the server behaviour described by the user's controller method
	app.route('/signup')
		.get(users.renderSignup)
		.post(users.signup);

	app.route('/signin')
		.get(users.renderSignin)
		.post(passport.authenticate('local', {
			successRedirect: '/',
			failureRedirect: '/signin',
			failureFlash: true
		}));
		
	app.get('/signout', users.signout);
};