var locatorsString;
var menu;

var steps = [
	// 'Then "page"."locator" should be present',
	// 'When I click "page"."locator"',
	// 'When I clear "page"."locator"',
	// 'When I write "" to "page"."locator"',
	// 'When I wait and click "page"."locator"',
	// 'Then "page"."locator" CSS "" should contain ""',
	// 'Then "page"."locator" has text ""',
	// 'Then "page"."locator" has value ""',
	// 'Then "page"."locator" should not be present',
	// 'Then "page"."locator"',
	// {'Element attributes' : [
	// 	'Then "page"."locator" CSS "" should be nearly ""',
	// 	'Then "page"."locator" CSS "" should contain ""',
	// 	'Then "page"."locator" CSS "" should contain "".""',
	// 	'Then "page"."locator" attribute "" should contain ""',
	// 	'Then "page"."locator" attribute "" should not contain ""',
	// 	'Then "page"."locator" has text ""',
	// 	'Then "page"."locator" has text "".""',
	// 	'Then "page"."locator" has value ""',
	// 	'Then "page"."locator" has value "".""',
	// 	'Then "page"."locator" value equals ""',
	// 	'When I wait for "page"."locator" to match ""',
	// 	'When I wait for "page"."locator" to match "".""'
	// ]},
	// {'Element state' : [
	// 	'Then "page"."locator" should be disabled',
	// 	'Then "page"."locator" should be enabled',
	// 	'Then "page"."locator" should be present',
	// 	'Then "page"."locator" should be selected',
	// 	'Then "page"."locator" should not be present',
	// 	'Then "page"."locator" should not be selected',
	// 	'Then "page"."locator" value should be present in ""."" dd'
	// ]},
	// {'Actions' : [
	// 	'When I clear "page"."locator"',
	// 	'When I click "page"."locator" at dropdown button',
	// 	'When I click "page"."locator" if present',
	// 	'When I doubleclick "page"."locator"',
	// 	'When I focus "page"."locator"',
	// 	'When I moveTo "page"."locator"',
	// 	'When I scroll "page"."locator" element into view',
	// 	'When I set inner HTML value "" to "page"."locator"',
	// 	'When I switch to "page"."locator" frame',
	// 	'When I upload "" to "page"."locator"',
	// 	'When I wait and click "page"."locator"',
	// 	'When I write "" to "page"."locator"',
	// 	'When I write ""."" to "page"."locator"'
	// ]}
];

//******** COMMON METHODS ********************************************************************************************//

function addError(err, text) {
	var msg = "";
	text && (msg += text + ":::");
	err && (msg += JSON.stringify(err));
	err.message && (msg += ":::" + JSON.stringify(err.message));
	alert(msg);
}

function inspectedWindowEval(command, callback) {
	chrome.devtools.inspectedWindow.eval(command, {useContentScriptContext: true}, callback);
}

function getStepsArr(steps) {
	var arr = [];
	var step;
	steps.forEach(function(step) {
		if (typeof step === 'string') {
			arr.push(step);
		} else {
			for (var key in step) {
				step[key].forEach(function(lowerStep) {
					arr.push(lowerStep)
				});
			}
		}
	});
	return arr;
}

function filterSteps(steps, text) {
	var res = [];
	steps.forEach(function(step) {
		var re = new RegExp(text, 'i');
		if (step.match(re)) {
			res.push(step);
		}
	});
	return res;
}

function markHighlightStatus(step) {
	if (autoComplete()) {
		inspectedWindowEval('setSuggestionMode(\'' + step + '\');', function(result, err) {
			if (err) {
				addError(err, 'Error during statuses highlighting');
			}
		});
	}
}

function removeCurrentClass(e) {
	e = e || document.getElementsByClassName('current-suggestion')[0];
	e.classList.remove('current-suggestion');
}

function addCurrentClassName(e) {
	e.className += ' current-suggestion';
}

function eventKeyDownDocument(event) {
	if(autoComplete()) {
		switch(event.keyCode) {
			case 38:
				highlightSuggestion('previous');
				break;
			case 40:
				highlightSuggestion('next');
				break;
			case 13:
				var currEl = document.getElementsByClassName('current-suggestion')[0];
				if (currEl && !event.altKey && !event.shiftKey) {
					if (currEl.text && currEl.text !== getDivFocusText()) {
						setSelectionText(currEl.text);
						markHighlightStatus(currEl.text);
						event.preventDefault();
					} else {
						populateAutoComplete();
					}
				}
				break;
		}
	}
}

