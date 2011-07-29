// vim:set ts=2 sw=2 nowrap:
var watch = require('watch');

watch.createMonitor('data', {ignoreDotFiles:true}, function(monitor) {
	monitor.on("created", function(f, stat) {
		console.log("file " + f + " created");
	});

	monitor.on("changed", function(f, newstat, oldstat) {
		console.log("file " + f + " changed");
	});

	monitor.on("removed", function(f, stat) {
	  console.log("file " + f + " removed");
	});

	console.log("watching data");
});
