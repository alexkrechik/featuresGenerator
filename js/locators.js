var locators = {
	inputSearch : '//input[@name="q"]',
	btnSearch : '//input[@name="btnK"]'
};


var markLocator = function (locator) {
	try {
		var element = document.evaluate(locator, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
		if (element) {
			element.style.setProperty("border","thin solid #0000FF","important")
		}
	} catch (err) {
		console.log(err + " " + locator);
	}

};

for (var locator in locators) {
	markLocator(locators[locator]);
}