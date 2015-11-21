var child_process = require('child_process'),
	dialog = require('dialog');

exports.generateZip = function (setName) {
	var home = process.env.HOME,
		cmd = 'zip',
		params = [
			'-r',
			setName + '-flatified',
			'flatified'
		],
		opts = {
			cwd: home + '/Desktop'
		},
		zipProcess = child_process.spawn(cmd, params, opts);

	zipProcess.stderr.on('data', function (data) {
		console.log('stderr: ' + data);
		dialog.showErrorBox('Error Creating Zip', data);
	});

	zipProcess.on('exit', function(exitCode) {
		dialog.showMessageBox({message: 'Flatification Complete! Your new set zip file should be on your desktop.', buttons: ['OK']});
	});
};
