var ControlsJs = true; // so that loader.js can tell if loaded

// PAINTS (AND CREATES SOME) CONTROLS, ADDS EVENT LISTENERS TO CONTROLS, HANDLES THE EVENTS BY UPDATING SSXSTATE
// 1. RnType
// 2. BnSelector
// 3. ModelSelector
// 4. RangeSelector
// 5. Graph (for row selection)

//1. RnType
rntype.addEventListener("click",evtRnTypeChange)
function evtRnTypeChange(){
  if (rnTypeCurrent == "P"){
    ssxState.rnTypeNew = "T";
  } else if (rnTypeCurrent == "T"){
    ssxState.rnTypeNew = "B";
  } else if (rnTypeCurrent == "B"){
    ssxState.rnTypeNew = "P";
  }
  doitall();
}
function paintRnTypeCtl(){
  if (ssxState.rnTypeNew == rnTypeCurrent) return; 
  document.getElementById("rntype").innerHTML = ssxState.rnTypeNew;
}

// BnSelector
bnselector.addEventListener("change",evtBnChange)
function evtBnChange() {// React to  user interaction with the control
  ssxState.bnNew = bnselector.selectedIndex-1 // -1 => no bell selected. Hence bnNew is 0-origin
  doitall();
}
function paintBnCtl(){ // Initialise the control if firstTime, then obey the state data
  if (ssxState.bnNew == bnCurrent || !isFirstTime) return; 
  if (isFirstTime){
    for (var i=0 ; i < nBells+1; i++) {
      option = document.createElement("option");
      option.innerHTML = " 1234567890ETABCD"[i]; //
      bnselector.add(option);
    }
  }
  bnselector.selectedIndex=ssxState.bnNew+1
}

// ModelSelector
modelselector.addEventListener("change",evtModelChange)
function evtModelChange() {// Change of model (currently all models are changed at same time, and code does not use correct model
  ssxState.modelNew = modelselector.selectedIndex;
  doitall()
}
function paintModelCtl(){
  if (ssxState.modelNew == modelCurrent && !isFirstTime) return; 
  if (isFirstTime){
    for (i=0 ; i<svModelnames.length ; i++){
	  option = document.createElement("option")
      option.innerHTML = svModelnames[i]
	  modelselector.add(option)
	}
  }
  modelselector.selectedIndex=ssxState.modelNew
}

// RangeSelector
rangeselector.addEventListener("change",evtRangeChange)
range.addEventListener("change",evtRangeChange)
const rangenames = ["Touch", "Piece", "Opening Rounds", "Closing Rounds", " "]
function evtRangeChange(obj){
  var rnRange; // for the new validated range rows ZERO ORIGIN
  var rid;      // for the new rangeid
  if (obj.target == rangeselector){ // User has selected a named range
    if (0) {}
    else if (rangeselector.selectedIndex == 0) ssxState.rangeNew.rows = [getTstart(),          getTend()];         // Touch
    else if (rangeselector.selectedIndex == 1) ssxState.rangeNew.rows = [nFirstJudgeableRow-1, nRows-1];           // Piece
    else if (rangeselector.selectedIndex == 2) ssxState.rangeNew.rows = [nFirstJudgeableRow-1, getTstart()-1];     // Opening Rounds
    else if (rangeselector.selectedIndex == 3) ssxState.rangeNew.rows = [getTend()+1,          nRows-1];           // Closing Rounds
	ssxState.rangeNew.rid = rangeselector.selectedIndex
  }else{ // User has typed in an arbitrary range
    var rp = range.value.split(":");
    rnRange = [parseInt(rp[0])-1, parseInt(rp[1])-1];    
    if(isNaN(rnRange[0]) || rnRange[0]<0){
      rnRange[0] = 0;
    }
    if(isNaN(rnRange[1]) || rnRange[1]>nRows-2){
      rnRange[1] = nRows-1;
    }
	if (0) {}
    else if (rnRange[0] == getTstart()           && rnRange[1] == getTend())     rid = 0;  // Touch
    else if (rnRange[0] == nFirstJudgeableRow-1 && rnRange[1] == nRows-1)       rid = 1;  // Piece
    else if (rnRange[0] == nFirstJudgeableRow-1 && rnRange[1] == getTstart()-1) rid = 2;  // Opening Rounds
    else if (rnRange[0] == getTend()+1           && rnRange[1] == nRows-1)       rid = 3;  // Closing Rounds
	else rid = 4; // Blank
	ssxState.rangeNew.rows = JSON.parse(JSON.stringify(rnRange))
    ssxState.rangeNew.rid = rid
  }
  // at this point ssxState.rangeNew should be set to the new values
  doitall()
}
function paintRangeCtl(){// This paints both the "range" and the "rows" controls
  if (JSON.stringify(ssxState.rangeNew) == JSON.stringify(rangeCurrent) && !isFirstTime) return; 
  if (isFirstTime){
    for (var i=0 ; i<rangenames.length-1 ; i++){ // -1 is because don't want user to be able to select a blank range option but want to set it
	  option = document.createElement("option")
      option.innerHTML = rangenames[i]
	  rangeselector.add(option)
	}
	// first time only, if rangeNew.rows==[0,0] we need to set it to touch
	if (ssxState.rangeNew.rows.toString() == "0,0") ssxState.rangeNew.rows=[getTstart() , getTend()]
  }
  // PAINT the correct values into the two controls
  //rangeselector.selectedIndex = ssxState.rangeNew.rid
  rangeselector.value         = rangenames[ssxState.rangeNew.rid]
  range.value = (ssxState.rangeNew.rows[0]+1) + ":" + (ssxState.rangeNew.rows[1]+1)
}


////// Graph (Selected Row)
mysvg.addEventListener("click", evtGraphClicked)
function evtGraphClicked(evt){// Click in the graph to change Selected row.
  ssxState.rnNew = Math.floor((evt.y-mysvg.getBoundingClientRect().top-6)/pxPerRow); //zero-origin row number in piece
  ssxState.rrViewspotNew = (ssxState.rnNew*pxPerRow-strikinggraph.scrollTop)/strikinggraph.offsetHeight // set new viewspot
  isClickedGraph=true;
  eye.style.display = "none" // bit of a bodge to do this here. It can't do harm but may be unnecessary
  doitall()
}
function paintSelectedRow(){ // Selected row rectangle creation positioning and visibility. 
  if (ssxState.rnNew == rnCurrent) return
  var myRect = document.getElementById("rowselector");
  if (myRect == null){ // Create selected row rectangle
    myRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    myRect.setAttributeNS(null,"id","rowselector");
    myRect.setAttributeNS(null,"class","sgselected");
    mysvg.appendChild(myRect);
  }
  // set position and size of selected row rectangle and make visible
  if (ssxState.rnNew == -1 || ssxState.rnNew == Infinity){
    pxRectLeft   = 0;
    pxRectWidth  = 0;
    pxRectTop    = 1000000;
  }else{
    pxRectLeft   = pxGraphCentreX - pxPerMs*(ttIbgByModelRn[ssxState.modelNew][ssxState.rnNew]*(nBells+.7)/2);
    pxRectWidth  = pxPerMs*ttIbgByModelRn[ssxState.modelNew][ssxState.rnNew]*nBells;
    pxRectTop    = pxGraphPadTop + pxPerRow*(ssxState.rnNew-1) + pxRectOffsetY+.5;
  }
  myRect.setAttributeNS(null,"x",pxRectLeft);
  myRect.setAttributeNS(null,"width",pxRectWidth);
  myRect.setAttributeNS(null,"y",pxRectTop);
  myRect.setAttributeNS(null,"height",pxPerRow);
}
