// PREAMBLE (the place for loading code and detecting fatal errors such as no piece data)

// P1. Check piecedata found
if (typeof sTouchid == 'undefined')	alert('piecedata?')
debugger
// P2. Load Touch Explorer scripts if not embedded
if (typeof ssxIsLoaded == 'undefined'){ // Effectively, a test to see if TE has been merged into a single script. To work,
                                        //    var ssxIsLoaded = true;
										// should be in one of the .js files
  scripts=["statistics.js", "rhs.js", "graph.js", "controls.js", "audiocontrols.js", "animation.js", "main.js"]
  for (i=0 ; i<scripts.length ; i++){
    newScript = document.createElement('script');
    newScript.src = tvLoc+scripts[i];
    first.parentNode.insertBefore(newScript, first);
  }
}

// P3. Launch touch explorer
// This should be changed to a multi-step process. The first should initialise the green heading bar and
// only when done should the whole of the launch sequence be run. the startTouchExplorer() function would
// need to be split into 2 or more steps. This will improve the user experience of opening an analysis
LaunchWhenReady()
function LaunchWhenReady(){
   if(typeof ControlsJs !== 'undefined' && typeof AudioControlsJs !== 'undefined' && typeof AnimationJs !== 'undefined' && typeof StatisticsJs !== 'undefined' && typeof RhsJs !== 'undefined' && typeof GraphJs !== 'undefined' && typeof MainJs !== 'undefined')
   {
	   startTouchExplorer()
   } else {
	   setTimeout(LaunchWhenReady, 30) // if not ready wait for some milliseconds and try again
   }
}
