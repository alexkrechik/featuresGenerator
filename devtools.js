// Create a new panel
chrome.devtools.panels.create("Features Generator",
    null,
    "panel.html",
    function(extensionPanel) {
        var _window;

        //If panel is opened - show message, add it to data[] otherwise
        var data = [];
        var port = chrome.runtime.connect({name: 'devtools'});
        port.onMessage.addListener(function (msg) {
            if(_window) {
                _window.addStepText(msg.step);
            } else {
                data.push(msg.step);
            }
        });

        //Add all the messages got before panel was opened
        extensionPanel.onShown.addListener(function tmp(panelWindow) {
            extensionPanel.onShown.removeListener(tmp);
            _window = panelWindow;
            var msg;
            while (msg = data.shift())
                _window.addStepText(msg.step);
	        
	        chrome.devtools.inspectedWindow.getResources(function (resources) {
		        var menu = resources.find(function(el){ return el.url.match(/menu.js/)});
		        menu.getContent(function(content) {
			        _window.menu = content;
		        });
	        });
        });

    }
);