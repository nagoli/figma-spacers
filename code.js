/**
 * Spacers is a figma plugin
 * It adds some spacers inside autolayout hat can all be hidden or shown at once
 * with a simple switch.
 *
 * This code concerns mainly
 *  1- the shape/ creation of the spacers
 *  2- shape version and display state management
 *  3- spacers positionning
 *  4- plugin additional functionalities
 *  5- utils
 *
 *
 *
 *
 *
 */
//import { cpus } from "os";
// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser enviroment (see documentation).
// This shows the HTML page in "ui.html".
figma.showUI(__html__);
figma.ui.resize(128, 470);
// version must change if spacer shape changes
const VERSION = '1.1';
//styles
const LabelStyle = { type: 'SOLID', color: { r: 0.8, g: 0, b: 1 } };
const ContainerStyle = { type: 'SOLID', color: { r: 0.98, g: 0.89, b: 1 } };
const Alignement = "CENTER";
//property names
const SpacersProperty = 'spacers';
const HideProperty = 'hide';
const VersionProperty = 'version';
const SizeProperty = 'size';
// this state is stored in the document to know if showing or not the infos in a new spacer
//const SpacerInfoStateProperty = 'spacer-info-state';
//names of the layers considered as spacers
const SpacerName = "spacer_";
const LabelName = 'label_';
const ContainerName = 'shape_';
const HLineName = 'hline_';
const VLineName = 'vline_';
//positions name
const LEFT = 'LEFT';
const RIGHT = 'RIGHT';
const BOTTOM = 'BOTTOM';
const TOP = 'TOP';
const REPLACE = 'REPLACE';
var positionState = BOTTOM;
/**
 * ******************
 * 1- the shape/ creation of the spacers
 * ******************
 */
/**
 * reshape a frame internal element but the size of the frame is not touched
 * @param frame
 * @param size
 */
function shapeSpacerNode(frame, size) {
    //customize
    const diamondShape = false;
    const withCorner = false;
    const flattenText = false;
    var containerSize = size;
    if (diamondShape)
        containerSize = Math.round(Math.sqrt(size * size / 2));
    frame.children.forEach(child => child.remove());
    frame.name = size + "px " + SpacerName;
    frame.fills = [];
    frame.opacity = 1;
    //CONTAINER 
    const container = figma.createFrame();
    frame.appendChild(container);
    container.name = ContainerName;
    container.resize(containerSize, containerSize);
    container.fills = [clone(ContainerStyle)];
    if (withCorner) {
        function styleLine(line, size) {
            line.strokes = [clone(LabelStyle)];
            line.resize(size, 0);
            line.locked = true;
            line.x = 0;
            line.y = 0;
        }
        const linesize = Math.round(size / 5);
        //up left corner 
        const hline1 = figma.createLine();
        hline1.name = HLineName + 1;
        styleLine(hline1, linesize);
        hline1.y = 1;
        const vline1 = figma.createLine();
        vline1.name = VLineName + 1;
        styleLine(vline1, linesize);
        vline1.rotation = -90;
        //up right corner
        const hline2 = figma.createLine();
        hline2.name = HLineName + 2;
        styleLine(hline2, linesize);
        hline2.x = containerSize - linesize;
        hline2.y = 1;
        const vline2 = figma.createLine();
        vline2.name = VLineName + 2;
        styleLine(vline2, linesize);
        vline2.x = containerSize - 1;
        vline2.rotation = -90;
        //down left corner
        const hline3 = figma.createLine();
        hline3.name = HLineName + 3;
        styleLine(hline3, linesize);
        hline3.y = containerSize;
        const vline3 = figma.createLine();
        vline3.name = VLineName + 3;
        styleLine(vline3, linesize);
        vline3.y = containerSize - linesize;
        vline3.rotation = -90;
        //down right corner
        const hline4 = figma.createLine();
        hline4.name = HLineName + 4;
        styleLine(hline4, linesize);
        hline4.x = containerSize - linesize;
        hline4.y = containerSize;
        const vline4 = figma.createLine();
        vline4.name = VLineName + 4;
        styleLine(vline4, linesize);
        vline4.x = containerSize - 1;
        vline4.y = containerSize - linesize;
        vline4.rotation = -90;
        container.appendChild(hline1);
        container.appendChild(vline1);
        container.appendChild(hline2);
        container.appendChild(vline2);
        container.appendChild(hline3);
        container.appendChild(vline3);
        container.appendChild(hline4);
        container.appendChild(vline4);
    }
    if (diamondShape) {
        container.rotation = -45;
        container.x = size / 2;
    }
    container.locked = true;
    //TEXT
    var text = figma.createText();
    frame.appendChild(text);
    text.name = LabelName;
    figma.loadFontAsync({ family: "Roboto", style: "Regular" }).then(msg => {
        if (containerSize < 16) {
            text.fontSize = containerSize - Math.round(containerSize * 0.2);
        }
        else {
            text.fontSize = 14;
        }
        text.x = 0;
        text.y = 0;
        text.textAlignHorizontal = 'LEFT';
        text.textAlignVertical = 'TOP';
        text.characters = String(size);
        text.fills = [clone(LabelStyle)];
        text.letterSpacing = { unit: "PERCENT", value: -5 };
        text.locked = true;
        text.x = (size - text.width) / 2;
        text.y = (size - text.height) / 2;
        if (flattenText) {
            var vector = figma.flatten([text], frame);
            vector.x = (size - vector.width) / 2;
            vector.y = (size - vector.height) / 2;
            vector.locked = true;
        }
    });
    setSpacerVisibility(frame, Boolean(figma.root.getPluginData(HideProperty)));
    return frame;
}
/**
 * ************************
 * 2- shape version and display state management
 * ************************
 */
