var steps = [
	'Then "page"."locator" should be present',
	'When I click "page"."locator"',
	'I clear "page"."locator"',
	'I write "" to "page"."locator"',
	'I wait and click "page"."locator"',
	'"page"."locator" CSS "" should contain ""',
	'"page"."locator" has text ""',
	'"page"."locator" has value ""',
	'"page"."locator" should not be present',
	{'Element attributes' : [
		'"page"."locator" CSS "" should be nearly ""',
		'"page"."locator" CSS "" should contain ""',
		'"page"."locator" CSS "" should contain "".""',
		'"page"."locator" attribute "" should contain ""',
		'"page"."locator" attribute "" should not contain ""',
		'"page"."locator" has text ""',
		'"page"."locator" has text "".""',
		'"page"."locator" has value ""',
		'"page"."locator" has value "".""',
		'"page"."locator" value equals ""',
		'I wait for "page"."locator" to match ""',
		'I wait for "page"."locator" to match "".""'
	]},
	{'Element state' : [
		'"page"."locator" should be disabled',
		'"page"."locator" should be enabled',
		'"page"."locator" should be present',
		'"page"."locator" should be selected',
		'"page"."locator" should not be present',
		'"page"."locator" should not be selected',
		'"page"."locator" value should be present in ""."" dd'
	]},
	{'Actions' : [
		'I clear "page"."locator"',
		'I click "page"."locator" at dropdown button',
		'I click "page"."locator" if present',
		'I doubleclick "page"."locator"',
		'I focus "page"."locator"',
		'I moveTo "page"."locator"',
		'I scroll "page"."locator" element into view',
		'I set inner HTML value "" to "page"."locator"',
		'I switch to "page"."locator" frame',
		'I upload "" to "page"."locator"',
		'I wait and click "page"."locator"',
		'I write "" to "page"."locator"',
		'I write ""."" to "page"."locator"'
	]}
];

function showMenu (e, page, locator) {

	var menu = createMenu(page, locator);

	var x = e.clientX;
	var y = e.clientY;

	windowWidth = window.innerWidth;
	windowHeight = window.innerHeight;

	menu.style.position = "fixed";
	menu.style.zIndex = 1000;
	menu.style.backgroundColor = "white";

	var elementHeight = menu.clientHeight;
	var elementWidth = menu.clientWidth;

	if(windowWidth < (x + elementWidth)) {
		x -= elementWidth;
	}
	if(windowHeight < (y + elementHeight)) {
		y -= elementHeight;
	}

	menu.style.top = y+"px";
	menu.style.left = x+"px";
}

function clearMenu () {
	if(menu = document.getElementById('menu')) {
		document.getElementsByTagName('body')[0].removeChild(menu);
	}
}

function createMenu (page, locator) {
	clearMenu();
	menu = document.createElement('div');
	menu.setAttribute('id','menu');
	menu.style.borderStyle = "solid";
	menu.addEventListener('mouseout', function (event) {
		var e = event.toElement || event.relatedTarget;
		if (notMenuChild(e)) {
			clearMenu();
		}
	});
	document.getElementsByTagName('body')[0].appendChild(menu);
	addMenuElements(page, locator, steps);
	return menu;
}

function addMenuElements(page, locator, steps, parent) {
	for (var i = 0; i < steps.length; i++) {
		if (typeof steps[i] === 'object') {

		} else {
			document.getElementById('menu').appendChild(createMenuElement(steps[i], page, locator));
		}
	}
}

function createMenuElement(text, page, locator) {
	text = text.replace('"page"','"' + page + '"');
	text = text.replace('"locator"','"' + locator + '"');
	var element = document.createElement('a');
	if (text) {
		element.textContent = text;
	}
	element.setAttribute('href','#');
	element.style.display = 'flex';
	element.style.margin = "5";
	element.addEventListener('click', function() {
		chrome.extension.sendMessage({step: text});
		clearMenu();
	});
	return element;
}

function notMenuChild(element) {
	if (!element) {
		return true;
	} else if (element.getAttribute('id') == 'menu') {
		return false;
	} else {
		return notMenuChild(element.parentElement);
	}
}