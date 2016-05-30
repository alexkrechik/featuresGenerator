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

var locators = {};

var steps = [
	'Then "page"."locator" should be present',
	'When I click "page"."locator"',
	'When I clear "page"."locator"',
	'When I write "" to "page"."locator"',
	'When I wait and click "page"."locator"',
	'Then "page"."locator" CSS "" should contain ""',
	'Then "page"."locator" has text ""',
	'Then "page"."locator" has value ""',
	'Then "page"."locator" should not be present',
	'Then "page"."locator"',
	{'Element attributes' : [
		'Then "page"."locator" CSS "" should be nearly ""',
		'Then "page"."locator" CSS "" should contain ""',
		'Then "page"."locator" CSS "" should contain "".""',
		'Then "page"."locator" attribute "" should contain ""',
		'Then "page"."locator" attribute "" should not contain ""',
		'Then "page"."locator" has text ""',
		'Then "page"."locator" has text "".""',
		'Then "page"."locator" has value ""',
		'Then "page"."locator" has value "".""',
		'Then "page"."locator" value equals ""',
		'When I wait for "page"."locator" to match ""',
		'When I wait for "page"."locator" to match "".""'
	]},
	{'Element state' : [
		'Then "page"."locator" should be disabled',
		'Then "page"."locator" should be enabled',
		'Then "page"."locator" should be present',
		'Then "page"."locator" should be selected',
		'Then "page"."locator" should not be present',
		'Then "page"."locator" should not be selected',
		'Then "page"."locator" value should be present in ""."" dd'
	]},
	{'Actions' : [
		'When I clear "page"."locator"',
		'When I click "page"."locator" at dropdown button',
		'When I click "page"."locator" if present',
		'When I doubleclick "page"."locator"',
		'When I focus "page"."locator"',
		'When I moveTo "page"."locator"',
		'When I scroll "page"."locator" element into view',
		'When I set inner HTML value "" to "page"."locator"',
		'When I switch to "page"."locator" frame',
		'When I upload "" to "page"."locator"',
		'When I wait and click "page"."locator"',
		'When I write "" to "page"."locator"',
		'When I write ""."" to "page"."locator"'
	]}
];

