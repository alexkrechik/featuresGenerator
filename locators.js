var markFoundElement = function (element) {
	element.style.setProperty('border','thin solid #0000FF','important');
};

var addElementTitle = function (element, page, locator) {
	element.title = '"' + page + '"."' + locator + '"';
};

var attOnClickListener = function (element, page, locator) {
	element.addEventListener('click', function () {
		sendMessage({step: 'When I click "' + page + '"."' + locator + '"'});
	})
};

var getElement = function(locator) {
		return document.evaluate(locator, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
};

var processLocators = function (locators) {
	for (var page in locators) {
		if (locators.hasOwnProperty(page)) {
			for (var locator in locators[page]) {
				if (locators[page].hasOwnProperty(locator)) {
					var element = getElement(locators[page][locator]);
					if (element) {
						markFoundElement(element);
						addElementTitle(element, page, locator);
						attOnClickListener(element, page, locator);
					}
				}
			}
		}
	}
};

processLocators(locators);