function sendMessage(message) {
	chrome.extension.sendMessage(message);
}

function logMessage(message) {
	console.log(message);
}

var locators;