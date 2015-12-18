(function () {
	var fs = require('fs'),
		Q = require('q'),
		rimraf = require('rimraf'),
		mkdirp = require('mkdirp'),
		limit = require('simple-rate-limiter'),
		moment = require('moment'),
		jsonGenerator = require('./libs/json-generator'),
		webfontsGenerator = require('./libs/webfont-generator');

	var _generator,
		documentId = null,
		documentName = null;

	var MENU_ID = "flatify",
		MENU_LABEL = "Flatify 0.7";

	var startTime = null,
		endTime = null;

	function init(generator) {
		_generator = generator;

		_generator.addMenuItem(MENU_ID, MENU_LABEL, true, false).then(
			function() {
				console.log("Flatifier / Menu created");
			},
			function() {
				console.log("Flatifier / Menu creation failed");
			}
		);

		_generator.onPhotoshopEvent("generatorMenuChanged", handleGeneratorMenuClicked);
		_generator.onPhotoshopEvent("currentDocumentChanged", handleCurrentDocumentChanged);
		_generator.onPhotoshopEvent("imageChanged", handleImageChanged);
	}

	function handleImageChanged(document) {
		documentId = document.id;
	}

	function handleCurrentDocumentChanged(document) {
		documentId = document.id;
	}

	function getDocumentName() {
		_generator.getDocumentInfo().then(function(res) {
			documentId = res.id;

			var path = res.file.split('/'),
				name = path[path.length - 1];

			name = name.substr(0, name.lastIndexOf('.')) || name;
			console.log('Document Name', name);

			documentName = name;
		});
	}

	function handleGeneratorMenuClicked(event) {
		getDocumentName();
		setupFlatifiedDirs();

		runPhotoshopJsx().then(function() {
			_generator.alert("Starting phase 2. This  all happens behind the scenes, but I'll tell you when it's done!");
			exportIconsFromDoc();
		});
	}

	function setupFlatifiedDirs() {
		console.log('Creating Dirs');
		var homeDir = process.env.HOME;

		startTime = new Date();

		rimraf(homeDir + '/Desktop/flatified', function() {
			mkdirp(homeDir + '/Desktop/flatified');
			mkdirp(homeDir + '/Desktop/flatified/psd');
			mkdirp(homeDir + '/Desktop/flatified/pdf');
			mkdirp(homeDir + '/Desktop/flatified/svg');
			mkdirp(homeDir + '/Desktop/flatified/png');
			mkdirp(homeDir + '/Desktop/flatified/png/1x');
			mkdirp(homeDir + '/Desktop/flatified/png/2x');
			mkdirp(homeDir + '/Desktop/flatified/png/3x');
			mkdirp(homeDir + '/Desktop/flatified/png/4x');
			mkdirp(homeDir + '/Desktop/flatified/font');
		});
	}

	function exportIconsFromDoc() {
		return _generator.getDocumentInfo(documentId).then(
			function(document) {
				var tasks = [];

				document.layers.forEach(function(layer) {
					layer.layers.forEach(function(shapeLayer) {
						var deferred = Q.defer();
						saveSvg(document.id, shapeLayer, deferred);
						tasks.push(deferred.promise);
					});
				});

				Q.allSettled(tasks).then(function(results) {
					console.log('export icons task all settled');

					webfontsGenerator.generateFont(documentName);
					jsonGenerator.exportJson(documentName);

					endTime = new Date();

					var ms = endTime - startTime,
						iconCount = tasks.length,
						duration = moment.duration(ms).humanize();

					_generator.alert('Flatified ' + iconCount + ' icons in ' + duration + '!');
				});
			}
		);
	}

	function runPhotoshopJsx() {
		return _generator.evaluateJSXFile(__dirname + '/libs/ps.jsx');
	}

	var saveSvg = limit(function(documentId, layer, deferred) {
		_generator.getSVG(documentId, layer.id).then(function(svg) {
			fs.writeFile(process.env.HOME + '/Desktop/flatified/svg/' + layer.name + '.svg', svg);
			deferred.resolve('saved ' + layer.name);
		});
	}).to(2).per(1000);

	exports.init = init;
}());
