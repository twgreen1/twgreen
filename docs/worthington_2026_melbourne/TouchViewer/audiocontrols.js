var AudioControlsJs = true; // so that loader.js can tell if loaded
// Volume (Level is remembered across reload of page)
function VolumeCtl(){
  ssxState.volumeNew = ppvolume.value;
  doitall()
}
function paintVolumeCtl(){
  if (ssxState.volumeNew == volumeCurrent && !isFirstTime) return; 
  myAudio.volume = ssxState.volumeNew;
}

//Play/Pause (State is not remembered across reload of page)
function PlayPauseCtl(){
  if (!isNaN(myAudio.duration)){ // Why do we need this. duration will be NaN if exists but not yet loaded. Would be better not to add listener until loaded
	ssxState.playNew = myAudio.paused
  }
  paintPlayPauseCtl()
  doitall()
}
function paintPlayPauseCtl(){
  if (ssxState.playNew && myAudio.currentTime<myAudio.duration)  {
    animationID = window.requestAnimationFrame(animate);  
    myAudio.play();
    pp.src=tvLoc+"iconpause.png";
  }else{
    myAudio.pause();
    pp.src=tvLoc+"iconplay.png";
  }
}

// Go Back (rnCurrent is changed by this so is remembered)
function GoBackCtl() {// repeat at least a wholepull
  ssxState.rnNew = rnCurrent-2
  isClickedTransport=true;
  doitall();
}

// Go Forward (rnCurrent is changed by this so is remembered)
function GoForwardCtl() {              // skip at least a wholepull
  ssxState.rnNew = rnCurrent+2
  isClickedTransport=true;
  doitall();
}

initAudio()
function initAudio(){ 
  if (sAudioFile.length==0) return // Ignore everything if no file to play
  mms = document.createElement("source");
  mms.src = sAudioFile;
  mms.type = "audio/mpeg";
  myAudio.onended=function (){ // Change icon
    pp.src=tvLoc+"iconplay.png";
	// Also need to decide what current row should be
  }
  myAudio.appendChild(mms);
  myAudio.volume = .5;
  ppvolume.value = .5;
  myAudio.load(); // Finally, load the recording
  isAudioPainted=0
  myAudio.oncanplay=paintAudio
  myAudio.addEventListener('loadedmetadata', function(){
	var sAudioTimeofRow
    sAudioTimeofRow = (tiRowByModelRn[0][ssxState.rnNew]-iMsAddToAudioTimes)/1000 // seconds
    myAudio.currentTime = sAudioTimeofRow  
    ppposition.innerHTML=""+hms(sAudioTimeofRow)+'&nbsp;/&nbsp;'+hms(myAudio.duration)+'&nbsp;'; 
  },false);  
}

function paintAudio() { // Initialise the control if firstTime, then obey the state data
  if (isAudioPainted==0)  {// Make audio controls visible
    isAudioPainted = 1
    audiocontrols.style.visibility="visible";
    ppvolume.addEventListener("input", VolumeCtl)
    pp.addEventListener("click", PlayPauseCtl)// play/pause button
    ppback.addEventListener("click", GoBackCtl)
    ppforward.addEventListener("click", GoForwardCtl)
    myAudio.appendChild(mms);
    myAudio.load(); // Finally, load the recording
	myAudio.volume = ssxState.volumeNew;
	ppvolume.value = ssxState.volumeNew;
  }
}


function hms(secs){
  secs=Math.floor(secs);
  s=("0" + secs%60).slice (-2);
  mins=Math.floor(secs/60);
  m=("0" + mins%60).slice(-2);
  h=Math.floor(mins/60);
  return(h==0? (+m+':'+s):(h+':'+m+':'+s));
}
