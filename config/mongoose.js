var config = require('./config'),
mongoose   = require('mongoose');

//Returns an instance of our database
module.exports = function() {
	
	var db = mongoose.connect(config.db);

	require('../app/models/assignedRequest.server.model');
	require('../app/models/dayRequest.server.model');
	require('../app/models/school.server.model');
	require('../app/models/student.server.model');
	require('../app/models/tutor.server.model');
	require('../app/models/user.server.model');
	
	
	return db;
};