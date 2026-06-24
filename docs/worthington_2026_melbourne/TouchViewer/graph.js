var GraphJs = true; // so that loader.js can tell if loaded
    
// Initialise Striking Graph
var ns = "http://www.w3.org/2000/svg";
var nBlows = tiActByRb.length;
var nRows  = nBlows/nBells;
var tiActByRp = tiActByRb.slice(0,nBlows);  // copy array
tiActByRp.sort(function(a, b){return a-b}); //////Note this is not right as does not preserve rows

// Striking Graph geometry
var el = document.getElementsByTagName('svg')[0]; // handle to the svg
var sFontSize = window.getComputedStyle(el, null).getPropertyValue('font-size');
var pxFontSize = parseFloat(sFontSize);
var pxPerRow         = pxFontSize * 1.9;  // vertical spacing
var pxGraphPadTop    = pxFontSize * 2;    // white space above first row
var pxGraphPadBottom = pxFontSize * 1;    // white space below last row
var pxPerIBG         = pxFontSize * (15/nBells+1);  // IBG to x increment (bigger for smaller number of bells)
var pxRnOffset       = pxFontSize * 1;                              // Row number
var pxRnWidth        = pxFontSize * 4;
var pxPnOffset       = pxFontSize * 3.3;                            // Placenotation
var pxPnWidth        = pxFontSize * 1.5;
var pxGraphOffset    = pxPnOffset + pxPnWidth + pxFontSize;       // Graph
var pxGraphWidth     = (nBells+1)*pxPerIBG;
var pxGraphCentreX   = pxGraphOffset + pxGraphWidth/2;
var pxAnnoOffset     = pxGraphOffset + pxGraphWidth + pxFontSize; // Annotations row details
var pxAnnoWidth      = pxFontSize * 8;
var pxSvgWidth       = pxAnnoOffset + pxAnnoWidth + pxFontSize ;
var pxSvgHeight      = pxGraphPadTop + pxPerRow*(nRows-1) + pxGraphPadBottom;
var pxLineOffsetX    = pxFontSize * .3;   // Position bluelines over bell numbers
var pxLineOffsetY    = pxFontSize * .3;   // Position bluelines over bell numbers
var pxRectOffsetY    = pxFontSize * .55;   // Position shade over bell numbers
var pxPerMs          = pxPerIBG/((tiActByRb[nBlows-1]- tiActByRb[0])/(nBlows-1+nRows/2));

mysvg.setAttributeNS(null,"height",pxSvgHeight.toString()+"px");
mysvg.setAttributeNS(null,"width",pxSvgWidth.toString()+"px");
mysvg.style.cursor = "default";
var iMsAddToAudioTimes = parseInt(sMsAddToAudioTimes); // This needs to be subtracted from times in the matrices to obtain times in the audio if present


