var pdf = require('phantom-html2pdf');

exports.makePdf = function (req, res, next) {

	console.log("pdf function");

	console.log(req.body);
	
	var html = req.body.html,
		css = req.body.css,
		js = req.body.js,
		fullName = req.body.fullName,
		programURL;
	
	if (req.body.scheduleDate === undefined) {
		var fileName = fullName + "_shcedule.pdf";
	} else {
		var fileName = fullName +"_" + req.body.scheduleDate.replace(/ +/g, "") + "_shcedule.pdf"
	}	
	
	if(req.body.type === "student") {
		programURL = "schedules/students/" + fileName;
	} else {
		programURL = "schedules/tutors/" + fileName;
	}

	var options = {
		"html" : html,
	    "css" : css,
	    "js" : js,
	    // "runnings" : "Path to runnings file. Check further below for explanation.",
	    "deleteOnAction" : true
	};

	pdf.convert(options, function(result) {

	    /* Using a buffer and callback */
	    result.toBuffer(function(returnedBuffer) {});

	    /* Using a readable stream */
	    var stream = result.toStream();

	    /* Using the temp file path */
	    var tmpPath = result.getTmpPath();

	    /* Using the file writer and callback */
	    if(req.body.type === "student") {
		    result.toFile("schedules/students/" + fileName, function() {
				res.json(programURL);	    	
		    });
		} else {
			result.toFile("schedules/tutors/" + fileName, function() {
				res.json(programURL);	    	
		    });
		}
	});

};

