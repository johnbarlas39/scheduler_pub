
// Require
var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

// Schema for the collection "School"
// This represents the actual high schools that the students are attending
// Besides a name, schools also contain the information of which subjects are taught and the teachers that teach those subjects
// Teachers also have an attribute 'group'. This should be 0 or empty by default.
// If two teachers that teach the same subject at the same school are at the same point in the material,
// then these two teachers can be grouped together. (by having the same number in the 'group' attribute)

var SchoolSchema = new Schema({
	
	// School's name (eg. Montevista High)
	name : {
		type : String,
		required : 'School must have a name'
	},

	// A list of subjects being taught at the school
	subjects :
		[{
			// Subject name (eg. Algebra 2)
			name : {
				type : String,
				required : 'Subject must have a name'
			},

			// A list of teachers that teach this subject
			teacher :
				[{
					// Teacher's name (eg. George Alexander)
					name : {
						type : String,
						required : 'Teacher must have a name'
					},

					// Teacher can belong in a group (everyone in the group is at the same point in the material)
					group : {
						type : Number
					}
				}]
		}]
});

// Ensures that when called, a json object will be returned
SchoolSchema.set('toJSON', {});

// Create a model with name School and the aforementioned schema
mongoose.model('School', SchoolSchema);