function paintStriking(){ //
  if (ssxState.modelNew == modelCurrent && ssxState.bnNew == bnCurrent && JSON.stringify(ssxState.rangeNew) == JSON.stringify(rangeCurrent) && !isFirstTime){
      return;
  }
  rnRange = [ssxState.rangeNew.rows[0], ssxState.rangeNew.rows[1]]
  for (var rn = 0; rn < nRows; rn++) {  
    var rowInRange = rn >= rnRange[0] && rn <= rnRange[1];
    // Coloured rectangles in main grid
    for (var bn = 0; bn < nBells; bn++) {
      var i = bn + rn * nBells; //index into data tiRowByModelRn
      var idRect = "rn"+rn+"bn"+(bn+1)+"rect";
      var myRect = document.getElementById(idRect);
      if (myRect == null){
        myRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        myRect.setAttributeNS(null,"id",idRect);
        myRect.setAttributeNS(null,"stroke","none");
        myRect.setAttributeNS(null,"opacity","1");
        myRect.setAttributeNS(null,"class","rowshade");
        mysvg.appendChild(myRect);
      }
      var tiRowMid     = tiRowByModelRn[ssxState.modelNew][rn]+ ttIbgByModelRn[ssxState.modelNew][rn]*nBells/2;
      var pxBnActX     = pxGraphCentreX + pxPerMs*(tiActByRb[i] - tiRowMid);
      var pxBnIdealX   = pxGraphCentreX + pxPerMs*(tiIdealByModelRb[ssxState.modelNew][i] - tiRowMid);
      var ttBlowError  = tiActByRb[i] - tiIdealByModelRb[ssxState.modelNew][i];
      var pxRectWidth  = pxPerMs*ttIbgByModelRn[ssxState.modelNew][rn]-1;
      var pxRectLeft   = pxBnIdealX - pxRectWidth/2+4;
      var pxRectTop    = pxGraphPadTop + pxPerRow*(rn-1) + pxRectOffsetY+.5;
      var pxRectHeight = pxPerRow -1;
      myRect.setAttributeNS(null,"x",pxRectLeft);
      myRect.setAttributeNS(null,"y",pxRectTop);
      myRect.setAttributeNS(null,"width",pxRectWidth);
      myRect.setAttributeNS(null,"height",pxRectHeight);
      myRect.setAttributeNS(null,"fill", getBlowShade(ttBlowError*1,rn%2));
      
      if ((bn == ssxState.bnNew || ssxState.bnNew == -1) && rowInRange) {
        // Highlight results for selected bell, or all bells if none selected
        myRect.setAttributeNS(null, "fill-opacity", 1);
      }
      else {
        // Make other bells' results less opaque
        myRect.setAttributeNS(null, "fill-opacity", 0.3);
      }
    }
    
    // Rectangles for errors for selected bell - shown to the right of the main grid
    var idRect = "rn"+rn+"err" +"rect";
    var myRect = document.getElementById(idRect);
    if (myRect == null){
      myRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      myRect.setAttributeNS(null,"id",idRect);
      myRect.setAttributeNS(null,"stroke","none");
      myRect.setAttributeNS(null,"opacity","1");
      myRect.setAttributeNS(null,"class","rowshade");
      mysvg.appendChild(myRect);
    }
    if (rowInRange && ssxState.bnNew > -1) {
      var i = ssxState.bnNew + rn * nBells;
      var pxBnErrIdealX  = Math.round(2.02 * pxGraphCentreX);
      var ttBlowError  = tiActByRb[i] - tiIdealByModelRb[ssxState.modelNew][i];
      
      var pxRectWidth  = pxPerMs*ttBlowError;
      if (ttBlowError < 0) {
        var pxRectLeft = pxBnErrIdealX + pxRectWidth;
      }
      else {
        var pxRectLeft = pxBnErrIdealX;
      }
      
      var pxRectTop    = pxGraphPadTop + pxPerRow*(rn-1) + pxRectOffsetY+.5;
      var pxRectHeight = pxPerRow -1;
      myRect.setAttributeNS(null,"x",pxRectLeft);
      myRect.setAttributeNS(null,"y",pxRectTop);
      myRect.setAttributeNS(null,"width",Math.abs(pxRectWidth));
      myRect.setAttributeNS(null,"height",pxRectHeight);
      myRect.setAttributeNS(null,"fill", getBlowShade(ttBlowError*1,rn%2));
    }   
    else {
      // Make them invisible
      myRect.setAttributeNS(null,"fill", "#FFFFFF");
    }
    
    // Display error for selected bell in milliseconds as text 
    var idErrRectText = "rn"+rn+"selectedErrorText";
    var objBn = document.getElementById(idErrRectText);
    if (objBn == null){
      objBn = document.createElementNS(ns,"text");
      objBn.setAttributeNS(null,"class","bn nopointerevents");
      objBn.id = idErrRectText;
      t = document.createTextNode(0);
      objBn.appendChild(t);
      mysvg.appendChild(objBn);
    }
    
    // Update for selected bell
    if (rowInRange && ssxState.bnNew > -1)
    {
      var i = ssxState.bnNew + rn * nBells; //index into data      
      var currentError = Math.round(tiActByRb[i] - tiIdealByModelRb[ssxState.modelNew][i]);
      t = document.createTextNode(currentError);
      objBn.replaceChild(t, objBn.childNodes[0]);
          
      // Specify location
      var pxBnErrStr = Math.round(1.8 * pxGraphCentreX);
      
      // Align positive and negative numbers
      if (currentError >= 0) {
        pxBnErrStr = pxBnErrStr + 4;
      }

      var pxBnY = pxGraphPadTop+pxPerRow*rn;
      objBn.setAttributeNS(null,"x",pxBnErrStr);
      objBn.setAttributeNS(null,"y",pxBnY);
    }
    else {
      // Remove text as no bell selected
      t = document.createTextNode("");
      objBn.replaceChild(t, objBn.childNodes[0]);
    }
  }
  
  // Bell numbers and blue lines
  for (var bn = 0; bn < nBells; bn++) {
    var s  = "";
    var si = "";
    for (var rn = 0; rn < nRows; rn++) {
      var i = bn + rn * nBells; //index into data tiRowByModelRn
      var tiRowMid     = tiRowByModelRn[ssxState.modelNew][rn]+ ttIbgByModelRn[ssxState.modelNew][rn]*nBells/2;
      var pxBnActX     = pxGraphCentreX + pxPerMs*(tiActByRb[i] - tiRowMid);
      var pxBnIdealX   = pxGraphCentreX + pxPerMs*(tiIdealByModelRb[ssxState.modelNew][i] - tiRowMid);
      var pxBnY = pxGraphPadTop+pxPerRow*rn;
      var idBn = "rn"+rn+"bn"+(bn+1);
      var objBn = document.getElementById(idBn);
      if (objBn == null){
        objBn = document.createElementNS(ns,"text");
        objBn.setAttributeNS(null,"class","bn nopointerevents");
        objBn.id = idBn;
        objBn.appendChild(document.createTextNode(("1234567890ET")[bn]));
        mysvg.appendChild(objBn);
      }
      objBn.setAttributeNS(null,"x",pxBnActX);
      objBn.setAttributeNS(null,"y",pxBnY);
      
      // Blue line paths
      if (rn >=rnRange[0]-1 && rn <=rnRange[1]+1){  // The -/+1 make the blueline start with the row before/after the selected row
        s  =  s.concat((pxBnActX +pxLineOffsetX).toString(), ",", (pxBnY-pxLineOffsetY).toString()," ");
        si = si.concat((pxBnIdealX+pxLineOffsetX).toString(), ",", (pxBnY-pxLineOffsetY).toString()," ");
      }
    }
    // now draw bell's blue line
    addBl(mysvg,s, bn, 0);
    addBl(mysvg,si,bn, 1);
  }
  
  function addBl(mysvg, bellpath, bn, isIdeal) { // Add a bell path to the display
      var idLine = "bell"+(bn+1)+['a','i'][isIdeal];
      var objLine = document.getElementById(idLine);
      if (objLine == null){
        objLine = document.createElementNS(ns, 'polyline');
        objLine.style.fill = "none";
        objLine.setAttribute("id",idLine);
        objLine.setAttribute("class","blueline");
        mysvg.appendChild(objLine);
        if (!isIdeal){
          objLine.style.stroke = "grey"; //Stroke colour for actual
          objLine.style.strokeWidth = "1";
        }else{
          objLine.style.stroke = "rgb(96,96,255)"; //Stroke colour for ideal
          objLine.style.strokeWidth = "1";
          objLine.style.visibility = "hidden";
        }
      }
      objLine.setAttribute("points",bellpath); //path
  }
}

