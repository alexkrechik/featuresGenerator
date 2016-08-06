// Create a new panel
chrome.devtools.panels.create("Features Generator",
    null,
    "panel.html",
    function(extensionPanel) {
        var _window;

	    //Handle got messages
	    var port = chrome.runtime.connect({name: 'devtools'});
        port.onMessage.addListener(function (msg) {
	        if(_window) {
		        if (msg.step) {
			        //Add new stepline
			        _window.addText(_window.generateStepText(msg.step));
			        _window.addText('<br>');
		        } else if (msg.suggestion) {
			        //Got some suggestion from content page
			        _window.setSelectionText('');
			        _window.setSelectionText(_window.generateStepText(msg.suggestion));
			        _window.addText('<br>');
			        _window.clearSuggestions();
		        }
	        }
        });

        extensionPanel.onShown.addListener(function tmp(panelWindow) {
            extensionPanel.onShown.removeListener(tmp);
            _window = panelWindow;
	        //add menu.js to the panel context
	        chrome.devtools.inspectedWindow.getResources(function (resources) {
		        var menu = resources.find(function(el){ return el.url.match(/menu.js/)});
		        menu.getContent(function(content) {
			        _window.eval(content);
		        });
	        });
        });

    });
