var nodemailer = require('nodemailer');

// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'example@gmail.com',
        pass: 'secrete'
    }
});

// NB! No need to recreate the transporter object. You can use
// the same transporter object for all e-mails

// setup e-mail data with unicode symbols
var mailOptions = {
    from: 'Scheduler', // sender address
    to: 'example@gmail.com',
    subject: 'Hello', // Subject line
    text: ' attachment...', // plaintext body
    // html: '<b>Hello world</b>' // html body
    attachments: [{path: './app/controllers/test.txt'}]
};



exports.sendMail = function (req,res,next) {
	console.log('send mail function');
	transporter.sendMail(mailOptions, function(error, info){
		if(error){ console.log(error); }
		else {
			console.log('Message sent: ' + info.response);
		}
	});
};
