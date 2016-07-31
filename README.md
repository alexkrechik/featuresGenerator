# featuresGenerator
0.4 version of chrome features generator plugin. Requires **Chrome version 49** or greater.

## How to install from Github repository:
* Download the extension as a .zip by clicking on "Clone or download" and then “Download ZIP” button on the right side of the project page
* Extract/unzip the code. Then in Chrome click on the Menu icon (the three lines) -> More tools -> Extensions
* Click the "Developer mode" checkbox and then click the button labeled "Load unpacked extension..."
* Navigate in the resulting file dialog box to the extension folder (featuresGenerator-master) with a manifest.json file
* Click "Select" button and that’s it - the extension icon will appear on the extensions bar of your browser

## How to install:
### Download plugin folder
### Open Chrome Extension page (chrome://extensions)
### Check "Developer Mode"
### Load plugin folder using "Load unpacked extension..."

## How to use:
### Open features generator plugin
* Open page that you want to automate in the browser
* Open dev tools and proceed to the "Features Generator" section

### Use locators pages
* Upload page objects in "module.exports" style (for ex. "pageObjectsEx.js" in root dir)
* Add array of "replace" arrays to "Replaces array" field
* Add some page name and click on "upload locators" button
* All the locators, found on current page, will be highlighted with blue border automatically
* All the locators will be re-highlighted after clicking on any found element
* All the locators could be re-highlighted in any moment via clicking on "plugin" button

### Generate steps
* Add "I click" actions via "Alt" + click
* Add "Should be present" actions via "Shift" + click
* Add some "most used" action via right click + action name click
* "Auto add And term" option will change "When When When" strings to "When And And"

### Use AutoSteps complete
* Check "Auto steps complete" to begin
* Start to input step in the "Generated steps" field
* Choose step u need from "Steps variants" panel using mouse or keyboard arrows + Enter key
* Click on some highlighted element on page to replace "page"."object" to correct locator name

## added in 0.4 version of plugin:
* Pack of bugfixes
