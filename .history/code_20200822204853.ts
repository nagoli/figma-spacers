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


// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser enviroment (see documentation).

// This shows the HTML page in "ui.html".
figma.showUI(__html__);
const baseHeight = 316;
const spacerHeight = 50;
const baseWidth = 128;
figma.ui.resize(baseWidth, baseHeight+3*spacerHeight);

// version must change if spacer shape changes
//version 1 = spacers as frames
//version 2 = spacers as components
const VERSION: string = '2.0';

//styles
const DefaultFgColor = { r: 0.8, g: 0, b: 1 } ;
const DefaultBgColor = { r: 0.98, g: 0.89, b: 1 } ;
const Alignement = "CENTER";


//property names
const ComponentIDPropertyPrefix = 'spacer-component-';
const ComponentUsageListProperty = 'spacer-component-list';
const SpacerListProperty = 'spacers';
const BgColorProperty = 'bg-color';
const FgColorProperty = 'fg-color';
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
 * create spacer component
 * @param size 
 */
function shapeSpacerComponent(component:ComponentNode,size:number){
  
  resetAllProperties(component);

  //customize
   var containerSize = size
   component.name = size + "px " + SpacerName;
   component.fills = [];
   component.opacity = 1;
 
   //CONTAINER 
 
   const shape: FrameNode = figma.createFrame();
   component.appendChild(shape);
   shape.name = ContainerName;
   shape.resize(containerSize, containerSize);
   shape.locked = true;
 
   //TEXT
   var text = figma.createText();
   component.appendChild(text);
   text.name = LabelName;
   figma.loadFontAsync({ family: "Roboto", style: "Regular" }).then(msg => {
     if (containerSize < 16) {
       text.fontSize = containerSize - Math.round(containerSize * 0.2);
     }
     else { text.fontSize = 14; }
     text.x = 0;
     text.y = 0;
     text.textAlignHorizontal = 'LEFT';
     text.textAlignVertical = 'TOP';
     text.characters = String(size);
     text.letterSpacing = { unit: "PERCENT", value: -5 };
     text.locked = true;
     text.x = (size - text.width) / 2;
     text.y = (size - text.height) / 2;
   });

   component.resize(size, size);
   component.setPluginData(SizeProperty,size.toString());

   setSpacerForeground(component, figma.root.getPluginData(FgColorProperty));
   setSpacerBackground(component, figma.root.getPluginData(BgColorProperty));  
   setSpacerVisibility(component,Boolean(figma.root.getPluginData(HideProperty)));
}

/**
 * get Sapcer component for this size.
 * return null if it does not exist
 * @param size 
 */
function getSpacerComponent(size:number):ComponentNode{
  var spacerID=figma.root.getPluginData(ComponentIDPropertyPrefix+size);
  if (spacerID) return figma.getNodeById(spacerID) as ComponentNode;
  return null;
}

/**
 * 
 * getSpacerInstance for this size
 * @param size 
 */
function getSpacerInstance(size:number):InstanceNode{
  var instance;
  var component = getSpacerComponent(size);
  if (!component){
    component =  figma.createComponent(); 
    shapeSpacerComponent(component,size);
    instance = component.createInstance();
    figma.root.setPluginData(ComponentIDPropertyPrefix+size, component.id);
    //update component usage list avoiding duplicated
    var usage:Set<number> = new Set(arrayOfNumberFrom(figma.root.getPluginData(ComponentUsageListProperty)));
    usage.add(size);
    figma.root.setPluginData(ComponentUsageListProperty, Array.from(usage).toString())
    //WARNING component must be removed after instance creation if not it desappears from page
    component.remove();    
  }
  else instance = component.createInstance();
  return instance;
}



/**
 * ************************
 * 2- shape version and display state management 
 * ************************
 */

 /**
  * return an array of all spacer component in used in doc
  */
function getSpacerComponentsInUse() : Array<ComponentNode>{
  var components:Array<ComponentNode>= [];
  var list = arrayOfNumberFrom(figma.root.getPluginData(ComponentUsageListProperty))
  //console.log(list);
  list.forEach(size => { components.push(getSpacerComponent(size))});
  return components;
}



