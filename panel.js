var locatorsString;
var menu;

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

function autoComplete() {
	return document.getElementById("auto-steps-complete").checked;
}

function addText (text) {
	document.getElementById("generatedFeatures").innerHTML += "<div>" + text + "</div>";
}

function addStepText(text) {
	addText(generateStepText(text));
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
			addText(JSON.stringify(err) + err.message);
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
		addText(err + " " + err.message);
	}
}

function inspectedWindowEval(command, callback) {
	chrome.devtools.inspectedWindow.eval(command, {useContentScriptContext: true}, callback);
}

document.getElementsByClassName('file-input')[0].addEventListener('change', function(){
	var file = this.files[0];
	var reader = new FileReader();
	reader.onload = function(){
		try {
			var text = reader.result;
			locatorsString = getlocators(text);
		} catch(err) {
			addText(err + " " + err.message);
		}
	};
	reader.readAsText(file);
},false);

document.getElementById('upload-locators').addEventListener('click', function(){
	var strJSON = JSON.stringify(locatorsString);
	var replaces = document.getElementById('page-object-replace').value;
	var arr = JSON.parse(replaces);
	arr.forEach(function(strArr){
		var from = strArr[0].replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
		var to = strArr[1];
		var regex = new RegExp(from, "g");
		strJSON = strJSON.replace(regex,to);
	});
	var locatorsPageName = document.getElementById('page-object-name').value;
	var strAddLocatorsCommand = 'locators["' + locatorsPageName + '"] =' + strJSON + ';';
	inspectedWindowEval(strAddLocatorsCommand, function(result, err){
		if (err) {
			addText(JSON.stringify(err) + err.message);
		}
		var fileName = document.getElementsByClassName('file-input')[0].files[0].name;
		try {
			addUploadedLocatorsFile(locatorsPageName, fileName);
			inspectedWindowEval('processLocators();');
			document.getElementById('page-object-name').value = "";
			document.getElementsByClassName('file-input')[0].value="";
		} catch(err) {
			addText(err + " " + err.message);
		}
	});
},false);

document.getElementById('auto-steps-complete').addEventListener('click', function(e){
	if(autoComplete()) {
		document.getElementById('steps_suggestions_block').style.display = 'table-cell';
	} else {
		document.getElementById('steps_suggestions_block').style.display = 'none';
	}
});

