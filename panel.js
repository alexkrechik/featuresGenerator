var locatorsString;

function addText(text) {
	document.getElementById("generatedFeatures").innerHTML += "<div>" + text + "</div>";
}

function getlocators(data) {
	data = data.replace(/.*function\(.*\) {/,'');
	data = data.replace(/}(\r\n|\n|\r)*$/,'');
	var evalStr = 'var func = function(){' + data + '}';
	eval(evalStr);
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