//******** HEAD SIDE OF EXTENSION ************************************************************************************//

function autoComplete() {
	return document.getElementById("auto-steps-complete").checked;
}

function getlocators(data) {
	//Remove everything before module.exports
	data = data.replace(/.*module.exports.*/,'');
	//Remove last close and everething after it
	data = data.replace(/};?(\r\n|\n|\r)*$/,'');
	var evalStr = 'var func = function(){' + data + '}';
	eval(evalStr);
	//node require proxy
	function require(param) {
		if (typeof param === 'string') {
			param = {};
		}
		return new Proxy(param, handler);
	}
	var handler = {
		get: function (target, key, receiver) {
			if (!(key in target)) {
				target[key] = require(function(){});
			}
			return Reflect.get(target, key, receiver);
		},
		apply: function() {
			return '';
		}
	};
	return func();
}

function clearLocator(fileName, locatorsPageName) {
	var element = document.getElementById('uploaded-locator-id' + fileName);
	document.getElementById('uploaded-locators').removeChild(element);
	chrome.devtools.inspectedWindow.eval('delete locators["' + locatorsPageName + '"];',{useContentScriptContext: true},
		function(result, err) {
		if (err) {
			addError(err, 'Error during locators clearing');
		}
	});
}

function addUploadedLocatorsFile(locatorsPageName, fileName) {
	try {
		var element = document.createElement('div');
		element.setAttribute('id','uploaded-locator-id' + fileName);
		element.innerText =  "'" + fileName + "' file was uploaded to '" + locatorsPageName + "' locators page ";
		var removeElement = document.createElement('button');
		removeElement.innerText = "Remove uploaded locator";
		removeElement.addEventListener('click', function() {
			clearLocator(fileName, locatorsPageName);
		});
		element.appendChild(removeElement);
		document.getElementById('uploaded-locators').appendChild(element);
	} catch(err) {
		addError(err, 'Error during locator file element creation');
	}
}

function eventFileInput(){
	var file = this.files[0];
	var reader = new FileReader();
	reader.onload = function(){
		try {
			var text = reader.result;
			locatorsString = getlocators(text);
		} catch(err) {
			addError(err, 'Error during file reading');
		}
	};
	reader.readAsText(file);
}

function applyReplaces(str) {
	var replaces = document.getElementById('page-object-replace').value;
	if (replaces) {
		var arr = JSON.parse(replaces);
		arr.forEach(function(strArr){
			var from = strArr[0].replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
			var to = strArr[1];
			var regex = new RegExp(from, "g");
			str = str.replace(regex,to);
		});
	}
	return str;
}

function eventUploadLocators(){
	try {
		var strJSON = JSON.stringify(locatorsString);
		strJSON = applyReplaces(strJSON);
		var locatorsPageName = document.getElementById('page-object-name').value;
		if (!locatorsPageName) {
			throw 'Page name should not be empty';
		}
	} catch(err) {
		addError(err, 'Upload locators error');
	}
	var strAddLocatorsCommand = 'locators["' + locatorsPageName + '"] =' + strJSON + ';';
	inspectedWindowEval(strAddLocatorsCommand, function(result, err){
		if (err) {
			addError(err, 'Applying locators error');
		} else {
			var fileName = document.getElementsByClassName('file-input')[0].files[0].name;
			try {
				addUploadedLocatorsFile(locatorsPageName, fileName);
				inspectedWindowEval('processLocators();');
				document.getElementById('page-object-name').value = "";
				document.getElementsByClassName('file-input')[0].value="";
			} catch(err) {
				addError(err, 'Locators processing error');
			}
		}
	});
}

function eventAutoStepsComplete(e){
	if(autoComplete()) {
		document.getElementById('steps-suggestions-block').style.display = 'table-cell';
		populateAutoComplete();
		document.getElementById("generated-features").focus();
	} else {
		document.getElementById('steps-suggestions-block').style.display = 'none';
	}
}

//******** STEPS VARIANTS ********************************************************************************************//

function createSuggestion(text) {
	var element = document.createElement('a');
	element.textContent = text;
	element.setAttribute('href','#');
	element.setAttribute('class','suggestion');
	element.addEventListener('click', function(e) {
		document.getElementById("generated-features").focus();
		highlightSuggestionEvent(e);
		markHighlightStatus(text);
		setSelectionText(text);
	});
	return element;
}

function highlightSuggestionEvent(e) {
	removeCurrentClass();
	e.target.classList.add('current-suggestion');
}

