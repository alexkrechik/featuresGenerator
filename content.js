locators = {
	// page1: {
	// 	invalidElement : 'asdasd',
	// 	inputSearch : '//input[@name="q"]',
	// 	btnSearch : '//input[@name="btnK"]',
	// 	btnFeelingLucky : '//input[@name="btnI"]',
	// 	missingElement: '//div[@id="non_existing_on_this_page_element"]'
	// }
};

var currSuggestion;

function setSuggestionMode(suggestion) {
	currSuggestion = suggestion;
	document.getElementsByTagName('body')[0].classList.add('suggestion-mode');
}

function unsetSuggestionMode() {
	currSuggestion = null;
	document.getElementsByTagName('body')[0].classList.remove('suggestion-mode');
}

function sendMessage(message) {
	chrome.extension.sendMessage(message);
}

function logMessage(message) {
	console.log(message);
}

var attOnClickListener = function (element, page, locator) {
	element.addEventListener('click', function (event) {
		if (currSuggestion) {
			var step = currSuggestion;
			step = step.replace('"page"','"' + page + '"');
			step = step.replace('"locator"','"' + locator + '"');
			sendMessage({suggestion: step});
			unsetSuggestionMode();
			event.stopPropagation();
		} else {
			if (event.altKey) {
				sendMessage({step: 'When I click "' + page + '"."' + locator + '"'});
				event.stopPropagation();
			}
			if (event.shiftKey) {
				sendMessage({step: 'Then "' + page + '"."' + locator + '" should be present'});
				event.stopPropagation();
			}
		}
		processLocators();
	})
};

var attOnRightClickListener = function (element, page, locator) {
	element.addEventListener('contextmenu', function (event) {
		event.stopPropagation();
		event.preventDefault();
		var menu = createMenu(getSteps(steps, page, locator));
		showMenu(menu, event.clientX, event.clientY);
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
		element.classList.add('fg-found-locator');
		element.title = '"' + page + '"."' + locator + '"';
		attOnClickListener(element, page, locator);
		attOnRightClickListener(element, page, locator);
	}
};