/**
 * 
 * @param isHidden show or hide all spacers
 */
async function setAllSpacersVisibility(isHidden: boolean) {
  getSpacerComponentsInUse().forEach(spacer => setSpacerVisibility(spacer, isHidden));
}

/**
 * 
 * @param spacer show or hide any childre of spacer component
 * @param isHidden 
 */
function setSpacerVisibility(spacer: ComponentNode, isHidden: boolean) {
  if (spacer) spacer.children.forEach(child => {
    if (child.name=== ContainerName) {

    }
  });
}


/**
 * 
 * @param isHidden show or hide all spacers
 */
async function setAllSpacersForeground(hexColor: string) {
  getSpacerComponentsInUse().forEach(spacer => setSpacerForeground(spacer, hexColor));
}

/**
 * 
 * @param spacer show or hide any childre of spacer component
 * @param isHidden 
 */
function setSpacerForeground(spacer: ComponentNode, hexColor: string) {
  var rgb = hexToRgb(hexColor);
  if (!rgb) rgb = DefaultFgColor; 
  if (spacer) spacer.children.forEach(child => {
      if (child.name===LabelName ){
        (child as TextNode).fills = [{ type: 'SOLID', color: rgb }];
      }
  });
}

/**
 * 
 * @param isHidden show or hide all spacers
 */
async function setAllSpacersBackground(hexColor: string) {
  getSpacerComponentsInUse().forEach(spacer => setSpacerBackground(spacer, hexColor));
}

/**
 * 
 * @param spacer show or hide any childre of spacer component
 * @param isHidden 
 */
function setSpacerBackground(spacer: ComponentNode, hexColor: string) {
  var rgb = hexToRgb(hexColor);
  if (!rgb) rgb = DefaultBgColor; 
  if (spacer) spacer.children.forEach(child => {
      if (child.name===ContainerName ){
        (child as FrameNode).fills = [{ type: 'SOLID', color: rgb }];
      }
  });
}






/**************** OLD way to set visibility*/
function OLDsetSpacerVisibility(spacer: FrameNode, isHidden: boolean) {
  if (spacer) spacer.children.forEach(child => {
    child.visible = !isHidden;
  });
}
function OLDsetSpacersVisibilityInPage(page: PageNode, isHidden : boolean){
  var spacers = page.findAll(node => node.type === "FRAME" && node.name.endsWith(SpacerName));
  (<FrameNode[]>spacers).forEach(spacer => OLDsetSpacerVisibility(spacer, isHidden));
}
async function OLDsetAllSpacersVisibility(isHidden: boolean) {
  let active:PageNode = figma.currentPage;
  OLDsetSpacersVisibilityInPage(active,isHidden);
  figma.root.children.forEach(element => {
    if (element != active) OLDsetSpacersVisibilityInPage(element,isHidden);
  });
}
/**************** */


/**
 * reset all existing spacers as Frame by creating new components and 
 */