function highlightSuggestion(num) {
	var suggestions = document.getElementsByClassName('suggestion');
	var current = document.getElementsByClassName('current-suggestion')[0];
	var other;
	if (suggestions) {
		switch(num) {
			case 'first':
			case undefined:
				if (suggestions[0]) {
					current = suggestions[0];
					current.classList.add('current-suggestion');
				}
				break;
			case 'next':
				if (current && (other = current.nextElementSibling)) {
					removeCurrentClass();
					other.classList.add('current-suggestion');
					event.preventDefault();
				}
				break;
			case 'previous':
				if (current && (other = current.previousElementSibling)) {
					removeCurrentClass();
					other.classList.add('current-suggestion');
					event.preventDefault();
				}
		}
	}
}

function clearSuggestions() {
	document.getElementById('steps-suggestions').innerHTML = "";
}

//******** GENERATED STEPS *******************************************************************************************//

function getLastChild() {
	var features = document.getElementById("generated-features");
	var childs = features.childNodes;
	if (childs.length === 0 || childs.length === 1) {
		return features;
	} else {
		return childs[childs.length - 1];
	}
}

function addText (text) {
	var lastChild = getLastChild();
	var features = document.getElementById("generated-features");
	if (lastChild.innerHTML === '' || lastChild.innerHTML === '<br>') {
		lastChild.innerHTML = text;
	} else {
		features.innerHTML += "<div>" + text + "</div>";
	}
}

function generateStepText(text) {
	if (document.getElementById("bdd-term-replace").checked) {
		var currStep = text.match(/^[A-Za-z]*/)[0];
		var stepsArr = document.getElementById("generated-features").innerText.split(/\n/);
		var lastStep;
		for (var i = stepsArr.length - 1; i >=0; i--) {
			lastStep = stepsArr[i].match(/^[A-Za-z]*/)[0];
			if (lastStep !== 'And' && lastStep !== '') {
				if (lastStep === currStep) {
					var re = new RegExp("^" + currStep);
					return text.replace(re, "And");
				} else {
					return text;
				}
			}
		}
	}
	return text;
}

function getDivFocusText() {
	var text = window.getSelection().focusNode.parentElement.innerText;
	var textArr = text.split('\n');
	return textArr[textArr.length - 1];
}

function getCurrText(e) {
	//TODO - get everething works with getDivFocusText only
	var text = getDivFocusText();
	var code = e.keyCode;
	var letter = String.fromCharCode(code);
	if (letter.match(/[A-Z]/)) {
		text += letter.toLocaleLowerCase();
	} else if(e.keyCode === 8) {
		text = text.substr(0, text.length - 1);
	}
	return text;
}

function setSelectionText(text, changeLastElement) {
	//If we have some selection text - sent "text" parameter as its first string
	//Otherwise, if changeLastElement is true - change last string of generated-features
	//Else add string in the end of generated-features block
	var parentId = window.getSelection().focusNode && window.getSelection().focusNode.parentElement.parentElement.id;
	var lastElement = getLastChild();
	if (parentId === 'generated-features') {
		window.getSelection().focusNode.textContent = text;
	} else {
		if (changeLastElement) {
			lastElement.innerText = text;
		} else {
			addText(text);
		}
	}
}

function populateAutoComplete(e) {
	if(autoComplete()) {
		document.getElementById('steps-suggestions').innerHTML = "";
		var resSteps;
		var currText = e ? getCurrText(e) : "";
		var stepsArr = getStepsArr(steps);
		resSteps = filterSteps(stepsArr, currText);
		resSteps.forEach(function(step){
			document.getElementById('steps-suggestions').appendChild(createSuggestion(step));
		});
		highlightSuggestion();
	}
}

function generatedFeaturesKeyDown(e) {
	var arrCode = [38, 40, 13, 91, 16, 17, 18, 9];
	var keyCode = e.keyCode;
	if (arrCode.indexOf(keyCode) === -1) {
		populateAutoComplete(e);
	}
}

//******** EVENT LISTENERS *******************************************************************************************//

document.getElementsByClassName('file-input')[0].addEventListener('change', eventFileInput);

document.getElementById('upload-locators').addEventListener('click', eventUploadLocators);

document.getElementById('auto-steps-complete').addEventListener('click', eventAutoStepsComplete);

document.getElementById('generated-features').addEventListener('keydown', generatedFeaturesKeyDown);

document.addEventListener('keydown', eventKeyDownDocument);