function getBlowShade(ttError, isGrey){
  var numBadBands = 8; // only numBadBands-numGoodBands actually used
  var numGoodBands = 2; // only numGoodBands-1 actually used because don't want and white blocks
  var veryBadLimit = 100;
  var veryGoodLimit= 20;
  var hueQuick = 30;
  var hueSlow = 220;
  var hueVeryGood = 130; 
  var satPercentMaxVeryGood = 60;
  var idxColour;
  if (Math.abs(ttError) <=veryGoodLimit){ 
    // VeryGood hue is more saturated the nearer to zero error
    idxColour = 1+Math.floor(numGoodBands*Math.min(1,(veryGoodLimit-Math.abs(ttError))/veryGoodLimit))
    return myhsv2rgb(hueVeryGood, idxColour/numGoodBands*satPercentMaxVeryGood, 100)
  } else { 
    // Quick and Slow hues are more saturated the further from zero error
    idxColour = 1+Math.floor(numBadBands*Math.min(1,(Math.abs(ttError))/(veryBadLimit)))
    return myhsv2rgb((ttError >= 0)?hueSlow:hueQuick, idxColour/numBadBands*100, 100)
  }
}

function myhsv2rgb(H,S,V){ // (Hue 0:359, Saturation 0:100, Brightness 0:100)
var rgb,qwe
rgb = hsv2rgb([H,S,V])
qwe = '#'+toHex(rgb[0])+toHex(rgb[1])+toHex(rgb[2])
return qwe
}

function toHex(d) { // 2-character hex number
    return  ("0"+(Number(d).toString(16))).slice(-2).toUpperCase()
}

function hsv2rgb(r) { // easyrgb.com/math.php?MATH=M21#text21
	var R,B,G,H=r[0]/360,S=r[1]/100,V=r[2]/100;
	if(S>0) { if(H>=1) H=0;
		H=6*H; F=H-Math.floor(H);
		A=Math.round(255*V*(1.0-S));
		B=Math.round(255*V*(1.0-(S*F)));
		C=Math.round(255*V*(1.0-(S*(1.0-F))));
		V=Math.round(255*V); 
		switch(Math.floor(H)) {
			case 0: R=V; G=C; B=A; break;
			case 1: R=B; G=V; B=A; break;
			case 2: R=A; G=V; B=C; break;
			case 3: R=A; G=B; B=V; break;
			case 4: R=C; G=A; B=V; break;
			case 5: R=V; G=A; B=B; break;
		}
		return({0:R?R:0,1:G?G:0,2:B?B:0});
	}
	else return({0:(V=Math.round(V*255)),1:V,2:V});
}

