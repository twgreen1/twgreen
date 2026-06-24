var AnimationJs = true; // so that loader.js can tell if loaded
//Bugs
//-  FIXED click eye destroys rrviewspot and can leave it invisible
//-  FIXED scroll to reveal eye click a row and eye stays
//-  FIXED click play jerks graph to start of row
//-  FIXED jerks to start of touch at end
//-  ideally stop loop if paused


// User can interact with transport, graph and browser elements such as scroll bars, sizing
// and reload. These affect the audio-visual experience as follows:
// 1.  Normally, Audio and visual are LINKED, i.e. graph scrolls automatically. But can be
//     UNLINKED by certain interactions.
// 2.  When LINKED the pvViewspot and the pgRingingspot match (or are rapidly being matched)
//     by autoscroll. 
// 3.  LINKED->UNLINKED by scrolling current row out of view, whether playing or not
// 4.  Play shows eye icon if current row not visible
// 5.  Pause leaves eye icon visible to indicate UNLINKED???
// 6.  UNLINKED->LINKED by clinking the eye icon.
// 7.  Whether LINKED or UNLINKED, play-pause-play (i.e. without intervening change of
//     current row) is a pure pause in the sound. 
// 8.  Graph events i.e. selecting row sets current row, pvViewspot, ssxState.isLinkedNew=true and hides eye
// 9.  Transport events i.e. clicking forward or backward change current row but not pvViewspot.  
// 10. Small scroll events however the user achieves them change pvViewspot but not current row.
// 11. Large scroll events set ssxState.isLinkedNew=0 and show eye
// 12. reload restores current row, pvViewspot and ssxState.isLinkedNew but sets isPlaying = false
//
// Design is based on minimising dependence on whether audio exists or not and whether playing
// or not and avoiding race conditions between event handling and the animation loop.
// This is achieved by dividing responsibilities or where not possible arranging that AL
// safely ignores half-completed changes. E.G. if an event handler signals that user has
// clicked fast-forward and current audio position has not changed AL ignores it. The
// next invocation of AL should detect the changed position and react.

// Init animation loop variables used for checking for changes...
rnPrev             = 0       // "previous rownumber
msPrev             = 0;      // "previous" time into the audio 
pgPrevScrollTop    = -1      // Invalid value ensures first time comparison failure
pgPrevOffsetHeight = -1      //   ditto
userIsScrolling    = false   // scrolling not in progress
rnPrev=-1;

