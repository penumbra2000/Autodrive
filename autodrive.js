var http = require('http');
var https = require('https');
var url = require('url');
var fs = require('fs');

var port = 4569;
var sslport = port+1;
var basedir = process.cwd();

var server = http.createServer(handleRequest);
var sslserver = https.createServer(handleRequest);

server.listen(port, null, listening);
sslserver.listen(sslport, null, ssllistening);

function listening() {
  console.log('Listening on port %d', port);
  _listening();
}

function ssllistening() {
  console.log('SSL listening on port %d', sslport);
  _listening();
}

function _listening() {
  console.log('* CWD: %s', basedir);
}

function handleRequest(request, response) {
  eval("handle"+request.method+"(request, response)");
}

function handleGET(request, response) {
  var parsed = url.parse(request.url);
  var fname = basedir + parsed.pathname;

  fs.stat(fname, function(err, stat) {
		if (err) return httpError(request, response, 404, err.message);
		if (!canRead(stat)) return httpError(request, response, 403);

		var infile = fs.createReadStream(basedir + parsed.pathname);

		response.writeHead(200, {'Content-Type': 'text/plain'});
		infile.pipe(response);
  });
}

function httpError(request, response, code, message) {
  if (code==undefined) code=404;
  response.writeHead(code, {'Content-Type': 'text/plain'});

  if (message==undefined) response.end();
  else response.end(message);
}

function canRead(stat) {
	return (((stat.mode & 1<<8) && process.getuid() == stat.uid)
	     || ((stat.mode & 1<<5) && process.getgid() == stat.gid)
			 ||  (stat.mode & 1<<2));
}

function canWrite(stat) {
	return (((stat.mode & 1<<7) && process.getuid() == stat.uid)
	     || ((stat.mode & 1<<4) && process.getgid() == stat.gid)
			 ||  (stat.mode & 1<<1));
}