function resetAllSpacers() {
  console.log("reshape all spacers");
  
  //replace component based spacers
  var componentSpacers = figma.root.findAll(node => node.type === "COMPONENT" && node.name.endsWith(SpacerName));
  var componentCount=0;
  (<ComponentNode[]>componentSpacers).forEach(spacer => {
    try{
      let size = Number(spacer.name.substr(0, spacer.name.indexOf('p'))) ;
        if (size == 0) {
          console.log('warning spacer with 0 size – id ='+spacer.id ); 
        } else {
          shapeSpacerComponent(spacer,size);
          componentCount++;
        } 
    }catch(err){console.log(err);}
  });
  console.log(componentCount + " spacers based on component were updated");

  //put old Frame based spacers in Instance to OFF (to avoid keeping spacers from library still visibles )
  var inInstanceSpacers = figma.root.findAll(node => node.type === "FRAME" && node.name.endsWith(SpacerName) && isInInstance(node));
  var inInstanceCount = 0;
  (<FrameNode[]>inInstanceSpacers).forEach(spacer => {
    try{
      if (spacer) spacer.children.forEach(child => {
        child.visible = false;
      });
      inInstanceCount++;
    }catch(err){console.log(err);}
  });
  console.log(inInstanceCount + " spacers based on frame and in Instances were hidden");

  //replace old Frame based spacers
  var notInInstanceSpacers = figma.root.findAll(node => node.type === "FRAME" && node.name.endsWith(SpacerName) && !isInInstance(node));
  var notInInstanceCount = 0;
  (<FrameNode[]>notInInstanceSpacers).forEach(spacer => {
    try{
      let size = Number(spacer.name.substr(0, spacer.name.indexOf('p'))) ;
        if (size == 0) {
          console.log('warning spacer with 0 size – id ='+spacer.id ); 
        } else {
          let parentFrame = spacer.parent;
          const newSpacer = getSpacerInstance(size);
          parentFrame.insertChild(parentFrame.children.indexOf(spacer) + 1, newSpacer);
          newSpacer.layoutAlign=spacer.layoutAlign;
          spacer.remove();
          notInInstanceCount++;
        } 
    }catch(err){console.log(err);}
  });
  console.log(notInInstanceCount + " spacers based on frame and not in Instances were updated");
  var total = componentCount + inInstanceCount + notInInstanceCount;

  if (total) figma.notify("Major plugin update : " + total + " spacers were updated.", {timeout:7000});
  figma.notify("Major plugin update : open spacer plugin in your shared libraries to update them", {timeout:15000});
}


// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = msg => {

  //get properties from project
  if (msg.type === 'get-properties-in-project') {
    //get Spacers In Page Properties
    var spacers = figma.root.getPluginData(SpacerListProperty);
    var hide = figma.root.getPluginData(HideProperty);
    var fgColor = figma.root.getPluginData(FgColorProperty);
    var bgColor = figma.root.getPluginData(BgColorProperty);
    figma.ui.postMessage({
      type: "set-properties-from-project",
      spacers: spacers ? arrayOfNumberFrom(spacers) : false,
      bgColor: bgColor,
      fgColor: fgColor,
      hide: Boolean(hide),
    });
    var knownVersion = figma.root.getPluginData(VersionProperty);
    if (knownVersion != VERSION) {
      console.log("Change in spacers versions :");
      console.log("Document = " + knownVersion);
      console.log("Plugin = " + VERSION);
      figma.root.setPluginData(VersionProperty, VERSION);
      //update all spacers with new version
      resetAllSpacers();
    }
    //console.log("Spacers init ok");
  };

  //set spacers properties in project
  if (msg.type === 'spacers') {
    const spacerList = msg.value.toString();
    figma.root.setPluginData(SpacerListProperty, spacerList);
    const spacersPairs = Math.ceil(arrayOfNumberFrom(spacerList).length/2);
    figma.ui.resize(baseWidth, baseHeight+spacersPairs*spacerHeight);
  };
  
    //set fg color properties in project
    if (msg.type === 'bg-color') {
      figma.root.setPluginData(BgColorProperty, msg.value.toString());

    };

  //set fg color properties in project
  if (msg.type === 'fg-color') {
    figma.root.setPluginData(FgColorProperty, msg.value.toString());
  };

  if (msg.type === 'show-spacer-infos') {
    // try to improve perf but the async does not seem to work...
   setAllSpacersVisibility(false).then(function (){
      figma.root.setPluginData(HideProperty, ""); 
    });
  };

  if (msg.type === 'hide-spacer-infos') {
    setAllSpacersVisibility(true).then(function (){
      figma.root.setPluginData(HideProperty, "1");
   });
  };



  /**
   * ***********************
   * 3- spacers positionning
   * ***********************
   */

  if (msg.type === 'place-spacer') {
    positionState = msg.position;
  };

  if (msg.type === 'add-spacer') {
    if (figma.currentPage.selection.length != 0) {
      let spacerFrame: InstanceNode;
      //lazy creation of the spacer frame
      function getSpacer(): InstanceNode {
        if (!spacerFrame) {
          let size = msg.size;
          spacerFrame=getSpacerInstance(msg.size)
          spacerFrame.layoutAlign = Alignement;
        }
        return spacerFrame;
      }

      let selection = figma.currentPage.selection;

      if (isInInstance(selection[0])) {
        figma.notify("Spacers cannot be added to instances of components");
        return;
      }

      let parentFrame = selection[0].parent as DefaultFrameMixin;


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
      function addSpacer(mode: "VERTICAL" | "HORIZONTAL", order: "BEFORE" | "AFTER") {
        let boundaries = getMinAndMaxIndexesInParent(parentFrame.children, selection);
        if (!boundaries) {
          figma.notify("Invalid selection…");
          return;
        }

        if (parentFrame.layoutMode != mode) {
          //CASE parent is not correct autolayout
          if (selection.length == 1 && selection[0].type != "INSTANCE" && (selection[0] as DefaultFrameMixin).layoutMode == mode) {
            //CASE unique selection is correct autolayout then adds in selection
            if (order == "AFTER") (selection[0] as DefaultFrameMixin).appendChild(getSpacer());
            else (selection[0] as DefaultFrameMixin).insertChild(0, getSpacer());
            return;
          }
          //CASE of additional autolayout necessary 
          let newParent: FrameNode  = createEmptyAutolayout(mode, (selection[0].parent.type==='PAGE'));
          const firstChildInSelection = parentFrame.children[boundaries.min];
          newParent.x = firstChildInSelection.x;
          newParent.y = firstChildInSelection.y;
          if (selection.length == 1) {
            newParent.appendChild(selection[0]);
          }
          else {
            //encapsulate the multi selection in a internal frame
            let innerParent: FrameNode = createEmptyAutolayout((mode == "VERTICAL") ? "HORIZONTAL" : "VERTICAL");
            for (let i = boundaries.min; i <= boundaries.max; i++) {
              //since we remove the previous child at each loop the index remains equal
              innerParent.appendChild(parentFrame.children[boundaries.min]);
            }
            newParent.appendChild(innerParent);
            figma.currentPage.selection = [innerParent];
          }
          if (order == "BEFORE")
            newParent.insertChild(0, getSpacer());
          else newParent.appendChild(getSpacer());
          parentFrame.insertChild(boundaries.min, newParent);
          //console.log("05");

        } else {
          //CASE parent is correct autolayout
          let positionInFrame;
          if (order == "AFTER") positionInFrame = boundaries.max + 1;
          else positionInFrame = boundaries.min;
          parentFrame.insertChild(positionInFrame, getSpacer());
          //console.log("05 normal");
        }
      }

      //console.log("00");
      if (positionState === BOTTOM) addSpacer("VERTICAL", "AFTER");
      if (positionState === TOP) addSpacer("VERTICAL", "BEFORE");
      if (positionState === RIGHT) addSpacer("HORIZONTAL", "AFTER");
      if (positionState === LEFT) addSpacer("HORIZONTAL", "BEFORE");
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
          } else {
            parentFrame.insertChild(parentFrame.children.indexOf(selection[0]) + 1, getSpacer());
            selection[0].remove();
          }
        }
      }
      //console.log("15");

      //trick to improve undo
      let oldSelect = figma.currentPage.selection[0];
      if (spacerFrame) figma.currentPage.selection = [spacerFrame];
      if (positionState != REPLACE)
        figma.currentPage.selection = [oldSelect];
    } else {
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
    let parentFrame: DefaultFrameMixin = selection;
    if (parentFrame.children[0].type != "FRAME")
      return figma.notify("Please select a frame with only a frame as child");

    let child: DefaultFrameMixin = parentFrame.children[0];
    cloneAutolayoutProperties(child, parentFrame);
    cloneBlendProperties(child, parentFrame);
    cloneCornerProperties(child, parentFrame);
    cloneGeometryProperties(child, parentFrame);
    child.children.forEach(element => {
      parentFrame.appendChild(element);
    });
    child.remove();
  };




};



