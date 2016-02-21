chrome.browserAction.onClicked.addListener(function(tab) {
	chrome.tabs.executeScript(tab.id, {
		file: '/locators.js'
	});
});

chrome.runtime.onConnect.addListener(function (port) {
	chrome.runtime.onMessage.addListener(function (message) {
		port.postMessage(message);
	});
});