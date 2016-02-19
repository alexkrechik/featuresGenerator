chrome.runtime.onConnect.addListener(function(port) {
	//port.postMessage("aaaa1");
	chrome.browserAction.onClicked.addListener(function(tab) {
		chrome.tabs.executeScript(tab.id, {
			file: '/locators.js'
		});

		port.postMessage("aaaaaa");

	});
});