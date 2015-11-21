(function () {

	var fs = require("fs"),
		Q = require("q"),
		rimraf = require("rimraf"),
		mkdirp = require("mkdirp"),
		parameterize = require("parameterize"),
		limit = require("simple-rate-limiter"),
		tmpName = Q.denodeify(require("tmp").tmpName);

	var _generator;
	var documentId = null;

	var MENU_ID = "flatify";
	var MENU_LABEL = "Flatify";

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

	function setupFlatifiedDirs() {
		var homeDir = process.env.HOME;

		rimraf(homeDir + '/Desktop/flatified', function() {
			mkdirp(homeDir + '/Desktop/flatified');
			mkdirp(homeDir + '/Desktop/flatified/psd');
			mkdirp(homeDir + '/Desktop/flatified/ai');
			mkdirp(homeDir + '/Desktop/flatified/svg');
			mkdirp(homeDir + '/Desktop/flatified/png');
			mkdirp(homeDir + '/Desktop/flatified/png/1x');
			mkdirp(homeDir + '/Desktop/flatified/png/2x');
			mkdirp(homeDir + '/Desktop/flatified/png/3x');
			mkdirp(homeDir + '/Desktop/flatified/png/4x');
			mkdirp(homeDir + '/Desktop/flatified/font');
		});
	}

	var saveSvg = limit(function(documentId, layer) {
		console.log("Saving svg:", layer.name);
		_generator.getSVG(documentId, layer.id).then(
			function(svg) {
				fs.writeFile(process.env.HOME + '/Desktop/flatified/svg/' + layer.name + '.svg', svg);
			}
		);
	}).to(5).per(1000);

	var savePng = limit(function(documentId, layer) {
		console.log("Saving png:", layer.name);

		var opts = {forceSmartPSDPixelScaling: true};
		_generator.getPixmap(documentId, layer.id, opts).then(
			function(pixmap) {
				_generator.savePixmap(
					pixmap,
					process.env.HOME + '/Desktop/flatified/png/1x/' + layer.name + '.png',
					{ format: 'png', quality: 24, ppi: 72 }
				);
			}
		);

		var opts = {scaleX: 2, scaleY: 2, forceSmartPSDPixelScaling: true};
		_generator.getPixmap(documentId, layer.id, opts).then(
			function(pixmap) {
				_generator.savePixmap(
					pixmap,
					process.env.HOME + '/Desktop/flatified/png/2x/' + layer.name + '.png',
					{ format:'png', quality: 24, ppi: 72 }
				);
			}
		);

		var opts = {scaleX: 3, scaleY: 3, forceSmartPSDPixelScaling: true};
		_generator.getPixmap(documentId, layer.id, opts).then(
			function(pixmap) {
				_generator.savePixmap(
					pixmap,
					process.env.HOME + '/Desktop/flatified/png/3x/' + layer.name + '.png',
					{format:'png', quality: 24, ppi: 72}
				);
			}
		);

		var opts = {scaleX: 4, scaleY: 4, forceSmartPSDPixelScaling: true};
		_generator.getPixmap(documentId, layer.id, opts).then(
			function(pixmap) {
				_generator.savePixmap(
					pixmap,
					process.env.HOME + '/Desktop/flatified/png/4x/' + layer.name + '.png',
					{format:'png', quality: 24, ppi: 72}
				);
			}
		);
	}).to(2).per(5000);

	function handleGeneratorMenuClicked(event) {

		setupFlatifiedDirs();

		_generator.getDocumentInfo(documentId).then(
			function(document) {
				document.layers.forEach(function(layer) {
					layer.layers.forEach(function(shapeLayer) {
						saveSvg(document.id, shapeLayer);
						savePng(document.id, shapeLayer);
					});
				});

				_generator.evaluateJSXFile(__dirname + '/libs/ps.jsx');
			}
		);
	}

	exports.init = init;

}());
