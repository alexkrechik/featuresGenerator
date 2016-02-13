var locators = {
	mainPage: {
		inputSearch : '//input[@name="q"]',
		btnSearch : '//input[@name="btnK"]'
	}
};

var markFoundElement = function (element) {
	element.style.setProperty('border','thin solid #0000FF','important');
};

var markLocator = function (page, locator) {
	try {
		var element = document.evaluate(locator, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
		if (element) {
			markFoundElement(element);
		}
	} catch (err) {
		console.log(err + ' ' + locator);
	}
};

for (var page in locators) {
	if (locators.hasOwnProperty(page)) {
		for (var locator in locators[page]) {
			if (locators[page].hasOwnProperty(locator)) {
				markLocator(page,locators[page][locator]);
			}
		}
	}
}