var passport  = require('passport'),
LocalStrategy = require('passport-local').Strategy,
User          = require('mongoose').model('User');

module.exports = function() {
	//Login strategy
	//The third argument of the function is a callback (done) which will be called
	//when the authentication process is over 
	passport.use(new LocalStrategy(function(username, password, done) {
		
		User.findOne({
			username: username
		}, function(err, user) {
			if (err) {
				return done(err);
			}

			if (!user) {
				return done(null, false, { message: 'Unknown user' });
			}
			
			//Custom method delcared on the schema
			if (!user.authenticate(password)) {
				return done(null, false, { message: 'Invalid password' });
			}

			return done(null, user);
		});
	}));
};