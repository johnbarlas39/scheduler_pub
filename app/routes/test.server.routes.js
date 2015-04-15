
var form = require('../../app/controllers/helper.server.controller');

module.exports = function(app) {

	app.route('/test').get(form.phoneTypesParent);

};