var savePng = limit(function(documentId, layer) {
	console.log("Saving png:", layer.name);
	var opts = {};

	opts = {forceSmartPSDPixelScaling: true};
	_generator.getPixmap(documentId, layer.id, opts).then(
		function(pixmap) {
			_generator.savePixmap(
				pixmap,
				process.env.HOME + '/Desktop/flatified/png/1x/' + layer.name + '.png',
				{ format: 'png', quality: 24, ppi: 72 }
			);
		}
	);

	opts = {scaleX: 2, scaleY: 2, forceSmartPSDPixelScaling: true};
	_generator.getPixmap(documentId, layer.id, opts).then(
		function(pixmap) {
			_generator.savePixmap(
				pixmap,
				process.env.HOME + '/Desktop/flatified/png/2x/' + layer.name + '.png',
				{ format:'png', quality: 24, ppi: 72 }
			);
		}
	);

	opts = {scaleX: 3, scaleY: 3, forceSmartPSDPixelScaling: true};
	_generator.getPixmap(documentId, layer.id, opts).then(
		function(pixmap) {
			_generator.savePixmap(
				pixmap,
				process.env.HOME + '/Desktop/flatified/png/3x/' + layer.name + '.png',
				{format:'png', quality: 24, ppi: 72}
			);
		}
	);

	opts = {scaleX: 4, scaleY: 4, forceSmartPSDPixelScaling: true};
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
