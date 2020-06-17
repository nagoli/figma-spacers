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
figma.ui.resize(128,408);

const VERSION = 1.1;


const LabelStyle = {type: 'SOLID', color: {r: 0.8, g: 0, b: 1}};
const ContainerStyle = {type: 'SOLID', color: {r: 0.98, g: 0.89, b: 1}};

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


const LEFT ='LEFT';
const RIGHT = 'RIGHT';
const BOTTOM = 'BOTTOM';
const TOP = 'TOP';
const REPLACE = 'REPLACE';
var positionVar = BOTTOM;



/**
 * ******************
 * 1- the shape/ creation of the spacers
 * ******************
 */

function makeSpacerNode(size : number) : FrameNode{ //, label : string){
  //customize
  const diamondShape = false;
  const withCorner = false;

  var containerSize = size
  if (diamondShape) containerSize = Math.round(Math.sqrt(size*size/2));

  const frame: FrameNode = figma.createFrame();
 

  var text = figma.createText();
  text.name=LabelName;
  
  figma.loadFontAsync({ family: "Roboto", style: "Regular" }).then(msg => {
    if (containerSize < 16){
    text.fontSize=containerSize-Math.round(containerSize*0.2); }
    else {text.fontSize=14;}
    text.x=0;
    text.y=0;
    text.textAlignHorizontal = 'LEFT';
    text.textAlignVertical = 'TOP';
    text.characters=String(size);
    text.fills = [clone(LabelStyle)];
    text.letterSpacing = {unit:"PERCENT", value:-5 };
    var vector = figma.flatten([text], frame);
    vector.x=(size-vector.width)/2;
    vector.y=(size-vector.height)/2;
    vector.locked=true;
  });
    
  

  const container: FrameNode = figma.createFrame();
  container.name = ContainerName;
  container.resize(containerSize,containerSize);
  container.fills=[clone(ContainerStyle)];
  container.layoutAlign='MIN';

  if (withCorner){

    function styleLine(line : LineNode, size : number){
      line.strokes=[clone(LabelStyle)];
      line.resize(size,0);
      line.locked=true;
      line.x=0;
      line.y=0;
    }

    const linesize = Math.round(size/5);

    //up left corner 
    const hline1 = figma.createLine();
    hline1.name=HLineName+1;
    styleLine(hline1,linesize);
    hline1.y=1;
    const vline1 = figma.createLine();
    vline1.name=VLineName+1;
    styleLine(vline1,linesize);
    vline1.rotation=-90;

    //up right corner
    const hline2 = figma.createLine();
    hline2.name=HLineName+2;
    styleLine(hline2,linesize);
    hline2.x=containerSize-linesize;
    hline2.y=1;
    const vline2 = figma.createLine();
    vline2.name=VLineName+2;
    styleLine(vline2,linesize);
    vline2.x=containerSize-1;
    vline2.rotation=-90;


    //down left corner
    const hline3 = figma.createLine();
    hline3.name=HLineName+3;
    styleLine(hline3,linesize);
    hline3.y=containerSize;
    const vline3 = figma.createLine();
    vline3.name=VLineName+3;
    styleLine(vline3,linesize);
    vline3.y=containerSize-linesize;
    vline3.rotation=-90;

    //down right corner
    const hline4 = figma.createLine();
    hline4.name=HLineName+4;
    styleLine(hline4,linesize);
    hline4.x=containerSize-linesize;
    hline4.y=containerSize;
    const vline4 = figma.createLine();
    vline4.name=VLineName+4;
    styleLine(vline4,linesize);
    vline4.x=containerSize-1;
    vline4.y=containerSize-linesize;
    vline4.rotation=-90;

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
    container.rotation=-45;
    container.x= size/2
  }
  container.locked=true;
  
  //store the property in spacer frame 
  frame.setPluginData(SizeProperty, String(size));
  frame.name=size+"px "+SpacerName;
  frame.resize(size,size);
  frame.layoutAlign='MIN';
  frame.appendChild(text);
  frame.appendChild(container);
  frame.fills=[];
  frame.opacity=0.8;
  setSpacerVisibility(frame, Boolean(figma.root.getPluginData(HideProperty)));
  return frame;
}


/**
 * ************************
 * 2- shape version and display state management 
 * ************************
 */


function setSpacerVisibility(spacer:FrameNode, isHidden : boolean){
  spacer.children.forEach(child => {
    child.visible=!isHidden;
  });
  //TODO recreate spacer if not on right version
  //if (isShow) spacer.fills=[clone(FrameStyle)]; else spacer.fills=[];
  
  //update size in case it was manually changed
  //let size = spacer.getPluginData(SizeProperty);
  //if (size) spacer.resize(spacer.width,Number(size));
}



