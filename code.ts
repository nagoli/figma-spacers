// This plugin will open a modal to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser enviroment (see documentation).

// This shows the HTML page in "ui.html".
figma.showUI(__html__);

const LabelStyle = {type: 'SOLID', color: {r: 0.8, g: 0, b: 1}};
const FrameStyle = {type: 'SOLID', color: {r: 0.98, g: 0.89, b: 1}};
const FontSize = 8;
const FrameWidth = 40;

//names of the layers considered as spacers
const SpacerName = "spacer_";
const LabelName = 'label_';
const ArrowName = 'arrow_';

const SizeProperty = 'size';
// this state is stored in the page to know if showing or not the infos in a new spacer
const SpacerInfoState = 'spacer-info-state';

function makeSpacerNode(size : number){ //, label : string){
  
  const text = figma.createText();
  text.name=LabelName;
  text.locked=true;
  figma.loadFontAsync({ family: "Roboto", style: "Regular" }).then(msg => {
    text.fontSize=FontSize; 
    text.characters=size+"px";;
    text.fills = [clone(LabelStyle)];
    text.textAlignHorizontal = 'CENTER'
    text.textAlignVertical = 'BOTTOM'
    text.x=12;
    if (size>FontSize) text.y=(size-FontSize)/2;
  });
  
  const line = figma.createLine();
  line.name=ArrowName;
  line.strokes=[clone(LabelStyle)];
  line.resize(size,0);
  line.rotation=-90;
  line.strokeCap="ARROW_LINES";
  line.locked=true;
  line.x=4;

  const frame = figma.createFrame();
  frame.setPluginData(SizeProperty, String(size));
  frame.name=size+"px "+SpacerName;
  frame.resize(FrameWidth,size);
  frame.fills=[clone(FrameStyle)];
  frame.layoutAlign='MAX';
  frame.appendChild(text);
  frame.appendChild(line);

  let showInfo=true;
  showSpacerInfos(frame, figma.currentPage.getPluginData(SpacerInfoState)!="0");
  return frame;
}

function showSpacerInfos(spacer:FrameNode, isShow : boolean){
  spacer.children.forEach(child => {
    if (child.name===ArrowName || child.name===LabelName) 
    child.visible=isShow;
  });
  if (isShow) spacer.fills=[clone(FrameStyle)]; else spacer.fills=[];
  //update size in case it was manually changed
  //let size = spacer.getPluginData(SizeProperty);
  //if (size) spacer.resize(spacer.width,Number(size));
}



function showAllSpacerInfos(isShow){
  figma.currentPage.setPluginData(SpacerInfoState, isShow? "1":"0");
  var spacers = figma.currentPage.findAll(node => node.type === "FRAME" && node.name.endsWith(SpacerName));
  (<FrameNode[]>spacers).forEach(spacer => showSpacerInfos(spacer, isShow));
}


// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = msg => {
  // One way of distinguishing between different types of messages sent from
  // your HTML page is to use an object with a "type" property like this.
  if (msg.type === 'show-spacer-infos') {
    showAllSpacerInfos(true);
  };

  if (msg.type === 'hide-spacer-infos') {
    showAllSpacerInfos(false);
  };

  if (msg.type === 'add-spacer'){
    let spacer = makeSpacerNode(msg.size);
    if (figma.currentPage.selection.length!=0){
      let selection = figma.currentPage.selection[0];
      let position = selection.parent.children.indexOf(selection);
      selection.parent.insertChild(position+1,spacer);
    } else  figma.currentPage.appendChild(spacer);
  }
};



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