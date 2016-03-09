chrome.browserAction.onClicked.addListener(function(tab) {
	chrome.tabs.executeScript(tab.id, {
		code: 'processLocators(locators);'
	});
});

chrome.runtime.onConnect.addListener(function (port) {
	chrome.runtime.onMessage.addListener(function (message) {
		//send got message to port (to allow extension panel handle it)
		port.postMessage(message);
	});
});

