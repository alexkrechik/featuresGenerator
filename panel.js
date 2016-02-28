var locators = {};

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

document.getElementsByClassName('file-input')[0].addEventListener('change', function(){
	var file = this.files[0];
	var input = event.target;
	var reader = new FileReader();
	reader.onload = function(){
		try {
			var text = reader.result;
			var filename = document.getElementsByClassName('page-object-name')[0].value;
			locators[filename] = getlocators(text);
		} catch(err) {
			addText(err + " " + err.message);
		}
	};
	reader.readAsText(file);
},false);

document.getElementsByClassName('send-message')[0].addEventListener('click', function(){
	loatorsStr = JSON.stringify(locators);
	chrome.devtools.inspectedWindow.eval('locators =' + loatorsStr + ';',{useContentScriptContext: true}, function(result, err){
		if (err) {
			addText(err);
		}
	});
},false);