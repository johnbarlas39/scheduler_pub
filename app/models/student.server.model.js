
// Require
var mongoose = require('mongoose'),
	Schema   = mongoose.Schema;

// Schema for the Student collection
// Students have a first name, last name, can have multiple phone numbers and one email
// Nested within the student schema is the student's parents' information
// A student can have multiple parents (normally just one or two)
// Each parent has a first name, last name, an email and can also have multiple phone numbers

var StudentSchema = new Schema({

	// Student's first name
	firstName : {
		type : String,
		required : 'Student must have a first name'
	},

	// Student's last name
	lastName : {
		type : String,
		required : 'Student must have a last name'
	},

	// A student can provide more than one phone number
	// Each phone number also has a type (cell or home)
	phone: 
		[{
			// The phone number (as a string to facilitate special characters, eg. +, - etc.)
			number: {
				type : String,
				required : 'Please give a phone number'
			},

			// The type of number (eg. home, cellphone)
			phoneType: {
				type : String,
				enum : ['home', 'cell'],
				required : 'Please provide a phone number type'
			}	
		}],

	// The student's email
	// Match makes sure there is an '@.' in the given string
	email: {
		type: String,
		index: true,
		match: [/.+\@.+\..+/, "Please fill a valid e-mail address"]
	},

	// A student can have more than one parent, so an array of parents is needed
	parent: [{
				// Parent's first name
				firstName: {
					type : String
				},

				// Parent's last name
				lastName: {
					type : String
				},

				// Parents can also have more than one phone number
				phone: 
					[{
						// The phone number (as a string)
						number: {
							type : String,
							required : 'Please give a phone number'
						},

						// The type of number it is (home, work or cell)
						phoneType: {
							type : String,
							enum : ['home', 'work', 'cell'],
							required : 'Please provide a phone number type'
						}
					}],

				// The parent's email	
				email: {
					type: String,
					index: true,
					match: [/.+\@.+\..+/, "Please fill a valid e-mail address"]
				}
			}],

	// The school the student is attending
	// We get this through the separate school collection
	school : {
		type : Schema.ObjectId,
		ref : 'School',
		required : 'Student must have a school'
	},

	// The student makes requests for tutoring on a number of subjects
	// Each of these requests states the teacher of the subject at school,
	// when the exam date is and the number of tutoring hours that are requested.
	// An optional 'comments' text box will be provided for extra details that the form has not predicted.
	// A student can request tutoring on one or more subjects.
	// These requests are general requests and NOT requests to be tutored on a specific day.
	// These are handled separately and have their own 'dayRequest' schema
	subjectRequest: 
		[{
			// The attributes underneath are not taken as references to other collections, but as simple strings
			// This is because they will be chosen from dropdown menus and any limation on their value
			// will be done through those menus.
			
			// The subject requested			
			subject: {
				type : String,
				required : 'Request must have a subject'
			},

			// The teacher that teaches that subject *in school*
			teacher: {
				type : String,
				required : 'Subject must have a teacher'
			},

			// The date of the final exam for this subject
			examDate: {
				type : Date,
				required : 'Give a date for the final exam'
			},

			// How many hours of tutoring does the student request
			hoursRequested: {
				type: Number,
				required : 'Specify how many hours are requested for this subject'
			},

			// A student possibly has a regular tutor 
			// If that is the case, they can actually request to work with that tutor
			// A new student can also request a specific tutor
			requestedTutor: {
				type : String,
				enum : ["I prefer my regular tutor", "I prefer another tutor", "I don't have a regular tutor" ]
			}

		}],

	// Optional comments section for the request
	comments: {
		type : String
	},
	
});


// Derive student's full name
StudentSchema.virtual('fullName')
	.get(function() {
		return this.firstName + ' ' + this.lastName;
	})
	// DO WE NEED A SETTER? IS THERE A SCENARIO WHERE A FUNCTION WOULD CHANGE THE STUDENT NAME?
	.set(function(fullName) {
		var splitName  = fullName.split(' ');
		this.firstName = splitName[0] || '';
		this.lastName  = splitName[1] || '';
	});

// Ensures that when called, a json object will be returned
StudentSchema.set('toJSON', { virtuals: true });

// Create a model with name Student and the aforementioned schema
mongoose.model('Student', StudentSchema);