/**
 * *************************
 * 5- Utils
 * *************************
 * 
 */


/**
 * return an array of number from a string containing numbers separated by ','
 * @param str 
 */
function arrayOfNumberFrom(str: string) : Array<number>{
  if (!str) return [];
  return str.split(',').map(Number);
}


function clone(val) {
  const type = typeof val
  if (val === null) {
    return null
  } else if (type === 'undefined' || type === 'number' ||
    type === 'string' || type === 'boolean') {
    return val
  } else if (type === 'object') {
    if (val instanceof Array) {
      return val.map(x => clone(x))
    } else if (val instanceof Uint8Array) {
      return new Uint8Array(val)
    } else {
      let o = {}
      for (const key in val) {
        o[key] = clone(val[key])
      }
      return o
    }
  }
  throw 'unknown'
};

/**
 * remove all style properties of a frame
 * @param frame 
 */
function resetAllProperties(frame : DefaultFrameMixin){
  frame.layoutMode="NONE";
  frame.fills = [];
  frame.strokes = [];
  frame.fillStyleId = '';
  frame.strokeStyleId = '';
  frame.cornerRadius = 0;
  frame.opacity = 1;
  frame.blendMode = "NORMAL";
  frame.isMask = false;
  frame.effects = [];
  frame.effectStyleId = '';
}


function cloneAutolayoutProperties(source: DefaultFrameMixin, destination: DefaultFrameMixin) {
  destination.layoutMode = source.layoutMode;
  destination.counterAxisSizingMode = source.counterAxisSizingMode;
  destination.horizontalPadding = source.horizontalPadding;
  destination.verticalPadding = source.verticalPadding;
  destination.itemSpacing = source.itemSpacing;
}

function cloneGeometryProperties(source: DefaultFrameMixin, destination: DefaultFrameMixin) {
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

function cloneCornerProperties(source: DefaultFrameMixin, destination: DefaultFrameMixin) {
  destination.cornerRadius = source.cornerRadius;
  destination.cornerSmoothing = source.cornerSmoothing;
}

function cloneBlendProperties(source: DefaultFrameMixin, destination: DefaultFrameMixin) {
  destination.opacity = source.opacity;
  destination.blendMode = source.blendMode;
  destination.isMask = source.isMask;
  destination.effects = clone(source.effects);
  destination.effectStyleId = source.effectStyleId;
}


function createEmptyAutolayout(direction: "HORIZONTAL" | "VERTICAL", defaultFill=false): FrameNode {
  let frame: FrameNode = figma.createFrame();
  frame.layoutMode = direction;
  frame.counterAxisSizingMode = "AUTO";
  frame.itemSpacing = 0;
  frame.horizontalPadding = 0;
  frame.verticalPadding = 0;
  frame.clipsContent=false;
  if (!defaultFill) frame.fills=[];
  return frame;
}


/**
 * extract the smallest and biggest index of component in array
 * @param parentArray 
 * @param componentArray 
 */
function getMinAndMaxIndexesInParent(parentArray, componentArray): { 'min': number, 'max': number } {
  let minIndex = parentArray.length;
  let maxIndex = 0;
  componentArray.forEach(element => {
    let index = parentArray.indexOf(element);
    if (index != -1) {
      if (index < minIndex) minIndex = index;
      if (index > maxIndex) maxIndex = index;
    }
    //console.log("index="+index+" min="+minIndex+" max"+maxIndex);
  });
  if (minIndex > maxIndex) return null;
  return { 'min': minIndex, 'max': maxIndex };
}

/**
 * return true if the node is inside an Instance
 */
function isInInstance(node : SceneNode | BaseNode ) : boolean {
  let type = node.parent.type
  if ( type === "INSTANCE") return true;
  if (type === "PAGE") return false;
  return isInInstance(node.parent);
}

/**
 * transfom hex to rgb
 */
function hexToRgb(hex : string) : RGB {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function(m, r, g, b) {
    return r + r + g + g + b + b;
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}