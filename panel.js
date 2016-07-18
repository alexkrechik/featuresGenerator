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
		inspectedWindowEval('currSuggestion = \'' + step + '\';', function(result, err) {
			if (err) {
				addError(err, 'Error during statuses highlighting');
			}
		});
	}
}

function removeCurrentClass(e) {
	e.className = e.className.replace( new RegExp('(?:^|\\s)current_suggestion(?!\\S)') ,'');
}

function addCurrentClassName(e) {
	e.className += ' current_suggestion';
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
				var currEl = document.getElementsByClassName('current_suggestion')[0];
				if (currEl) {
					insertStep(currEl.text);
					break;
				}
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
	function require() {
		return new Proxy({},{
			get: function(target) {
				return new Proxy(target, {
					get: function() {return new Proxy(target,{
						apply: function() {return ''}
					})},
					apply: function() {return ''}
				});
			}
		});
	}
	return func();
}

function clearLocator(fileName, locatorsPageName) {
	var element = document.getElementById('uploaded-locator-id' + fileName);
	document.getElementById('uploaded-locators').removeChild(element);
	chrome.devtools.inspectedWindow.eval('delete locators["' + locatorsPageName + '"];',{useContentScriptContext: true}, function(result, err) {
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
			addText(err, 'Error during file reading');
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
		document.getElementById('steps_suggestions_block').style.display = 'table-cell';
	} else {
		document.getElementById('steps_suggestions_block').style.display = 'none';
	}
}

//******** STEPS VARIANTS ********************************************************************************************//

function createSuggestion(text) {
	var element = document.createElement('a');
	element.textContent = text;
	element.setAttribute('href','#');
	element.setAttribute('class','suggestion');
	element.style.display = 'flex';
	element.style.margin = "5";
	element.addEventListener('click', function() {
		setDivFocusText(text);
	});
	return element;
}

function highlightSuggestion(num) {
	var suggestions = document.getElementsByClassName('suggestion');
	var current = document.getElementsByClassName('current_suggestion')[0];
	var other;
	if (suggestions) {
		switch(num) {
			case 'first':
			default:
				if (suggestions[0]) {
					current = suggestions[0];
					addCurrentClassName(current);
				}
				break;
			case 'next':
				if (current && (other = current.nextElementSibling)) {
					addCurrentClassName(other);
					removeCurrentClass(current);
					event.preventDefault();
				}
				break;
			case 'previous':
				if (current && (other = current.previousElementSibling)) {
					addCurrentClassName(other);
					removeCurrentClass(current);
					event.preventDefault();
				}
		}
	}
}

function clearSuggestions() {
	document.getElementById('steps_suggestions').innerHTML = "";
}

//******** GENERATED STEPS *******************************************************************************************//

function addText (text) {
	document.getElementById("generatedFeatures").innerHTML += "<div>" + text + "</div>";
}

function generateStepText(text) {
	if (document.getElementById("bdd-term-replace").checked) {
		var currStep = text.match(/^[A-Za-z]*/)[0];
		var stepsArr = document.getElementById("generatedFeatures").innerText.split(/\n/);
		var lastStep = "";
		for (var i = stepsArr.length - 1; i >=0; i--) {
			lastStep = stepsArr[i].match(/^[A-Za-z]*/)[0];
			if (lastStep !== 'And') {
				if (lastStep === currStep) {
					var re = new RegExp("^" + currStep);
					text = text.replace(re, "And");
				}
				return text;
			}
		}
	} else {
		return text;
	}
}

function addStepText(text) {
	addText(generateStepText(text));
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

function setDivFocusText(text, newline) {

	//Insert currStep text
	var sel, range;
	sel = window.getSelection();
	window.getSelection().focusNode.textContent = "";
	range = sel.getRangeAt(0);
	var newNode = document.createTextNode(text);
	range.insertNode(newNode);

	//move the cursor
	range.setStartAfter(newNode);
	range.setEndAfter(newNode);
	sel.removeAllRanges();
	sel.addRange(range);

	//newline
	if (newline) {
		var div = document.createElement("div");
		sel.focusNode.parentElement.parentElement.appendChild(div);
	}
}

function insertStep(currStep) {
	var textContent = getDivFocusText();
	if (currStep && currStep !== textContent) {
		setDivFocusText(currStep);
		markHighlightStatus(currStep);
		event.preventDefault();
	}
}

function populateAutoComplete(e) {
	if(autoComplete()) {
		document.getElementById('steps_suggestions').innerHTML = "";
		var resSteps;
		var currText = getCurrText(e);
		var stepsArr = getStepsArr(steps);
		resSteps = filterSteps(stepsArr, currText);
		resSteps.forEach(function(step){
			document.getElementById('steps_suggestions').appendChild(createSuggestion(step));
		});
		highlightSuggestion();
	}
}

function generatedFeaturesKeyDown(e) {
	var arrCode = [38, 40, 13];
	var keyCode = e.keyCode;
	if (arrCode.indexOf(keyCode) === -1) {
		populateAutoComplete(e);
	}
}

//******** EVENT LISTENERS *******************************************************************************************//

document.getElementsByClassName('file-input')[0].addEventListener('change', eventFileInput);

document.getElementById('upload-locators').addEventListener('click', eventUploadLocators);

document.getElementById('auto-steps-complete').addEventListener('click', eventAutoStepsComplete);

document.getElementById('generatedFeatures').addEventListener('keydown', generatedFeaturesKeyDown);

document.addEventListener('keydown', eventKeyDownDocument);
