	//Definition of User's schema
var mongoose = require('mongoose'),
crypto       = require('crypto'),
Schema       = mongoose.Schema;

//This Schema represents the structure of the User model
//The website property contains a get attribute in order
//to create a sort of validation on url level (add the http://)
//provider, providerId and providerData will be used when a user want to use
//Google, facebook, etc credentials as authentication (OAuth)
var UserSchema = new Schema({
	firstName: {
		type: String,
		required: 'First Name is required'
	},
	lastName: {
		type: String,
		required: 'Last Name is required'
	},
	email: {
		type: String,
		index: true,
		match: [/.+\@.+\..+/, "Please fill a valid e-mail address"]
	},
	username: {
		type: String,
		trim: true,
		unique: true,
		required: 'Username is required'
	},
	password: {
		type: String,
		validate: [
			function(password) {
				return password.length >= 8;
			}, 'Password should be longer'
		]
	},
	salt: {
		type: String
	},
	provider: {
		type: String,
		required: 'Provider is required'
	},	
	providerId: {
		type: String
	},
	providerData: {},
	website: {
		type: String,
		get: function(url) {
			if (!url) {
				return url;
			} else {
				if (url.indexOf('http://') !== 0 && url.indexOf('https://') !== 0) {
					url = 'http://' + url;
				}
				return url;
			}
		}
	},
	role: {
		type: String,
		enum: ['Admin', 'Owner', 'User']
	},
	timezone: {
		type: String
	},
	created: {
		type: Date,
		default: Date.now
	}
});
	
	//Provide 'virtual' attributes to the schema
	//This modifier will be trigger on on representation level when we call res.json()
	UserSchema.virtual('fullName').get(function() {
		return this.firstName + ' ' + this.lastName;
	}).set(function(fullName) {
		var splitName  = fullName.split(' ');
		this.firstName = splitName[0] || '';
		this.lastName  = splitName[1] || '';
	});
	
	//pre-save condition middleware will encrypt user's password before saving it to the database
	UserSchema.pre('save', function(next) {
		if (this.password) {
			this.salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
			this.password = this.hashPassword(this.password);
		}
		next();
	});
	
	//will convert string passwords to their hash equivalent
	UserSchema.methods.hashPassword = function(password) {
		return crypto.pbkdf2Sync(password, this.salt, 10000, 64).toString('base64');
	};
	
	//Because passwords are stored in an encrypted form this instance method will validate the password
	UserSchema.methods.authenticate = function(password) {
		return this.password === this.hashPassword(password);
	};
	
	//Guaranty of username uniqueness or provide a suggestion 
	UserSchema.statics.findUniqueUsername = function(username, suffix, callback) {
		//for recursion
		var _this = this;
		
		var possibleUsername = username + (suffix || '');

		_this.findOne({
			username: possibleUsername
		}, function(err, user) {
			if (!err) {
				if (!user) {
					callback(possibleUsername);
				} else {
					//username alredy exists - > recursion
					return _this.findUniqueUsername(username, (suffix || 0) +1, callback);
				}
			} else {
				callback(null);
			}
		});

	};

	//Sets a custom getter modifier to the Schema
	//This modifier will be trigger on on representation level when we call res.json()
	UserSchema.set('toJSON', { getters: true, virtuals: true });
	
	//Create a model with name User and the afforementioned schema
	mongoose.model('User', UserSchema);
