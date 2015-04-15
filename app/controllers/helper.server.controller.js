
var AssignedRequest = require('mongoose').model('AssignedRequest');
var DayRequest = require('mongoose').model('DayRequest');
var School = require('mongoose').model('School');
var Student = require('mongoose').model('Student');
var Tutor = require('mongoose').model('Tutor');
var path = require('path');
var appDir = path.dirname(require.main.filename);

var asyn = require('async');
var _ = require('underscore');
var pdf = require('pdfcrowd');


// Get list of schools
exports.listSchools = function (req, res, next) {
	School.find( {}, '_id, name', function (err, schools) {
		res.json(schools);
	});
};

exports.allSubjects = function (req,res,next,id) {
	if (id == "0") {
		var array = [];
		School.find(function (err, schools) {
			if (err) { return next(err); }
			else {
				asyn.forEach( schools, function(school, callback) {
					for (var j=0 ; j<school.subjects.length ; j++) {
						if ( ! _.contains(array, school.subjects[j].name) ) {
							array.push(school.subjects[j].name);
						}
					}
					callback();
				}, function(err) {
					if (err) { return next(err) ; }
					else {
						array.sort();
						var output = { "subjects" : array };
						req.school = output;
						next();
					}
				});
			}
		});
	}
};

exports.findSchoolById = function (req, res, next, id) {

	School.findById(id, function(err,school) {
		if (err) { return next(err); }
		else {
			req.school = school;
			next();
		}
	});

};


exports.findTeacherBySubjectName = function(req, res, next, name) {
	// Get the school id we are talking about
	var id = req.school._id;

	School.findById(id, function(err, school) {
		if (err) {return next(err);}
		else{
			// Iterate over subject names and find the selected one ("name" from the parameters)
			var chosenSubject;
			var len = school.subjects.length;
			for (i=0 ; i< len ; i++) {
				if (school.subjects[i].name == name) {
					chosenSubject = school.subjects[i] ;
					break;
				}
			}

			// If a match was found, store it in req
			if (chosenSubject) {
				req.teachers = chosenSubject.teacher ;
				next();
			} else {
				console.log("No subject found with the given name. There is a problem in the database.");
			}
		}
	});
};