function setSpacerVisibility(spacer, isHidden) {
    spacer.children.forEach(child => {
        child.visible = !isHidden;
    });
}
function setAllSpacersVisibility(isHidden) {
    var spacers = figma.root.findAll(node => node.type === "FRAME" && node.name.endsWith(SpacerName));
    spacers.forEach(spacer => setSpacerVisibility(spacer, isHidden));
}
function reshapeAllSpacers() {
    console.log("reshape all spacers");
    var spacers = figma.root.findAll(node => node.type === "FRAME" && node.name.endsWith(SpacerName));
    spacers.forEach(spacer => {
        let size = spacer.getPluginData(SizeProperty);
        shapeSpacerNode(spacer, Number(size));
    });
}
// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = msg => {
    //get properties from project
    if (msg.type === 'get-properties-in-page') {
        //get Spacers In Page Properties
        var spacers = figma.root.getPluginData(SpacersProperty);
        var hide = figma.root.getPluginData(HideProperty);
        figma.ui.postMessage({ type: "set-properties-from-page", spacers: spacers ? arrayFrom(spacers) : false, hide: Boolean(hide) });
        var knownVersion = figma.root.getPluginData(VersionProperty);
        if (knownVersion != VERSION) {
            console.log("Change in spacers versions :");
            console.log("Document = " + knownVersion);
            console.log("Plugin = " + VERSION);
            figma.root.setPluginData(VersionProperty, VERSION);
            //update all spacers with new version
            reshapeAllSpacers();
        }
    }
    ;
    //get properties from project
    if (msg.type === 'set-spacers-in-page') {
        figma.root.setPluginData(SpacersProperty, msg.spacers.toString());
    }
    ;
    if (msg.type === 'show-spacer-infos') {
        setAllSpacersVisibility(false);
        figma.root.setPluginData(HideProperty, "");
    }
    ;
    if (msg.type === 'hide-spacer-infos') {
        setAllSpacersVisibility(true);
        figma.root.setPluginData(HideProperty, "1");
    }
    ;
    /**
     * ***********************
     * 3- spacers positionning
     * ***********************
     */
    if (msg.type === 'place-spacer') {
        positionState = msg.position;
    }
    ;
    if (msg.type === 'add-spacer') {
        if (figma.currentPage.selection.length != 0) {
            let spacerFrame;
            //lazy creation of the spacer frame
            function getSpacer() {
                if (!spacerFrame) {
                    let spacer = figma.createFrame();
                    spacer.setPluginData(SizeProperty, String(msg.size));
                    let size = msg.size;
                    spacer.resize(size, size);
                    shapeSpacerNode(spacer, size);
                    spacer.layoutAlign = Alignement;
                    spacerFrame = spacer;
                }
                return spacerFrame;
            }
            let selection = figma.currentPage.selection;
            let parentFrame = selection[0].parent;
            if (parentFrame.type == "INSTANCE") {
                figma.notify("Spacers cannot be added to instances of components");
                return;
            }
            //check that the whole selection avec the parent
            let hasUniqueParent = true;
            selection.forEach(element => {
                hasUniqueParent = hasUniqueParent && (element.parent == parentFrame);
            });
            if (!hasUniqueParent) {
                figma.notify("Please select only elements having the same parent");
                return;
            }
            //add adequate autolayout around the selection if the parent is not autolayout
            //then add spacer in correct order
            function addSpacer(mode, order) {
                let boundaries = getMinAndMaxIndexesInParent(parentFrame.children, selection);
                if (!boundaries) {
                    figma.notify("Invalid selection…");
                    return;
                }
                if (parentFrame.layoutMode != mode) {
                    //CASE parent is not correct autolayout
                    if (selection.length == 1 && selection[0].type != "INSTANCE" && selection[0].layoutMode == mode) {
                        //CASE unique selection is correct autolayout then adds in selection
                        if (order == "AFTER")
                            selection[0].appendChild(getSpacer());
                        else
                            selection[0].insertChild(0, getSpacer());
                        return;
                    }
                    //CASE of additional autolayout necessary 
                    let newParent = createEmptyAutolayout(mode, (selection[0].parent.type === 'PAGE'));
                    const firstChildInSelection = parentFrame.children[boundaries.min];
                    newParent.x = firstChildInSelection.x;
                    newParent.y = firstChildInSelection.y;
                    if (selection.length == 1) {
                        newParent.appendChild(selection[0]);
                    }
                    else {
                        //encapsulate the multi selection in a internal frame
                        let innerParent = createEmptyAutolayout((mode == "VERTICAL") ? "HORIZONTAL" : "VERTICAL");
                        for (let i = boundaries.min; i <= boundaries.max; i++) {
                            //since we remove the previous child at each loop the index remains equal
                            innerParent.appendChild(parentFrame.children[boundaries.min]);
                        }
                        newParent.appendChild(innerParent);
                        figma.currentPage.selection = [innerParent];
                    }
                    if (order == "BEFORE")
                        newParent.insertChild(0, getSpacer());
                    else
                        newParent.appendChild(getSpacer());
                    parentFrame.insertChild(boundaries.min, newParent);
                    //console.log("05");
                }
                else {
                    //CASE parent is correct autolayout
                    let positionInFrame;
                    if (order == "AFTER")
                        positionInFrame = boundaries.max + 1;
                    else
                        positionInFrame = boundaries.min;
                    parentFrame.insertChild(positionInFrame, getSpacer());
                    //console.log("05 normal");
                }
            }
            //console.log("00");
            if (positionState === BOTTOM)
                addSpacer("VERTICAL", "AFTER");
            if (positionState === TOP)
                addSpacer("VERTICAL", "BEFORE");
            if (positionState === RIGHT)
                addSpacer("HORIZONTAL", "AFTER");
            if (positionState === LEFT)
                addSpacer("HORIZONTAL", "BEFORE");
            //console.log("10");
            if (positionState === REPLACE) {
                if (selection.length > 1) {
                    figma.notify("Please select only one spacer tp be replaced");
                    return;
                }
                if (!selection[0].name.endsWith(SpacerName)) {
                    figma.notify("Please select a spacer to be replaced");
                    return;
                }
                else {
                    if (parentFrame.layoutMode === "NONE") {
                        figma.notify("The spacer to be replaced must be inside an autolayout");
                        return;
                    }
                    else {
                        parentFrame.insertChild(parentFrame.children.indexOf(selection[0]) + 1, getSpacer());
                        selection[0].remove();
                    }
                }
            }
            //console.log("15");
            //trick to improve undo
            let oldSelect = figma.currentPage.selection[0];
            if (spacerFrame)
                figma.currentPage.selection = [spacerFrame];
            if (positionState != REPLACE)
                figma.currentPage.selection = [oldSelect];
        }
        else {
            figma.notify("Please select at least an element to add a spacer");
        }
    }
    /**
     *************************
     *  4- plugin additional functionalities
     * ***********************
     */
    if (msg.type === 'remove-lone-child-frame') {
        // clone the properties of the frame
        let selection = figma.currentPage.selection[0];
        if (!selection)
            return figma.notify("Please select a frame to remove inner frame child");
        if ((selection.type != "FRAME" && selection.type != "COMPONENT") || selection.children.length != 1)
            return figma.notify("Please select a frame or component with only 1 frame as child");
        let parentFrame = selection;
        if (parentFrame.children[0].type != "FRAME")
            return figma.notify("Please select a frame with only a frame as child");
        let child = parentFrame.children[0];
        cloneAutolayoutProperties(child, parentFrame);
        cloneBlendProperties(child, parentFrame);
        cloneCornerProperties(child, parentFrame);
        cloneGeometryProperties(child, parentFrame);
        child.children.forEach(element => {
            parentFrame.appendChild(element);
        });
        child.remove();
    }
    ;
};
/**
 * *************************
 * 5- Utils
 * *************************
 *
 */
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
function cloneAutolayoutProperties(source, destination) {
    destination.layoutMode = source.layoutMode;
    destination.counterAxisSizingMode = source.counterAxisSizingMode;
    destination.horizontalPadding = source.horizontalPadding;
    destination.verticalPadding = source.verticalPadding;
    destination.itemSpacing = source.itemSpacing;
}
function cloneGeometryProperties(source, destination) {
    destination.fills = clone(source.fills);
    destination.strokes = clone(source.strokes);
    destination.strokeWeight = source.strokeWeight;
    destination.strokeAlign = source.strokeAlign;
    destination.strokeCap = source.strokeCap;
    destination.strokeJoin = source.strokeJoin;
    destination.dashPattern = clone(source.dashPattern);
    destination.fillStyleId = source.fillStyleId;
    destination.strokeStyleId = source.strokeStyleId;
}
function cloneCornerProperties(source, destination) {
    destination.cornerRadius = source.cornerRadius;
    destination.cornerSmoothing = source.cornerSmoothing;
}
function cloneBlendProperties(source, destination) {
    destination.opacity = source.opacity;
    destination.blendMode = source.blendMode;
    destination.isMask = source.isMask;
    destination.effects = clone(source.effects);
    destination.effectStyleId = source.effectStyleId;
}
function createEmptyAutolayout(direction, defaultFill = false) {
    let frame = figma.createFrame();
    frame.layoutMode = direction;
    frame.counterAxisSizingMode = "AUTO";
    frame.itemSpacing = 0;
    frame.horizontalPadding = 0;
    frame.verticalPadding = 0;
    if (!defaultFill)
        frame.fills = [];
    return frame;
}
/**
 * extract the smallest and biggest index of component in array
 * @param parentArray
 * @param componentArray
 */
function getMinAndMaxIndexesInParent(parentArray, componentArray) {
    let minIndex = parentArray.length;
    let maxIndex = 0;
    componentArray.forEach(element => {
        let index = parentArray.indexOf(element);
        if (index != -1) {
            if (index < minIndex)
                minIndex = index;
            if (index > maxIndex)
                maxIndex = index;
        }
        //console.log("index="+index+" min="+minIndex+" max"+maxIndex);
    });
    if (minIndex > maxIndex)
        return null;
    return { 'min': minIndex, 'max': maxIndex };
}
