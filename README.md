# «Spacers» plugin for Figma


## About the plugin 
Autolayout are great but the constant space between components is sometimes an issue.
This Figma plugin allows to easily insert spacers in Figma autolayout.
**In this first version only base-8 vertical spacers are available.**
Spacers infos can be shown or hidden as you do in a word processor with the pilcrow (¶).


## About using spacers 
Spacers are [not a correct practice in HTML](https://www.w3.org/TR/WCAG20-TECHS/C18.html) since the presentation concerns must be defined in CSS.  
But Figma is a design tool – Should the HTML-CSS specialization be a concern in Figma?

In practice, spacers in autolayout speed up the design. 
Set vertical autolayout to your main frame and just add components inside. 
Add spacers to easily adjust the distance between components and keep the magic of autolayout.


## About the code

This plugin template uses Typescript. If you are familiar with Javascript, Typescript will
look very familiar. In fact, valid Javascript code is already valid Typescript code.

Typescript adds type annotations to variables. This allows code editors such as Visual Studio Code
to provide information about the Figma API while you are writing code, as well as help catch bugs
you previously didn't notice.

For more information, visit https://www.typescriptlang.org/

Using Typescript requires a compiler to convert Typescript (code.ts) into Javascript (code.js)
for the browser to run.

To get the TypeScript compiler working:

1. Download Visual Studio Code if you haven't already: https://code.visualstudio.com/.
2. Install the TypeScript compiler globally: `sudo npm install -g typescript`.
3. Open this directory in Visual Studio Code.
4. Compile TypeScript to JavaScript: Run the "Terminal > Run Build Task..." menu item,
    then select "tsc: watch - tsconfig.json". You will have to do this again every time
    you reopen Visual Studio Code.

That's it! Visual Studio Code will regenerate the JavaScript file every time you save.
