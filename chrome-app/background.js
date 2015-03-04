

chrome.app.runtime.onLaunched.addListener(
	function () {
	  chrome.app.window.create("window.html",
		{
		"id" : "mainWindow",
		"bounds" : {
			"width" : 1000,
			"height" : 975 }
		},function(win) {});
    });
