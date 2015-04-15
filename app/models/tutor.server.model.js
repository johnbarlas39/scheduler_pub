
// Require
var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

// Schema for tutors that teach at the center
// Note that this is different from teachers, as they teach at the school
// Tutors have first name, last name and email
// They can also have entries for availability (for a day, from this start time to this end time)
// They specialize at certain subjects (meaning a certain subject as it is taught at a specific school by a specific teacher)

var TutorSchema = new Schema ({

	// Tutor's first name
	firstName : {
		type : String,
		required : 'Tutor must have a first name'
	},

	// Tutor's last name
	lastName : {
		type : String,
		// , required : 'Tutor must have a last name'
	},

	// Tutor's email
	email : {
		type: String,
		index: true,
		match: [/.+\@.+\..+/, "Please fill a valid e-mail address"]
		// , required : 'Please provide an email'
	},

	// The hours that the tutor will be available for teaching
	// For each day, a start time and end time are given (eg. 12.00 - 17.00)
	// Multiple entries might exist for the same day (eg. a tutor is available on 20/1, 10.00-13.00 and 15.00 - 21.00)
	// The array of time slots will be read in order to create a schedule

	availability :
		[{
			startTime : {
				type : Date,
				required : 'Provide a starting time'
			},

			endTime : {
				type : Date,
				required : 'Provide an ending time'
			}
		}],

	// A tutor teaches certain subjects
	// This is represented by this array

	subjects :
		[{

			// The name of the subject
			name : {
				type : String,
				required : 'Subject must have a name'
			},

			// The school this subject is being taught at
			school : {
				type : Schema.ObjectId,
				ref : 'School'
			},

			// The teacher of the subject (at this school)
			teacher : {
				type : String,
			}
		}]
});


// This function makes a virtual property of 'full name',
// derived from the properties first name and last name
TutorSchema.virtual('fullName')
	.get(function() {
		return this.firstName + ' ' + this.lastName;
	})
	.set(function(fullName) {
		var splitName  = fullName.split(' ');
		this.firstName = splitName[0] || '';
		this.lastName  = splitName[1] || '';
	});

// Ensures that when called, a json object will be returned
TutorSchema.set('toJSON', { virtuals : true });

// Create a model with name Tutor and the aforementioned schema
mongoose.model('Tutor', TutorSchema);