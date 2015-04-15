// 'use strict';
//Modules and packages
var config     = require('./config'),
express        = require('express'),
morgan         = require('morgan'),
compress       = require('compression'),
bodyParser     = require('body-parser'),
methodOverride = require('method-override'),
session        = require('express-session'),
flash          = require('connect-flash'),
passport       = require('passport');


module.exports = function() {

	var app = express();

	if(process.env.NODE_ENV === 'development') {
		app.use(morgan('dev'));
		//Enforce session policies
		app.use(session({
			saveUninitialized: true,
			resave: true,
			secret: config.sessionSecret,
			cookie: {httpOnly: true, secure: false}
		}));
	} else if (process.env.NODE_ENV === 'production') {
		app.use(compress());
		//Enforce session policies
		app.use(session({
			saveUninitialized: true,
			resave: true,
			secret: config.sessionSecret,
			cookie: {httpOnly: true, secure: true}
		}));
	}

	app.use(bodyParser.urlencoded({
		extended: true
	}));

	app.use(bodyParser.json());
	app.use(methodOverride());
	
	
	//Define where are the views of the application 
	//and what will be the engine that will parse them
	app.set('views', './app/views');
	app.set('view engine', 'ejs');

	app.use(flash());
	app.use(passport.initialize());
	app.use(passport.session());

	//Application's routes
	require('../app/routes/assignedRequests.server.routes.js') (app);
	require('../app/routes/dayRequests.server.routes.js') (app);
	require('../app/routes/index.server.routes.js') (app);
	require('../app/routes/schools.server.routes.js') (app);
	require('../app/routes/students.server.routes.js') (app);
	require('../app/routes/tutors.server.routes.js') (app);
	require('../app/routes/users.server.routes.js') (app);
	require('../app/routes/registration_form.server.routes.js') (app);
	require('../app/routes/helper.server.routes.js') (app);
	require('../app/routes/student_registration_form.server.routes.js') (app);
	require('../app/routes/scheduling.server.routes.js') (app);
	
	//It is important this call to be below the require()
	//define the path of static pages
	app.use(express.static('./public'));

	return app;
};