exports.findStudentsForScheduling = function(req, res, next, data) {
	var values = data.split('-');
	var date = new Date(values[0]);
	var schoolId = values[1];
	var subject = values[2];
	
	var dayRequestQuery = [];
	var dayRequestList = [];

	function overlap(start1, end1, start2, end2) {
		// Make date objects
		var s1 = new Date (start1),
			e1 = new Date (end1),
			s2 = new Date (start2),
			e2 = new Date (end2);

		// Turn them into ms
		var st1 = s1.getTime(),
			en1 = e1.getTime(),
			st2 = s2.getTime(),
			en2 = e2.getTime();

		// Find if they overlap
		var diff = 0 ;

		if 		(st1>st2 && st1<en2)	{ diff = en2 - st1; }
		else if (st2>st1 && st2<en1)	{ diff = en1 - st2; }
		else if (st1===st2) {
            var e = (en1 < en2 ? en1 : en2);
            diff = e-st1;
        }

		// Do they overlap for at least two hours?
		if (diff>=7200000)	{ return true  ; }
		else 				{ return false ; }
	}

	asyn.series([
		function (callback) {
			// Get all the day requests with the given subject
			DayRequest.find({subject: subject}, function(err, dayRequests) {

				// Remove the ones that have the wrong date
				var i = dayRequests.length;
				while (i--) {
					if (dayRequests[i].day != date.getDate()) {
						dayRequests.splice(i,1);
					}
				}

				if (err) { return next(err) ; }
				else {
					dayRequestQuery = dayRequests ;
					callback();
				}
			});
		},
		function (callback) {
			// For each of the remaining day requests, get the student
			asyn.forEach(dayRequestQuery, function(request, callback) {
				Student.findById(request.student, function(err,student) {

					var subjectRequest, teacher, examDate, tutor;
					// See if the student belongs to the selected school (if one has been selected)
					if (schoolId != "0") {
						if (student.school == schoolId) {

							School.findById(schoolId, function(err,school) {

								subjectRequest = student.subjectRequest.filter(function(sreq) {
									return sreq.subject == subject;
								});
								
								teacher = subjectRequest[0].teacher;
								examDate = subjectRequest[0].examDate;
								tutor = subjectRequest[0].requestedTutor;

								dayRequestList.push([school.name, teacher, request.availability[0].startTime, request.availability[0].endTime, request, student.fullName, examDate, tutor]);
								callback();
							});
						} else {
							callback();
						}
						
					} else {
						School.findById(student.school, function(err,school) {
							
							subjectRequest = student.subjectRequest.filter(function(sreq) {
								return sreq.subject == subject;
							});
							
							teacher = subjectRequest[0].teacher;
							examDate = subjectRequest[0].examDate;
							tutor = subjectRequest[0].requestedTutor;

							dayRequestList.push([school.name, teacher, request.availability[0].startTime, request.availability[0].endTime, request, student.fullName, examDate, tutor]);

							callback();
						});
					}
				});
			}, function(err) {
				if (err) { return next(err) ; }
				else { callback() ; }
			});
		},
		function (callback) {
			dayRequestList.sort();

			// ** ALGORITHM ** //

			// if next.school == this.school && next.teacher == this.teacher
			// 	if next overlaps
			// 		if self has no number
			// 			give self and next a new number
			// 		elif self has numbers already
			// 			for each number
			// 				if next overlaps with all members of that number
			// 					give next that number
			// 			if no matching number is found for next
			// 				give self and next a new number
			
			var indexesHash = {},
				groupsHash = {},
				no = 1,
				numbers = [];

			asyn.forEach(dayRequestList, function(request, callback) {

				var index = dayRequestList.indexOf(request);
				var next = dayRequestList[index+1];

				// Make sure you don't check the last one, as index+1 will throw an error
				if ( index < dayRequestList.length - 1) {

					// Check that this request and the next have the same school and teacher
					if (next[0] === request[0] && next[1] === request[1]) {

						// If they overlap for at least two hours
						if (overlap(request[2], request[3], next[2], next[3])) {

							// The current request belongs to no group
							if (!(index in indexesHash)) {
					
								// Add group to request
								request.push([no]);

								// If the next item has no group, add group to next request
								if (next.length === 8) { next.push([no]); }

								// If the next item already has a group, add group to next request
								else if (next.length === 9) { next[8].push(no); }

								// Update indexesHash, groupsHash and no
								indexesHash[index] = [no];
								if (index+1 in indexesHash) { indexesHash[index+1].push(no) ; }
								else { indexesHash[index+1] = [no] ; }
								groupsHash[no] = [index, index+1];
								no ++ ;

								callback();
							}
						
							// The current request already belongs to a group
							else {

								// Keeps track of whether next can fit in an existing group
								var generalFit = false;
						
								// Get all the groups that it belongs to
								numbers = indexesHash[index];

								// For each of these groups
								asyn.forEach(numbers, function(number, callback) {

									// Get the items that belong to it
									var indexes = groupsHash[number];

									// Check if next overlaps with all of them
									var fit = true;
									var current;

									asyn.forEach(indexes, function(ind,callback) {
										if (ind !== index && ind !== index+1) {
											current = dayRequestList[ind];
											if ( ! ( overlap(next[2], next[3], current[2], current[3]) ) ) {
												fit = false;
											}
										}
										callback();
									}, function(err) {
										if (err) {return next(err);}
										else {
											// If next actually overlaps with all members of an existing group, add next to the group and update hashtables
											if (fit) {
												if 		(next.length === 8) { next.push([number]); }
												else if (next.length === 9) { next[8].push(number); }

												if (index+1 in indexesHash) { indexesHash[index+1].push(number) ; }
												else { indexesHash[index+1] = [number] ; }

												groupsHash[number].push(index+1);

												generalFit = true;

											}
											callback();
										}
									}); // end for each (indexes)

								}, function (err) {
									// If next didn't belong to any of the existing groups, make a new one
									if (! generalFit) {

										request[8].push(no);

										if (next.length === 8) { next.push([no]); }
										else if (next.length === 9) { next[8].push(no); }

										indexesHash[index].push(no);
										if (index+1 in indexesHash) { indexesHash[index+1].push(no) ; }
										else 						{ indexesHash[index+1] = [no] ; }

										groupsHash[no] = [index, index+1];
										no ++ ;

									}
									callback();
								}); // end for each (numbers)
							}
						} else { callback(); }
					} else { callback(); }
				} else { callback(); }

			}, function (err) {
				if (err) {return next(err);}
				else {callback();}
			});
		}
	], function (err) {
		if (err) { return next(err) ; }
		else {
			req.requestList = dayRequestList;
			next();
		}
	});
};

