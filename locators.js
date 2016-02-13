var locators = {
	inputSearch : '//input[@name="q"]',
	btnSearch : '//input[@name="btnK"]'
};

var markFoundElement = function (element) {
	element.style.setProperty('border','thin solid #0000FF','important');
};

var markLocator = function (locator) {
	try {
		var element = document.evaluate(locator, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
		if (element) {
			markFoundElement(element);
		}
	} catch (err) {
		console.log(err + ' ' + locator);
	}
};

for (var locator in locators) {
	if (locators.hasOwnProperty(locator)) {
		markLocator(locators[locator]);
	}
}