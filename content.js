var locators = {};


function sendMessage(message) {
	chrome.extension.sendMessage(message);
}

function logMessage(message) {
	console.log(message);
}

var markFoundElement = function (element) {
	element.style.setProperty('border','thin solid #0000FF','important');
	element.classList.add('fg-found-locator');
};

var addElementTitle = function (element, page, locator) {
	element.title = '"' + page + '"."' + locator + '"';
};

var attOnClickListener = function (element, page, locator) {
	element.addEventListener('click', function (event) {
		if (event.altKey) {
			sendMessage({step: 'When I click "' + page + '"."' + locator + '"'});
			event.stopPropagation();
		}
		if (event.shiftKey) {
			sendMessage({step: 'Then "' + page + '"."' + locator + '" should be present'});
			event.stopPropagation();
		}
		processLocators();
	})
};

var attOnRightClickListener = function (element, page, locator) {
	element.addEventListener('contextmenu', function (event) {
		event.stopPropagation();
		event.preventDefault();
		showMenu(event, page, locator);
	}, false)
};

var getElement = function(locator) {
	var element;
	try {
		element = document.evaluate(locator, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
	} catch(err) {
		return null;
	}
	return element;
};

var injectInvisibleValues = function(locator) {
	var injection = 'not(ancestor-or-self::*[contains(@style,"visibility: hidden;") or ' +
		'contains(@style,"display: none;") or contains(@class,"x-hide-offsets")])]';
	if (locator[locator.length - 1] === ']') {
		locator = locator.substring(0, locator.length - 1) + ' and ' + injection;
	} else {
		locator = locator + '[' + injection;
	}
	return locator;
};

var waitForXHRsToComplete = function(callback) {
	var timeout = 150;
	var interval = setInterval(function () {
		var selector = 'div:not([style*="display: none"])[data-wg-xtype="loadmask"]';
		var selector2 = 'div:not([style*="visibility: hidden"])[class*="ux-loader-mask"]';
		if (!~document.body.className.indexOf('x-ext-loading') &&
			!(document.querySelector(selector)) &&
			!(document.querySelector(selector2))) {
			clearInterval(interval);
			callback();
		}
	}, timeout);
};

var processLocators = function () {
	var page, locator;
	waitForXHRsToComplete(function () {
		for (page in locators) {
			if (locators.hasOwnProperty(page)) {
				for (locator in locators[page]) {
					if (locators[page].hasOwnProperty(locator)) {
						processLocator(locators[page][locator], page, locator)
					}
				}
			}
		}
	});
};

var processLocator = function (pageObject, page, locator) {
	var element = getElement(injectInvisibleValues(pageObject));
	if (element && !element.classList.contains('fg-found-locator')) {
		markFoundElement(element);
		addElementTitle(element, page, locator);
		attOnClickListener(element, page, locator);
		attOnRightClickListener(element, page, locator);
	}
};