// Init animation loop variables used for receiving commands from event handlers 
isClickedEye       = false;
isClickedGraph     = false;
isClickedTransport = false;
isCatchingup       = false;
scrollsteps=0
isRowFaultsShouldBeHidden = false
isRowFaultsAreDisplayed = false
function animate(secFrametime) {

  // 0. Do nothing if paused
  var msCurrent = myAudio.currentTime*1000+iMsAddToAudioTimes;
  if (msCurrent == msPrev){ // Paused
    animationID = window.requestAnimationFrame(animate)
    return;
  }	
  msPrev = msCurrent
  
  // 1. collect [new]rn and pgSoundspot
  var rn = ms2rn(msCurrent)
  rowduration = tiRowByModelRn[0][rn]-tiRowByModelRn[0][rn-1]
  rowfraction = (msCurrent-tiRowByModelRn[0][rn])/rowduration
  isRowFaultsShouldBeHidden = (rowfraction>.1 && rowfraction<.9)
  if ( isRowFaultsShouldBeHidden && isRowFaultsAreDisplayed){
	irowfau.innerHTML = '-'
	isRowFaultsAreDisplayed = false
  } else if ( !isRowFaultsShouldBeHidden && !isRowFaultsAreDisplayed){
	paintCurrentRowStats(true)
	isRowFaultsAreDisplayed = true
  }
  var pgSoundspot = (rn+(msCurrent-tiRowByModelRn[0][rn])/(tiRowByModelRn[0][rn+1] - tiRowByModelRn[0][rn])) * pxPerRow
  ssxState.rnNew = rn

  // 2. Detect user interactions and set local booleans to signal this to the next section 
  var userHasScrolled = false
  if (pgPrevScrollTop !=-1 && Math.abs(strikinggraph.scrollTop - pgPrevScrollTop) > 0){  // scroll start
	secScrolltime   = secFrametime
	userIsScrolling = true
    pgPrevScrollTop = strikinggraph.scrollTop
    animationID     = window.requestAnimationFrame(animate)
	return
  }
  if (userIsScrolling){
	if (secFrametime-secScrolltime<.25){ // if not yet ended for long enough?
      animationID = window.requestAnimationFrame(animate)
      return
	}else{
	  userIsScrolling = false
      userHasScrolled = true
	}
  }  
  var isRnChanged     = rnPrev != ssxState.rnNew             // detect if previously seen row rn is different than rnNew    
  var isSized         = pgPrevOffsetHeight !=-1 && Math.abs(strikinggraph.offsetHeight - pgPrevOffsetHeight) > 0 // detect if user changed window size
  var isRnVisible     = pgSoundspot >= strikinggraph.scrollTop && pgSoundspot <= strikinggraph.offsetHeight+strikinggraph.scrollTop      // detect if user actions hid current row
  isClickedGraph      // set by graph click event. If (isRnChanged) {act on it and clear it} else {Ignore and do not clear it}
  isClickedTransport  // set by transport click event.  If (isRnChanged) {act on it and clear isClicked} else {Ignore and do not clear it}
  isClickedEye        // set by Eye click event
	  
  // 3. Decode and act on user interactions by updating states (ssxState.isLinkedNew, ssxState.rrViewspotNew, isStartCatchup)
  isStartCatchup = false
  if (0){
  } else if (userHasScrolled && isRnVisible){        // small scroll (Change pvViewspot to match pgSoundspot)
    userHasScrolled=false
    ssxState.rrViewspotNew = (ssxState.rnNew*pxPerRow-strikinggraph.scrollTop)/strikinggraph.offsetHeight // set new viewspot
  } else if (userHasScrolled && !isRnVisible){        // large scroll (unlink and show eye)
    userHasScrolled      = false
    ssxState.isLinkedNew = false
  } else if(isSized){                            // window size change (change pvViewSpot in proportion)
    isSized              = false
    isStartCatchup       = true
  } else if (isClickedGraph && isRnChanged){     // Graph clicked (reset pvViewspot)
    isClickedGraph       = false;
    ssxState.rrViewspotNew = (ssxState.rnNew*pxPerRow-strikinggraph.scrollTop)/strikinggraph.offsetHeight // set new viewspot
  } else if (isClickedTransport && isRnChanged){ // Transport fwd/back clicked
    isClickedTransport   = false
    isStartCatchup       = true
    //ssxState.isLinkedNew = true
  } else if (isClickedEye){                      // Eye clicked
    isClickedEye         = false;
    isStartCatchup       = true
    ssxState.isLinkedNew = true
  } 

  // 4. Catchup if needed
  var ppDisplacement = 0;
  if (isStartCatchup){
	pgViewspot        = strikinggraph.scrollTop+ssxState.rrViewspotNew*strikinggraph.offsetHeight
    ppCatchupTotal    = pgSoundspot - pgViewspot
    pgSoundspotSave   = pgSoundspot
    ppCatchupDuration = pxPerRow*Math.log(Math.abs(ppCatchupTotal)*pxPerRow)/(40) // Hacked expression to get nice-looking scroll-time
	isCatchingup      = true
    isStartCatchup     = false
  }
  if (isCatchingup){
    var progress2     = Math.PI*(pgSoundspot - pgSoundspotSave)/ppCatchupDuration // proportion of duration from 0 to 1
	if (progress2>=Math.PI) {
	  isCatchingup = false
	}else{
      ppDisplacement     = ppCatchupTotal*(1+Math.cos(progress2))/2
	}
  }
  
  // 5. Paint the results of this time through the animation loop
  if (rnPrev != ssxState.rnNew){          // Current row rnPrev if necessary
	paintSelectedRow()
    rnPrev = ssxState.rnNew
  }  
  if (ssxState.isLinkedNew){              // Eye icon and scroll position
    var xxx = pgSoundspot - ssxState.rrViewspotNew*strikinggraph.offsetHeight - ppDisplacement
    if (xxx>0) strikinggraph.scrollTop = xxx
    eye.style.display = "none"
	scrollsteps++
  } else {
	eye.style.display = ""
	}  
  if (!isNaN(myAudio.duration)){           // transport control time display
    ppposition.innerHTML=""+hms(myAudio.currentTime)+'&nbsp;/&nbsp;'+hms(myAudio.duration)+'&nbsp;';
  }
  
  // 6. SAY ALL CHANGES MADE so that next time round they are not redone
  rnCurrent          = ssxState.rnNew
  isLinkedCurrent    = ssxState.isLinkedNew
  pvViewspotCurrent  = ssxState.rrViewspotNew*strikinggraph.offsetHeight // ssxState saves Viewspot relative to viewport height

  // 7. Save session
  savesession()

  // 8. prepare for next time round  
  pgPrevOffsetHeight = strikinggraph.offsetHeight  
  pgPrevScrollTop    = strikinggraph.scrollTop  
  animationID        = window.requestAnimationFrame(animate); // Put this at end because if AL crashes want to stop
}

function ms2rn (ms) { // find the row corresponding to the given time in milliseconds in the audio
  // estimate row number using dead reconing
  // then scan forwards or backwards as appropriate to find the actual row number
  var rnLast = tiRowByModelRn[0].length-1;
  var rnFractional = tiRowByModelRn[0].length*(ms-tiRowByModelRn[0][0])/(tiRowByModelRn[0][rnLast]-tiRowByModelRn[0][0]);
  var rnEstimated = Math.min(rnLast,Math.max(0,Math.floor(rnFractional))); // Make integer and within range
  var rn;
  //rnEstimated=250
  //sa=""
  //sb=""
  //debugger
 if (tiRowByModelRn[0][rnEstimated]<=ms){ // If start time of estimated row <= given time then scan forwards until first row that is too big, and return 1 less
    for (rn=rnEstimated-1; rn<=rnLast-1; rn++) {
 	  //sa =  "rn="+rn+" "+sa+' '
     if (tiRowByModelRn[0][rn+1]>ms){
		 // Association.innerHTML = "A. " + sa
        return rn;
      }
    }
    return rnLast; // ms is any amount after start of last row
  }else{                                   // If start time of estimated row > given time scan backwards until first row that is too small and return that row
    for (rn=rnEstimated-1; rn>=0; rn--){ 
	 // sb =  "rn="+rn+" "+sb+' '
      if (tiRowByModelRn[0][rn]<=ms){
		  //TowerDateTimeDuration.innerHTML = "B. " + sb
        return rn;
      }
    }
    return 0;
  }
}

// Eye control and painter 
function EyeCtl(){
  isClickedEye = true
  eye.style.display = "none"
}
function paintEye(){
  if (ssxState.isLinkedNew){              // Eye icon and scroll position
    eye.style.display = "none"
  } else {
	eye.style.display = ""
  }
}

function dbgout(m){
  TowerDateTimeDuration.innerHTML = m
}
