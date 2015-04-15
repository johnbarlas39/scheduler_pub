'use strict';

exports.render = function(req, res) {

	if (req.session.lastVisit) {
		console.log(req.session.lastVisit);
	}

	req.session.lastVisit = new Date();

	res.render('index', {
		//Data passed dynamically to the ejs view template
		title: 'Scheduler',
		greetings: 'Welcome to Scheduler',
		user: req.user
	});
};