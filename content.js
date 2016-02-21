function log(message) {
	chrome.extension.sendMessage(message);
}