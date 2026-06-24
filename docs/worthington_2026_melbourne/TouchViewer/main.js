var MainJs = true; // so that loader.js can tell if loaded

// P3. Check Touch Explorer scripts found
// if (typeof GraphJs == 'undefined') alert('graph.js') may need to wait from them to load

//var ddd = new Date();
//var nnn1 = ddd.getTime();
//something
//ddd = new Date();
//var nnn2 = ddd.getTime();
//alert (nnn2-nnn1)  

///////////////////////////////////////////////////////////
// TOUCH EXPLORER INFRASTRUCTURE

// I1. Initialise sessionStorage system
function getkey(s){
  ret = s.match(/^.*#/);
  if (ret == null){
    ret = s;
  } else {
	ret = ret[0];
	ret = ret.substring(0,ret.length-1);
  }
  return ret
}
ssxSaveKey = getkey(window.location.href);


// I2. CONTROL VARIABLE SETUP
// Defaults. We will need defaults to be kept separate to implement a reset button
const iconIdDefault      = 'RHicon'
const paneIdLhsDefault   = 'SG'
const paneIdRhsDefault   = 'RV'
const rnTypeDefault      = 'P';
const bnDefault          = -1; // 0-origin bell numbers
const modelDefault       = 0;
const rangeDefault       = JSON.parse('{"rid":0, "rows":[0,0]}')
const rnDefault          = 0 // 0-origin row numbers
const volumeDefault      = .5
const isLinkedDefault    = true;
const rrViewspotDefault  = .25

if (sessionStorage.getItem(ssxSaveKey) == null){         // page has not previously been loaded in this browser session, so
  // New values are taken from defaults when page is first loaded. 
  ssxState={};
  ssxState.iconIdNew      = iconIdDefault
  ssxState.paneIdLhsNew      = paneIdLhsDefault
  ssxState.paneIdRhsNew   = paneIdRhsDefault
  ssxState.rnTypeNew      = rnTypeDefault   
  ssxState.bnNew          = bnDefault        
  ssxState.modelNew       = modelDefault     
  ssxState.rangeNew       = {}; Object.assign(ssxState.rangeNew, rangeDefault)
  ssxState.rnNew          = rnDefault;
  ssxState.volumeNew      = volumeDefault    
  ssxState.isLinkedNew    = isLinkedDefault
  ssxState.rrViewspotNew  = rrViewspotDefault
}else{                                                       // page was previously loaded, so
  ssxState = JSON.parse(sessionStorage.getItem(ssxSaveKey));   // retrieve ssxState from session storage
}

// Current values are initially invalid which will force the redrawing. Note that we can change these to be the
// default values if the control initialise automatically to its default. Most do, though range does not so is init in the first-time paint

var iconIdCurrent      = ''
var paneIdLhsCurrent      = ''
var paneIdRhsCurrent   = ''
var rnTypeCurrent      = Infinity
var bnCurrent          = Infinity
var modelCurrent       = Infinity
var rangeCurrent       = {}
var rnCurrent          = Infinity
var volumeCurrent      = Infinity
var isLinkedCurrent    = Infinity
var rrViewspotCurrent  = Infinity
var pgViewspotCurrent  = Infinity

var isFirstTime      = true;

// I3. startTouchExplorer(). This is called from the js loader when all pages have been loaded

function startTouchExplorer(){

  // I4. Initialise Main page
  sp="\n                         "
  sToptions = "Train: " + sTrainparams +sp+"Gain: "+ sGainparams +sp+"Onset: " + sOnsetparams +sp+"Write: " + sWriteparams
  sAoptions = "Analyser: " + sAnalparams
  // Initialise Report to judges
  sub(TE);
    var myRungon = ""
	if (sRungon.length>0) myRungon = ". Rung on " + sRungon
    document.title=sRingingname;
    document.getElementById("RingingnameLengthMethod").innerHTML=sRingingname+" ("+nRowsInTouch+" "+sMethod+")";
    document.getElementById("Association").innerHTML=sAssociation;
    document.getElementById("TowerDateTimeDuration").innerHTML="At " + sTowerPhrase + ", On " + sNiceRingingdatetime + " in " + sTouchDuration + myRungon;
	if (sExpstring.length > 0){
      document.getElementById("Expstring").innerHTML="(Transcription Parameters: " + sExpstring + ")";
	}
    // Edit DOM so that icon src files are correctly identified
    vsi = document.getElementsByClassName('tv');
    for (i=0 ; i<vsi.length ; i++){
      ss = vsi[i].src.split("/");
      vsi[i].src=tvLoc+ss[ss.length-1];
    } 
  sub(RJ);
  // Initialise Ringer errors
  sub(RE);
  Meanbandafterbell.innerHTML   = shMeanbandafterbell;
  Meanbandinpos.innerHTML       = shMeanbandinpos;
  Meanbellafterbellbs.innerHTML = shMeanbellafterbellbs; 
  Meanbellafterbellhs.innerHTML = shMeanbellafterbellhs; 
  Meanbellinposbs.innerHTML     = shMeanbellinposbs; 
  Meanbellinposhs.innerHTML     = shMeanbellinposhs;
  Stdbellafterbellbs.innerHTML  = shStdbellafterbellbs; 
  Stdbellafterbellhs.innerHTML  = shStdbellafterbellhs; 
  Stdbellinposbs.innerHTML      = shStdbellinposbs; 
  Stdbellinposhs.innerHTML      = shStdbellinposhs;
  // Initialise Errors over Time
  sub(CO);
  // Initialise Error Histogram
  sub(EH);
  // Initialise Downloads
  sub(DO);
  // Initialise Technical
  // Paint the elements that remain up-to-date, either because do not change, or because they update automatically	
  paintViewIcons()    // Paint the view icons  
  paintBnCtl()        // Bell Selector
  paintModelCtl()     // Model Selector
  paintPns()          // Placenotations
  paintGraphPos()     // Positions the graph vertically in the viewport
  // Paint Everything Else
  doitall()           // Paint Everything Else
};

// I4. DOITALL. Is called by event handlers which will have set new values for data to be preserved across reload into
//     ssxState fields. Painters compare ssxState and "Current" variables to decide what to updates to make. Thus:
//     - xxxCurrent variables thus reflect what is actually on screen
//     - ssxState.xxxNew fields reflect changes the user has requested that are not yet on screen
//     - ssxState is saved at the end of doitall().
//     Note architecture might have been clearer with xxxNew/ssxState.xxxSave instead of ssxState.xxxNew/xxxCurrent.
//     Maybe should change to this at some point
function doitall(){
 
  // 1. CALL ALL PAINTERS OR CALCULATERS THAT MAY PRODUCE DIFFERENT RESULTS ACCORDING TO THE OPTIONS SELECTED
  paintRangeCtl()     // This control needs to be called in doitall because complex interaction between the rangename and rangerows controls
  calcStats()         // Doesn't paint, but calculates accumulators 
  paintStriking()     // Paints: BellNumbers, BlowRectangles, ActualAndIdealBlueLines, BellErrorRectangles, BellErrorNumbers
  paintBellStriking() // Sets ActualAndIdealBlueLines highlighting and rhs Bellno
  paintRnTypeCtl()    // Row number selector

  paintModelName()    // Paint model name into RHS so that can also change help text (at some point)
  paintAllBellStats() // Paints AllBellStatistics
  paintSelectedBellStats()    // Paints specific bell stats
  paintRns()          // Paints the rownumbers on the left of the graph (Could be optimised out of doitall() if any benefit)
  paintSelectedRow()  // highlights a row on the striking graph
  paintCurrentRowStats(false)     // rhs: bottom right box. only when within range (clears when not) 
 // Obey the state data
  if (rnCurrent != ssxState.rnNew){ // QQQQQQQQ Set audio time if first time, or rn changed by user action. When rn changed by animation
                                    // loop both these variables are set to avoid an audio hiccough
    myAudio.currentTime = (tiRowByModelRn[0][ssxState.rnNew]-iMsAddToAudioTimes)/1000  
    ppposition.innerHTML=""+hms( myAudio.currentTime)+'&nbsp;/&nbsp;'+hms(myAudio.duration)+'&nbsp;'
  }	  
  
  paintVolumeCtl()
  paintEye()
  
  // 2. SAY ALL CHANGES MADE so that next time round doitall() they are not redone
  iconIdCurrent      = ssxState.iconIdNew
  rnTypeCurrent      = ssxState.rnTypeNew   
  bnCurrent          = ssxState.bnNew        
  modelCurrent       = ssxState.modelNew
  rangeCurrent       = JSON.parse(JSON.stringify(ssxState.rangeNew))
  rnCurrent          = ssxState.rnNew
  volumeCurrent      = ssxState.volumeNew
  isLinkedCurrent    = ssxState.isLinkedNew
  pvViewspotCurrent  = ssxState.rrViewspotNew*strikinggraph.offsetHeight // ssxState saves Viewspot relative to viewport height
  isFirstTime        = false;
  
  // 3. SAVE STATE SO THAT RELOADING THE PAGE WILL RESTORE THE CURRENT VIEW 
  savesession()

}

// Save session data
function savesession(){
  sessionStorage.setItem(ssxSaveKey,JSON.stringify(ssxState))
}	

// User clicked one of the View icons
function evtViewChange(evt){
  // View Icons (representing tabs under the heading ribbon) have an 
  // eventid XXX and matching iconid XXXicon. The action taken is to
  // select the Ids for the two panes of the view.
  // 
  //   Eventid  Iconid      paneidLhs  paneIdRhs Purpose
  //   "RH"     "RHicon"    "SG"       "RV"      Ringer's tab
  //   "CO"     "COicon"    "CO"       ""        Compass tab
  //   "JH"     "JHicon"    "RJ"       ""        Judges tab
  //   "SH"     "SHicon"    "SG"       "SV"      Statistician's tab
  //   "RE"     "REicon"    "RE"       ""        Ringing Master tab 1
  //   "EH"     "EHicon"    "EH"       ""        Ringing Master tab 2
  //   "DO"     "DOicon"    "DO"       ""        Downloads tab
  //   "TE"     "TEicon"    "TE"       ""        Technical info tab
  ssxState.iconIdNew = evt+"icon"
  if (evt == "RH"){
	  ssxState.paneIdLhsNew = "SG"
	  ssxState.paneIdRhsNew = "RV"
  } else if (evt == "CO"){
	  ssxState.paneIdLhsNew = "CO"
	  ssxState.paneIdRhsNew = ""
  } else if (evt == "JH"){
	  ssxState.paneIdLhsNew = "RJ"
	  ssxState.paneIdRhsNew = ""
  } else if (evt == "SH"){
	  ssxState.paneIdLhsNew = "SG"
	  ssxState.paneIdRhsNew = "SV"
  } else if (evt == "RE"){
	  ssxState.paneIdLhsNew = "RE"
	  ssxState.paneIdRhsNew = ""
  } else if (evt == "EH"){
	  ssxState.paneIdLhsNew = "EH"
	  ssxState.paneIdRhsNew = ""
  } else if (evt == "DO"){
	  ssxState.paneIdLhsNew = "DO"
	  ssxState.paneIdRhsNew = ""
  } else if (evt == "TE"){
	  ssxState.paneIdLhsNew = "TE"
	  ssxState.paneIdRhsNew = ""
  }
  paintViewIcons()
}  
function paintViewIcons(){ // Paint View, i.e. switch between different versions of Striking Graph, Judges Report, etc
  if (ssxState.iconIdNew == iconIdCurrent) return
  
  // Change icon to not selected, current LHS to invisible and current RHS to invisible
  if (iconIdCurrent.length !=0){
    document.getElementById(iconIdCurrent).className = "viewselectorN";
    document.getElementById(paneIdLhsCurrent).style = "display:none";
    if (paneIdRhsCurrent.length !=0) document.getElementById(paneIdRhsCurrent).style = "display:none";
  }
  
  // Change display new icon to selected, new view to visible and new subviewNew (if any) to visible 
  document.getElementById(ssxState.iconIdNew).className = "viewselectorS";
  document.getElementById(ssxState.paneIdLhsNew).style = "display:block";
  if (ssxState.paneIdRhsNew.length !=0) document.getElementById(ssxState.paneIdRhsNew).style = "display:inline"

  ///////////////// Set Current view
  iconIdCurrent = ssxState.iconIdNew
  paneIdLhsCurrent = ssxState.paneIdLhsNew
  paneIdRhsCurrent = ssxState.paneIdRhsNew
  
  sessionStorage.setItem(ssxSaveKey,JSON.stringify(ssxState))
}

function sub(s){
  // Substitute contentids with the actual content. Recursive so that only needs to be called once per section
  // in theory could be called for whole doc but this may be inefficient.
  // If suddenly this does not work, note that <p> (and probably many other tags) are automatically
  // terminated by the next tag (apart from <br> and perhaps other tags such as <b>). Hence failures
  // to substitute may be due to invalid html that does not show up when looking at the page.
  s.innerHTML = s.innerHTML.replace(/JUDGESREPORT/g, sReporttojudges);
  s.innerHTML = s.innerHTML.replace(/SOURCEFILENAME/g, sSourcefilename);
  s.innerHTML = s.innerHTML.replace(/TOUCHID/g, sTouchid);
  s.innerHTML = s.innerHTML.replace(/TOUCHDB/g, sTouchdb);
  s.innerHTML = s.innerHTML.replace(/QUALITY/g, sQuality);
  s.innerHTML = s.innerHTML.replace(/TOPTIONS/g, sToptions);
  s.innerHTML = s.innerHTML.replace(/AOPTIONS/g, sAoptions);
  s.innerHTML = s.innerHTML.replace(/IGNOREDROWS/g, sIgnoredRows);
  s.innerHTML = s.innerHTML.replace(/VERSIONS/g, sVersions);
  s.innerHTML = s.innerHTML.replace(/ASSOCIATION/g,     sAssociation);
  s.innerHTML = s.innerHTML.replace(/CALLING/g,         sCalling);
  s.innerHTML = s.innerHTML.replace(/COMPOSITIONNAME/g, sCompositionname);
  s.innerHTML = s.innerHTML.replace(/FOOTNOTES/g,       sFootnotes);
  s.innerHTML = s.innerHTML.replace(/RINGERS/g,         sRingers);
  s.innerHTML = s.innerHTML.replace(/TDATALEV/g, sTraindB);
  s.innerHTML = s.innerHTML.replace(/TRAINDATARECORDEDON/g, sTrainDataRecordedOn);
  s.innerHTML = s.innerHTML.replace(/TRAINEDON/g, sTrainedOn);
  for(let x of Array.from(s.children)) {
    sub(x);
  }
}
