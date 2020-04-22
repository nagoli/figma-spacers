// This plugin will open a modal to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.
// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser enviroment (see documentation).
// This shows the HTML page in "ui.html".
figma.showUI(__html__);
const LabelStyle = { type: 'SOLID', color: { r: 0.8, g: 0, b: 1 } };
const FrameStyle = { type: 'SOLID', color: { r: 0.98, g: 0.89, b: 1 } };
const SpacersProperty = 'spacers';
const HideProperty = 'hide';
//names of the layers considered as spacers
const SpacerName = "spacer_";
const LabelName = 'label_';
const HLineName = 'hline_';
const VLineName = 'vline_';
const SizeProperty = 'size';
// this state is stored in the page to know if showing or not the infos in a new spacer
const SpacerInfoState = 'spacer-info-state';
function makeSpacerNode(size) {
    const text = figma.createText();
    text.name = LabelName;
    text.locked = true;
    figma.loadFontAsync({ family: "Roboto", style: "Regular" }).then(msg => {
        text.fontSize = size;
        text.x = 1;
        text.y = 0;
        text.textAlignHorizontal = 'LEFT';
        text.textAlignVertical = 'TOP';
        text.characters = String(size);
        text.fills = [clone(LabelStyle)];
        text.letterSpacing = { unit: "PERCENT", value: -15 };
    });
    function styleLine(line, size) {
        line.strokes = [clone(LabelStyle)];
        line.resize(size, 0);
        line.locked = true;
        line.x = 0;
        line.y = 0;
    }
    const hline = figma.createLine();
    hline.name = HLineName;
    styleLine(hline, size);
    hline.y = 1;
    const vline = figma.createLine();
    vline.name = VLineName;
    styleLine(vline, size);
    vline.rotation = -90;
    const frame = figma.createFrame();
    frame.setPluginData(SizeProperty, String(size));
    frame.name = size + "px " + SpacerName;
    frame.resize(size, size);
    frame.fills = [clone(FrameStyle)];
    frame.layoutAlign = 'CENTER';
    frame.appendChild(text);
    frame.appendChild(hline);
    frame.appendChild(vline);
    let showInfo = true;
    showSpacerInfos(frame, figma.root.getPluginData(SpacerInfoState) != "0");
    return frame;
}
function showSpacerInfos(spacer, isShow) {
    spacer.children.forEach(child => {
        if (child.name === HLineName || child.name === VLineName || child.name === LabelName)
            child.visible = isShow;
    });
    if (isShow)
        spacer.fills = [clone(FrameStyle)];
    else
        spacer.fills = [];
    //update size in case it was manually changed
    //let size = spacer.getPluginData(SizeProperty);
    //if (size) spacer.resize(spacer.width,Number(size));
}
function showAllSpacerInfos(isShow) {
    figma.root.setPluginData(SpacerInfoState, isShow ? "1" : "0");
    var spacers = figma.root.findAll(node => node.type === "FRAME" && node.name.endsWith(SpacerName));
    spacers.forEach(spacer => showSpacerInfos(spacer, isShow));
}
// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = msg => {
    // One way of distinguishing between different types of messages sent from
    // your HTML page is to use an object with a "type" property like this.
    //get properties from project
    if (msg.type === 'get-properties-in-page') {
        console.log('get-properties-in-page called');
        //get Spacers In Page Properties
        var spacers = figma.root.getPluginData(SpacersProperty);
        var hide = figma.root.getPluginData(HideProperty);
        figma.ui.postMessage({ type: "set-properties-from-page", spacers: spacers ? arrayFrom(spacers) : false, hide: Boolean(hide) });
    }
    ;
    //get properties from project
    if (msg.type === 'set-spacers-in-page') {
        figma.root.setPluginData(SpacersProperty, msg.spacers.toString());
    }
    ;
    if (msg.type === 'show-spacer-infos') {
        showAllSpacerInfos(true);
        figma.root.setPluginData(HideProperty, "");
    }
    ;
    if (msg.type === 'hide-spacer-infos') {
        showAllSpacerInfos(false);
        figma.root.setPluginData(HideProperty, "1");
    }
    ;
    if (msg.type === 'add-spacer') {
        if (figma.currentPage.selection.length != 0) {
            let spacer = makeSpacerNode(msg.size);
            let selection = figma.currentPage.selection[0];
            // add as first child if selection is an empty autolayout
            if (selection.type === "FRAME" && selection.children.length === 0 && selection.layoutMode != "NONE") {
                selection.insertChild(0, spacer);
            }
            else {
                let position = selection.parent.children.indexOf(selection);
                selection.parent.insertChild(position + 1, spacer);
                if (selection.parent.type != "FRAME" || selection.parent.layoutMode === "NONE") {
                    //console.log("positionning : "+ selection.x + " "+ selection.y); 
                    spacer.x = selection.x;
                    spacer.y = selection.y + selection.height;
                }
                //trick to improve undo
                figma.currentPage.selection = [figma.currentPage.selection[0]];
                console.log(figma.currentPage.selection[0]);
                figma.currentPage.selection = [spacer];
            }
        }
        else
            figma.notify("Please select an element to add a spacer after");
    }
};
//util
function arrayFrom(str) {
    return str.split(',').map(Number);
}
function clone(val) {
    const type = typeof val;
    if (val === null) {
        return null;
    }
    else if (type === 'undefined' || type === 'number' ||
        type === 'string' || type === 'boolean') {
        return val;
    }
    else if (type === 'object') {
        if (val instanceof Array) {
            return val.map(x => clone(x));
        }
        else if (val instanceof Uint8Array) {
            return new Uint8Array(val);
        }
        else {
            let o = {};
            for (const key in val) {
                o[key] = clone(val[key]);
            }
            return o;
        }
    }
    throw 'unknown';
}
;