function paintRns(){
  if (rnTypeCurrent == ssxState.rnTypeNew) {return;}
  // 1. Hide all row numbers
  oldRns = document.getElementsByClassName("rn");
  for(var i=oldRns.length-1 ; i>=0 ; i--){
    oldRns[i].style.visibility = "hidden";
  }
  // 2. Work out new numbering
  if (ssxState.rnTypeNew == "P"){ // Numbering rows of piece
    var start    = 0;
    var end      = nRows;
    var factor   = 1;
  }else if (ssxState.rnTypeNew == "T"){ // numbering rows of touch
    var start = getTstart();
    var end  = getTend();
    var factor   = 1;
  }else if (ssxState.rnTypeNew == "B"){ // Numbering blows of piece
    var start    = 0;
    var end      = nRows;
    var factor   = nBells;
  }
  // 3. Create objects if necessary, set appropriate value and set visibility=visible
  for (var rn = start; rn < end; rn+=2) {
    var objRn = document.getElementById("arn"+rn);
    if (objRn == null){
      var objRn = document.createElementNS(ns,"text");
      objRn.setAttributeNS(null,"id","arn"+rn);
      objRn.setAttributeNS(null,"x",pxRnOffset);
      objRn.setAttributeNS(null,"y",pxGraphPadTop+pxPerRow*rn);
      objRn.setAttributeNS(null,"class","rn nopointerevents");
      objRn.appendChild(document.createTextNode(''));
      mysvg.appendChild(objRn);
    }
    objRn.innerHTML = factor*(rn-start) + 1;
    objRn.style.visibility = "visible";
  }
}

function paintPns(){
  if (!isFirstTime) return

  rnTouchFirst = getTstart();
  rnTouchLast = getTend();
  for (var rn = rnTouchFirst; rn < Math.min(rnTouchLast+1, PlacenotationByRn.length); rn++) {
    var objPn = document.createElementNS(ns,"text");
    objPn.setAttributeNS(null,"id",'pn'+rn);
    objPn.setAttributeNS(null,"x",pxPnOffset);
    objPn.setAttributeNS(null,"y",pxGraphPadTop+pxPerRow*(rn-.58)); // Set centre of pn txt between rows
    objPn.appendChild(document.createTextNode(''));
    var pn = PlacenotationByRn[rn];
    if (pn[0] == '?'){ // Set error pn stype
      objPn.setAttributeNS(null,"class","pnerror nopointerevents");
      objPn.innerHTML = pn;
    }else if( pn == '='){ // invisible
      objPn.setAttributeNS(null,"class","pn nopointerevents");
    }else{  // Normal
      objPn.setAttributeNS(null,"class","pn nopointerevents");
      objPn.innerHTML = pn;
    }
    mysvg.appendChild(objPn);
  }
}

// Return 0-origin row number of start of touch. If no touch return row number of start of piece
function getTstart(){ 
  if (rnByMainEvents.length>3){
    return rnByMainEvents[1]-1;
  }else{
    return rnByMainEvents[0]-1;
  }
}

// Return 0-origin row number of end of touch. If no touch return row number of end of piece
function getTend(){
  if (rnByMainEvents.length>3){
    return rnByMainEvents[2]-1;
  }else{
    return rnByMainEvents[1]-1;
  }
}


function paintBellStriking(){
  if (ssxState.modelNew == modelCurrent && ssxState.bnNew == bnCurrent && JSON.stringify(ssxState.rangeNew) == JSON.stringify(rangeCurrent) && !isFirstTime){
    return;
  }
  if (bnCurrent != -1 && bnCurrent != Infinity) { // un-highlight previously selected bell
    var idealLineCurrent  = document.getElementById("bell" + (bnCurrent+1).toString() + "i");
    idealLineCurrent.style.visibility = "hidden";
    var actualLineCurrent = document.getElementById("bell" + (bnCurrent+1).toString() + "a");
    actualLineCurrent.style.stroke='grey';
  }

  if (ssxState.bnNew >= 0){  // highlight newly selected bell
    var idealLineNew = document.getElementById ("bell" + (ssxState.bnNew+1).toString() + "i");
    idealLineNew.style.visibility = "visible";
    var actualLineNew = document.getElementById("bell" + (ssxState.bnNew+1).toString() + "a");
    actualLineNew.style.stroke='black';
  }
}

function paintGraphPos(){// set scrollTop from ssxState
  var xxx = ssxState.rnNew*pxPerRow - ssxState.rrViewspotNew*strikinggraph.offsetHeight 
  if (xxx>0) strikinggraph.scrollTop=xxx
}