function setAllSpacersVisibility(isHidden){
  var spacers = figma.root.findAll(node => node.type === "FRAME" && node.name.endsWith(SpacerName));
  (<FrameNode[]>spacers).forEach(spacer => setSpacerVisibility(spacer, isHidden));
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
    figma.ui.postMessage({type: "set-properties-from-page", spacers : spacers?arrayFrom(spacers):false, hide : Boolean(hide) });
  };
   
  //get properties from project
  if (msg.type === 'set-spacers-in-page') {    
    figma.root.setPluginData(SpacersProperty, msg.spacers.toString());
  };

  if (msg.type === 'show-spacer-infos') {
    setAllSpacersVisibility(false);
    figma.root.setPluginData(HideProperty, "");
  };

  if (msg.type === 'hide-spacer-infos') {
    setAllSpacersVisibility(true);
    figma.root.setPluginData(HideProperty, "1");
  };

 

  /**
   * ***********************
   * 3- spacers positionning
   * ***********************
   */

  if (msg.type === 'place-spacer') {
    positionVar= msg.position;
  };

  if (msg.type === 'add-spacer'){
    if (figma.currentPage.selection.length!=0){
      let spacer:FrameNode = makeSpacerNode(msg.size);
      let selection = figma.currentPage.selection[0];

      // add as first child if selection is an empty autolayout
      if (selection.type === "FRAME" && selection.children.length===0  ){
       
        //if not autolyout the frame is set autolayer according to the spacer direction
        if (selection.layoutMode==="NONE") {
          console.log("set autolayout mode to empty frame");
          if (positionVar === BOTTOM || positionVar===TOP )
            selection.layoutMode="VERTICAL";
          else selection.layoutMode="HORIZONTAL";
          selection.counterAxisSizingMode="FIXED";
          selection.itemSpacing = 0;
          selection.horizontalPadding=0;
          selection.verticalPadding=0;
        }

        selection.insertChild(0,spacer);
      }

      else{
        let positionInFrame = selection.parent.children.indexOf(selection);
        if (positionVar===BOTTOM){
          let parentFrame = selection.parent;
          //position at bottom if not a autolayout
          if (parentFrame.type != "FRAME" || parentFrame.layoutMode==="NONE"){
            //console.log("positionning : "+ selection.x + " "+ selection.y); 
            parentFrame.insertChild(positionInFrame+1,spacer);
            spacer.x = selection.x;
            spacer.y = selection.y+selection.height;
          } else{
            //create a new vertical autolayout if parent is horizontal
            if (parentFrame.layoutMode==="HORIZONTAL"){
              let newFrame =  figma.createFrame();
              newFrame.layoutMode = "VERTICAL";
              newFrame.counterAxisSizingMode="AUTO";
              newFrame.itemSpacing = 0;
              newFrame.horizontalPadding=0;
              newFrame.verticalPadding=0;
              parentFrame.insertChild(positionInFrame+1,newFrame);
              newFrame.insertChild(0,spacer);
            } else {
              parentFrame.insertChild(positionInFrame+1,spacer);
            }
          } 
        } 

        if (positionVar===TOP){
          let parentFrame = selection.parent;
          //position at top if not a autolayout
          if (parentFrame.type != "FRAME" || parentFrame.layoutMode==="NONE"){
            //console.log("positionning : "+ selection.x + " "+ selection.y); 
            parentFrame.insertChild(positionInFrame,spacer);
            spacer.x = selection.x;
            spacer.y = selection.y-selection.height-spacer.height;
          } else{
            //create a new vertical autolayout if parent is horizontal
            if (parentFrame.layoutMode==="HORIZONTAL"){
              let newFrame =  figma.createFrame();
              newFrame.layoutMode = "VERTICAL";
              newFrame.counterAxisSizingMode="AUTO";
              newFrame.itemSpacing = 0;
              newFrame.horizontalPadding=0;
              newFrame.verticalPadding=0;
              parentFrame.insertChild(positionInFrame,newFrame);
              newFrame.insertChild(0,spacer);
            } else {
              parentFrame.insertChild(positionInFrame,spacer);
            }
          } 
        }

        if (positionVar===RIGHT){
          let parentFrame = selection.parent;
          //position at bottom if not a autolayout
          if (parentFrame.type != "FRAME" || parentFrame.layoutMode==="NONE"){
            //console.log("positionning : "+ selection.x + " "+ selection.y); 
            parentFrame.insertChild(positionInFrame+1,spacer);
            spacer.x = selection.x+selection.height;
            spacer.y = selection.y;
          } else{
            //create a new vertical autolayout if parent is horizontal
            if (parentFrame.layoutMode==="VERTICAL"){
              let newFrame =  figma.createFrame();
              newFrame.layoutMode = "HORIZONTAL";
              newFrame.counterAxisSizingMode="AUTO";
              newFrame.itemSpacing = 0;
              newFrame.horizontalPadding=0;
              newFrame.verticalPadding=0;
              parentFrame.insertChild(positionInFrame+1,newFrame);
              newFrame.insertChild(0,spacer);
            } else {
              parentFrame.insertChild(positionInFrame+1,spacer);
            }
          } 
        }

        if (positionVar===LEFT){
          let parentFrame = selection.parent;
          //position at top if not a autolayout
          if (parentFrame.type != "FRAME" || parentFrame.layoutMode==="NONE"){
            //console.log("positionning : "+ selection.x + " "+ selection.y); 
            parentFrame.insertChild(positionInFrame,spacer);
            spacer.x = selection.x-selection.width-spacer.width;
            spacer.y = selection.y;
          } else{
            //create a new vertical autolayout if parent is horizontal
            if (parentFrame.layoutMode==="VERTICAL"){
              let newFrame =  figma.createFrame();
              newFrame.layoutMode = "HORIZONTAL";
              newFrame.counterAxisSizingMode="AUTO";
              newFrame.itemSpacing = 0;
              newFrame.horizontalPadding=0;
              newFrame.verticalPadding=0;
              parentFrame.insertChild(positionInFrame,newFrame);
              newFrame.insertChild(0,spacer);
            } else {
              parentFrame.insertChild(positionInFrame,spacer);
            }
          } 
        }
        

        if (positionVar===REPLACE){
          let parentFrame = selection.parent;
          //position at bottom if not a autolayout
          if (parentFrame.type != "FRAME" || parentFrame.layoutMode==="NONE"){
            //console.log("positionning : "+ selection.x + " "+ selection.y); 
            parentFrame.insertChild(positionInFrame+1,spacer);
            spacer.x = selection.x;
            spacer.y = selection.y;
          } else{
            parentFrame.insertChild(positionInFrame+1,spacer);
          } 
          selection.remove();
        }


        //trick to improve undo
        if (positionVar!=REPLACE)
          figma.currentPage.selection=[figma.currentPage.selection[0]];
        //console.log(figma.currentPage.selection[0]);
        figma.currentPage.selection=[spacer];
        
        //TODO make spacer not expanded in layer panel
      }
    } else  figma.notify("Please select an element to add a spacer after");
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
    if ((selection.type != "FRAME" && selection.type != "COMPONENT") || selection.children.length!=1 ) 
      return figma.notify("Please select a frame or component with only 1 frame as child");
    let parentFrame : DefaultFrameMixin = selection;    
    if (parentFrame.children[0].type != "FRAME" ) 
       return figma.notify("Please select a frame with only a frame as child");
    
    let child : DefaultFrameMixin = parentFrame.children[0];
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

function arrayFrom(str : string){
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

function cloneAutolayoutProperties(source: DefaultFrameMixin , destination: DefaultFrameMixin){
    destination.layoutMode=source.layoutMode;
    destination.counterAxisSizingMode=source.counterAxisSizingMode;
    destination.horizontalPadding = source.horizontalPadding;
    destination.verticalPadding = source.verticalPadding;
    destination.itemSpacing = source.itemSpacing;
}

function cloneGeometryProperties(source: DefaultFrameMixin , destination: DefaultFrameMixin){
  destination.fills=clone(source.fills);
  destination.strokes=clone(source.strokes);
  destination.strokeWeight=source.strokeWeight;
  destination.strokeAlign = source.strokeAlign;
  destination.strokeCap = source.strokeCap;
  destination.strokeJoin = source.strokeJoin;
  destination.dashPattern = clone(source.dashPattern);
  destination.fillStyleId = source.fillStyleId;
  destination.strokeStyleId= source.strokeStyleId;
}

function cloneCornerProperties(source: DefaultFrameMixin , destination: DefaultFrameMixin){
  destination.cornerRadius=source.cornerRadius;
  destination.cornerSmoothing=source.cornerSmoothing;
}

function cloneBlendProperties(source: DefaultFrameMixin , destination: DefaultFrameMixin){
  destination.opacity=source.opacity;
  destination.blendMode=source.blendMode;
  destination.isMask=source.isMask;
  destination.effects=clone(source.effects);
  destination.effectStyleId = source.effectStyleId;
}