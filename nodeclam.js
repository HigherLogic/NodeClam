var	http = require('http'),
	Busboy = require('busboy'),
	crypto = require('crypto'),
	spawn = require('child_process').spawn;

var server = http.createServer(function(request, response) {
	if (request.url === '/elbcheck.html' && request.method ==='GET') {
		//AWS ELB pings this URL to make sure the instance is running
		//smoothly
		response.writeHead(200, {
			'Content-Type': 'text/plain',
			'Content-Length': 2
		});
		response.write('OK');
		response.end();
	}
	else if (request.url === '/favicon.ico') {
		//Return a 204 for favicons so we don't log the request
		//from browsers.
		response.writeHead(204);
		response.end();
	}
	else if (request.url === '/scan' && request.method === 'POST') {
		//Don't scan more than one posted file.
		var busboy = new Busboy({ 'headers': request.headers, 'limits': {'files': 1} });
		var clamav = spawn('clamscan', ['--no-summary', '-']);
		var sha256 = crypto.createHash('sha256');
		var gotfile = false;
		var responseBody = {};
		request.on('close', function() {
			//The upload was interrupted. Kill the clamav instance so
			//it doesn't keep waiting for more data on stdin.
			console.log('Incomplete file upload. Aborting clamAV.');
			clamav.kill('SIGTERM');
		});
		busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
			console.log('Receiving file ' + filename);
			file.on('data', function(data) {
				clamav.stdin.write(data);
				sha256.update(data);
			});
			file.on('end', function() {
				gotfile = true;
				console.log('Received file ' + filename);
				clamav.stdin.end();
				responseBody['sha256'] = sha256.digest('hex');
			});
		});
		request.pipe(busboy);
		clamav.stdout.on('data', function(data) {
			console.log('Output: ' + data);
		});
		clamav.on('close', function(exitCode) {
			console.log('ClamAV exiting.');
			if (!gotfile) {
				console.log('No file was sent to the server.');
				response.writeHead(400);
			}
			else {
				var responseCode = exitCode === 0 ? 200 : 403;
				var responseText = JSON.stringify(responseBody);
				response.writeHead(responseCode, {
					'Content-Type': 'application/json',
					'Content-Length': responseText.length
				});
				response.write(responseText);
			}
			response.end();
		});
	} else {
		response.writeHead(400);
		response.end();
		console.log('Invalid action: ' + request.url);
	}
});

server.listen(8080);
