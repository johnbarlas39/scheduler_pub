
// Require
var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;


// This is the schema for the 'dayRequest' collection
// What is meant by dayRequest is the request that a student makes to get tutored on
// a subject for a specific day
// The student states the subject he wishes to be tutored on, as well as the
// number of hours of tutoring he requests and his availability for that day
// If the schedule cannot for some reason accomodate the request, backup days are provided
// If the student wants more than one subject for a day, he makes two requests

var DayRequestSchema = new Schema ({

	// Which student makes the request
	student : {
		type : Schema.ObjectId,
		ref : 'Student',
		required : 'Request must have a student'
	},

	// 	The subject the student will be taught on
	subject : {
		type : String,
		required : 'Request must have a subject'
	},

	// How many hours of tutoring are requested for this subject for this day
	hoursRequested : {
		type : Number,
		required : 'Specify how many hours of tutoring the student requests'
	},

	// When the student is available in that day
	// This is done by specifying two date objects, one for the start time and one for the 
	// end time, effectively creating a time slot
	// Multiple time slots can be provided for the day
	availability :
		[{
			startTime : {
				type : Date,
				required : 'Provide a start time'
			},

			endTime : {
				type : Date,
				required : 'Provide an end time'
			}
		}],

	// Indicates whether this day is a student's preferred day or backup day
	backup : {
		type : String,
		enum: ['Yes', 'No']
	},

	session: {
		type: String,
		enum: ['Session 1 only', 'Session 2 only', 'Either', 'Not applicable']
	}

});

// Virtual attribute specifying the day of the request
// Specified for searching requests by day
DayRequestSchema.virtual('day').get(function() {
	return this.availability[0].startTime.getDate();
});

// Ensures that when called, a json object will be returned
DayRequestSchema.set('toJSON', { getters: true , virtuals: true });

// Create a model with name dayRequest and the aforementioned schema
mongoose.model('DayRequest', DayRequestSchema);