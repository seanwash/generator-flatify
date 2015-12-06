(function () {

	var fs = require('fs'),
		Q = require('q'),
		rimraf = require('rimraf'),
		mkdirp = require('mkdirp'),
		parameterize = require('parameterize'),
		limit = require('simple-rate-limiter'),
		SVGO = require('svgo'),
		moment = require('moment'),
		jsonGenerator = require('./libs/json-generator'),
		gulp = require('gulp'),
		iconfont = require('gulp-iconfont');

	var _generator,
		documentId = null,
		documentName = null;

	var MENU_ID = "flatify",
		MENU_LABEL = "Flatify";

	var startTime = null,
		endTime = null;

	function init(generator) {
		_generator = generator;

		_generator.addMenuItem(MENU_ID, MENU_LABEL, true, false).then(
			function() {
				console.log("Menu created");
			},
			function() {
				console.log("Menu creation failed");
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

			path = res.file.split('/');
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
				tasks = [];

				document.layers.forEach(function(layer) {
					layer.layers.forEach(function(shapeLayer) {
						var deferred = Q.defer();
						saveSvg(document.id, shapeLayer, deferred);
						tasks.push(deferred.promise);
					});
				});

				Q.allSettled(tasks).then(function(results) {
					console.log('export icons task all settled');

					jsonGenerator.exportJson(documentName);

					endTime = new Date();

					var ms = endTime - startTime,
						iconCount = tasks.length;
						duration = moment.duration(ms).humanize();

					_generator.alert('Flatified ' + iconCount + ' icons in ' + duration + '!');
					generateFont();
				});
			}
		);
	}

	function generateFont() {
		console.log('Generating Font');
		var homeDir = process.env.HOME;

		gulp.task('default', function() {
			return gulp.src([homeDir + '/Desktop/flatified/svg/*.svg'])
				.pipe(iconfont({
					fontName: documentName,
					formats: ['ttf', 'eot', 'woff', 'svg'],
					fixedWidth: true,
					normalize: true
				}))
				.pipe(gulp.dest(homeDir + '/Desktop/flatified/font/'));
		});

		gulp.run();
	}

	function runPhotoshopJsx() {
		return _generator.evaluateJSXFile(__dirname + '/libs/ps.jsx');
	}

	var saveSvg = limit(function(documentId, layer, deferred) {
		console.log("Saving svg:", layer.name);

		_generator.getSVG(documentId, layer.id).then(function(svg) {
				// {
				//     // optimized SVG data string
				//     data: '<svg width="10" height="20">test</svg>'
				//     // additional info such as width/height
				//     info: {
				//         width: '10',
				//         height: '20'
				//     }
				// }
				svgo = new SVGO();
				svgo.optimize(svg, function(result) {
					fs.writeFile(process.env.HOME + '/Desktop/flatified/svg/' + layer.name + '.svg', result.data);
					deferred.resolve('saved ' + layer.name);
				});
			}
		);
	}).to(2).per(1000);

	exports.init = init;
}());
