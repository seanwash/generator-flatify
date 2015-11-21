var child_process = require('child_process'),
	fs = require('fs'),
	zipGenerator = require('./zip-generator.js'),
	path = require('path'),
	parameterize = require('parameterize'),
	webfontsGenerator = require('webfonts-generator');

exports.generateFont = function(setName) {

	var homeDir = process.env.HOME,
		iconsPath = homeDir + '/Desktop/flatified/svg',
		icons = [];

	files = fs.readdirSync(iconsPath).map(function(file) {
		return path.join(iconsPath, file);
	});

	webfontsGenerator({
		fontName: setName,
		files: files,
		dest: homeDir + '/Desktop/flatified/font',
		types: ['svg', 'ttf', 'woff', 'eot'],
		startCodePoint:  '0xF100',
		rename: function(iconPath) {
			return parameterize(path.basename(iconPath, 'svg'));
		}

	}, function(error) {
		if (error) {
			console.log('Fail!', error);
		} else {
			zipGenerator.generateZip(setName);
		}
	});
};
