# featuresGenerator
0.2 version of chrome features generator plugin.

## How to use:
* Open page u wanna automate in the browser
* Open dev tools and proceed to the "Features Generator" section
* Upload page objects in "module.exports" style (ex. "pageObjectsEx.js" in root dir)
* Add array of "replace" arrays to "Replaces array" field
* Add some page name and click on "upload locators" button
* All the locators, found on current page, will be highlighted with blue border automatically
* All the locators will be re-highlighted after clicking on any found element
* All the locators could be re-highlighted in any moment via clicking on "plugin" button
* Add "I click" actions via "Alt" + click
* Add "Should be present" actions via "Shift" + click
* Add some "most used" action via right click + action name click

## added in 0.2 version of plugin:
* Any "require()" in page object file will return an empty string
* Added an ability to replace some string in all the locators 
* Add context menu with ability to add most used actions
* Some small improvements/bugfixes
