
// Require
var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

// This is the schema for the "assignedRequest" collection.
// An assigned request is a request for tutoring by the student that has actually been scheduled by the office staff.
// In other words, it is a scheduled session.
// The scheduled session has a student, tutor, subject, start time and end time

var AssignedRequestSchema = new Schema ({

	// The student that will be going to this class
	student : {
		type : Schema.ObjectId,
		ref : 'Student',
		required : 'Assign a student'
	},

	// The tutor that will be teaching this class
	tutor : {
		type : Schema.ObjectId,
		ref : 'Tutor',
		required : 'Assign to a tutor'
	},

	// 	The subject that will be taught
	subject : {
		type : String,
		required : 'Request must have a subject'
	},

	// The time the class starts
	startTime : {
		type : Date,
		required : 'Lesson must have a starting time'
	},

	// The time the class ends
	endTime : {
		type : Date,
		required : 'Lesson must have an ending time'
	}

});


// Ensures that when called, a json object will be returned
AssignedRequestSchema.set('toJSON');

// Create a model with name dayRequest and the aforementioned schema
mongoose.model('AssignedRequest', AssignedRequestSchema);