exports.readSchool = function(req, res) {
	res.json(req.school);
};

exports.readTeachers = function(req, res) {
	res.json(req.teachers);
};

exports.readStudentsForScheduling = function(req, res) {
	res.json(req.requestList);
};

// Get list of tutors
exports.listTutors = function (req, res, next) {
	Tutor.find( {}, '_id, firstName', function (err, tutors) {
		res.json(tutors);
	});
};

// Get acceptable phone types for student
exports.phoneTypesStudent = function (req, res, next) {
	var array = Student.schema.path('phone.0.phoneType').enumValues;
	return array;
};

// Get acceptable phone types for parent
exports.phoneTypesParent = function (req,res,next) {
	var array = Student.schema.path('parent.0.phone.0.phoneType').enumValues;
	return array;
};

// Clear date format
exports.clearDate = function(string) {
	var string_array = string.split(",");

	var year = parseInt(string_array[0]);
	var month = parseInt(string_array[1]);
	var day = parseInt(string_array[2]);
	var hours = parseInt(string_array[3]);
	var minutes = parseInt(string_array[4]);

	var date = new Date(year, month, day, hours, minutes);

	return date;
};


// Assign modal on scheduling page
exports.assignClass = function (req,res,next) {

	function clearDate (string) {
		var string_array = string.split(",");

		var year = parseInt(string_array[0]);
		var month = parseInt(string_array[1]);
		var day = parseInt(string_array[2]);
		var hours = parseInt(string_array[3]);
		var minutes = parseInt(string_array[4]);

		var date = new Date(year, month, day, hours, minutes);

		return date;
	}

	var data = req.body;

	var students  = data.students  ;
	var tutor     = data.tutor     ;
	var subject   = data.subject   ;
	var startTime = clearDate(data.startTime) ;
	var endTime   = clearDate(data.endTime)   ;

	var assignment, first, last, id;
	var ids = [];

	function getId (fullName, callback) {

		fullName = fullName.trim();
		first = fullName.split(' ')[0];

		if (fullName.split(' ').length>2) {
			last = '';
			for (var i=1; i<fullName.split(' ').length ; i++) {
				if (i==fullName.split(' ').length-1) {
					last += fullName.split(' ')[i];
				} else {
					last += fullName.split(' ')[i] + " ";
				}
			}
		} else {
			last = fullName.split(' ')[1];
		}
		
		Student.findOne({"firstName": first, "lastName": last}, function(err,stdnt) {
			ids.push(stdnt._id);
			callback();
		});
	}

	function makeAssignment (id, callback) {
		assignment = new AssignedRequest();

		assignment.student 	 = id 	 	 ;
		assignment.tutor 	 = tutor     ;
		assignment.subject 	 = subject   ;
		assignment.startTime = startTime ;
		assignment.endTime 	 = endTime   ;

		assignment.save();

		callback();
	}

	asyn.series([

		function (callback) {
			asyn.forEach (students, function (student, callback)   { getId (student, callback) ; } ,
			function(err)   { if (err) { next(err) ; }   else { callback() ; }  });
		},
		function (callback) {
			asyn.forEach (ids, function (id, callback)   { makeAssignment (id, callback) ; } ,
			function(err)   { if (err) { next(err) ; }   else { callback() ; }  });
		}

	], function (err) {
		if (err) { return next(err) ; }
		else { 
			req.message = "The assignment has completed successfully!";
			res.json(req.message);
		}
	});
};

exports.saveRowEdit = function (req, res, next) {
	console.log("backend");
	console.log(req.body);

	var fullName  = req.body.student,
		firstName = fullName.split(" ")[0],
		subject   = req.body.subject;

	console.log(fullName);
	console.log(fullName.split(" "));
	console.log(fullName.split(" ").length);
	var lastName;
	if (fullName.split(" ").length === 2) {
		lastName = fullName.split(" ")[1];
	} else if (fullName.split(" ").length > 2) {
		console.log('inside');
		lastName = '';
		for (var i=1 ; i<fullName.split(" ").length ; i++) {
			if (i === fullName.split(" ").length -1 ) {
				lastName += fullName.split(" ")[i] ;
			} else {
				lastName += fullName.split(" ")[i] + " ";
			}
		}
	}
	console.log(lastName);

	var teacher   = req.body.teacher,
		tutor     = req.body.tutor,
		session   = req.body.session,
		hours     = req.body.hours,
		startTime = req.body.times[0],
		endTime   = req.body.times[1],
		date      = new Date (req.body.day),
		day       = date.getDate();

	var examDate  = req.body.examDate,
		examMonth = parseInt(examDate.split(" / ")[0])-1,
		examDay   = parseInt(examDate.split(" / ")[1]);

	var studentId;

	function updateTimes(newTime, oldTime) {
		var ampm, hours, minutes;

		ampm = newTime.substring(newTime.length-2);
		if 		(ampm === "am" || newTime.split(":")[0] === 12) { hours = parseInt(newTime.split(":")[0]) ; }
		else if (ampm === "pm" && newTime.split(":")[0] !== 12) { hours = parseInt(newTime.split(":")[0]) + 12  ; }
		console.log(newTime);
		minutes = newTime.split(":")[1].substring(0,2);

		time = new Date (oldTime);
		console.log(time);
		console.log (hours + ":" + minutes);
		time.setHours(hours);
		time.setMinutes(minutes);

		console.log(time);

		return time;
	}

	asyn.series([
		function (callback) {
			Student.findOne({firstName: firstName, lastName: lastName}, function(err, student) {
				studentId = student.id;
				
				var subjectRequest = student.subjectRequest.filter( function(subj) {
					return subj.subject == subject;
				});

				subjectRequest[0].teacher = teacher;       // if teacher not in school-subject-teacher, then add him
				subjectRequest[0].requestedTutor = tutor;
				subjectRequest[0].examDate = new Date(2015,examMonth,examDay); // Make this one better in final version!!!

				student.save();
				callback();
			});
		}
	], function (err) {
		if (err) {return next(err);}
		else {
			// Day request -- Session, Hours Requested, Availability
			DayRequest.find({student: studentId, subject: subject}, function(err, requests) {
				console.log(requests);
				var reqs = requests.filter( function(req) {
					return req.day == day;
				});

				reqs[0].session = session;
				reqs[0].hoursRequested = hours;

				reqs[0].availability[0].startTime = updateTimes(startTime, reqs[0].availability[0].startTime);
				reqs[0].availability[0].endTime = updateTimes(endTime, reqs[0].availability[0].endTime);

				console.log("Yes???");
				console.log(reqs[0]);
				reqs[0].save();
			});
		}
	});
	
};

exports.makePdf = function(req, res) {
	var std_id = req.body.studentId;
	var url = req.body.url;
		
	var client = new pdf.Pdfcrowd("alexgeorg86", "f9ec20514a6340c8e0969dfbf4651e32");
	console.log("Backend triggered");
	client.convertURI(url, pdf.saveToFile("student_" + std_id + "_program.pdf"));
	console.log("API called");
		
	req.message = "The assignment has completed successfully!";
	res.json(req.message);
		
};

exports.downloadScheduleS = function(req, res) {
	var fileURL = appDir +"/schedules/students/" + req.params.file;
	console.log(appDir);
	console.log(fileURL);
	res.download(fileURL);
};

exports.downloadScheduleT = function(req, res) {
	var fileURL = appDir +"/schedules/tutors/" + req.params.file;
	console.log(appDir);
	console.log(fileURL);
	res.download(fileURL);
};
