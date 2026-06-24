var RhsJs = true; // so that loader.js can tell if loaded

// Make the two RHSs, statistical and ringer
function paintAllBellStats(){
  if (ssxState.modelNew == modelCurrent && JSON.stringify(ssxState.rangeNew) == JSON.stringify(rangeCurrent) && !isFirstTime) return;
  if (isFirstTime) {
	createStatsAllTable()
    createStatsRowTable()
    createStatsBelTable()
    createRingerAllTable()
    createRingerBellTable()
    isFirstTime=0
  }

  // Display sd
  iallsdbo.innerHTML  = formatEntryms(TVstd(allttbo,allsebo,nblowsbo));
  iallsdhs.innerHTML  = formatEntryms(TVstd(alltths,allsehs,nblowshs));
  iallsdbs.innerHTML  = formatEntryms(TVstd(allttbs,allsebs,nblowsbs));
  // Display sd percent
  iallspbo.innerHTML  = formatEntrypc(TVstd(allttbo,allsebo,nblowsbo)/allIbgMean);
  iallsphs.innerHTML  = formatEntrypc(TVstd(alltths,allsehs,nblowshs)/allIbgMean);
  iallspbs.innerHTML  = formatEntrypc(TVstd(allttbs,allsebs,nblowsbs)/allIbgMean);
  // Display IBG and HU
  iallibg.innerHTML   = formatEntryms(allIbgMean) + ' ('+formatPealspeed(allIbgMean*(2*nBells-1)/2 + allHsgMean/2) + ' Peal speed)';
  iallmhu.innerHTML   = formatEntryms(allHsgMean);
  iallahsg.innerHTML  = formatEntryms(ttAudibleHsgTotal/nrowshs);
  // Display lead rms
  ialllrmbo.innerHTML = formatEntryms(TVrms(alllsebo,nrowsbo)); 
  ialllrmhs.innerHTML = formatEntryms(TVrms(alllsehs,nrowshs)); 
  ialllrmbs.innerHTML = formatEntryms(TVrms(alllsebs,nrowsbs)); 
  // Display lead sd
  ialllsdbo.innerHTML = formatEntryms(TVstd(alllttbo,alllsebo,nrowsbo));
  ialllsdhs.innerHTML = formatEntryms(TVstd(allltths,alllsehs,nrowshs));
  ialllsdbs.innerHTML = formatEntryms(TVstd(alllttbs,alllsebs,nrowsbs));
  // display lead av error
  ialllavbo.innerHTML = formatEntryms(TVmean(alllttbo,nrowsbo)); 
  ialllavhs.innerHTML = formatEntryms(TVmean(allltths,nrowshs)); 
  ialllavbs.innerHTML = formatEntryms(TVmean(alllttbs,nrowsbs)); 
  // Display errors gt 50ms
  iall50bo.innerHTML  = all50bo;
  iall50hs.innerHTML  = all50hs;
  iall50bs.innerHTML  = all50bs;
  
  // RINGER VIEW OVERALL
  var allsq = TVstd(allttbo,allsebo,nblowsbo)
  irvallsq.innerHTML = formatEntryms(TVstd(allttbo,allsebo,nblowsbo)) + stars(allsq) // Striking Quality = overall SD both strokes
  irvallsr.innerHTML = formatPealspeed(allIbgMean*(2*nBells-1)/2 + ssHsg/nrowsbo/2) // Peal Speed
  irvallhut.innerHTML = sTargetHsg
  irvallhu.innerHTML = formatEntryratio((allHsgMean+TVmean(allhud, nblowsbs))/allIbgMean) + 
                           ' | ' + formatEntryms(TVstd(allhud, allhuds, nblowsbs))
  irvallahsg.innerHTML = formatEntryratio(ttAudibleHsgTotal/nrowshs/allIbgMean) // Audible hsg
  irvall50.innerHTML = all50bo                                          // Errors > 50ms
}

  var upliftreltomodel = Array.from(new Array(nBells),() =>0)

function paintSelectedBellStats(){
  if (ssxState.modelNew==modelCurrent &&ssxState.bnNew==bnCurrent &&JSON.stringify(ssxState.rangeNew)==JSON.stringify(rangeCurrent) &&!isFirstTime)    return
  // Display Bell Number
  if (ssxState.bnNew     >=  0) {
    svbellno.innerText = (ssxState.bnNew+1)
    rvbellno.innerText = (ssxState.bnNew+1)
  }else{
    svbellno.innerText = '(none)'
    rvbellno.innerText = '(none)'
  }

  // Display info for newly selected bell range and model
  if (ssxState.bnNew >=0){
	var bn = ssxState.bnNew;
    // Display bell rms
    ibelrmbo.innerHTML = formatEntryms(TVrms(belsebo[bn],nrowsbo)); 
    ibelrmhs.innerHTML = formatEntryms(TVrms(belsehs[bn],nrowshs)); 
    ibelrmbs.innerHTML = formatEntryms(TVrms(belsebs[bn],nrowsbs));
    // Display bell sd
    ibelsdbo.innerHTML = formatEntryms(TVstd(belttbo[bn],belsebo[bn],nrowsbo));
    ibelsdhs.innerHTML = formatEntryms(TVstd(beltths[bn],belsehs[bn],nrowshs));
    ibelsdbs.innerHTML = formatEntryms(TVstd(belttbs[bn],belsebs[bn],nrowsbs));
    // Display av error
    ibelavbo.innerHTML = formatEntryms(TVmean(belttbo[bn],nrowsbo)); 
    ibelavhs.innerHTML = formatEntryms(TVmean(beltths[bn],nrowshs)); 
    ibelavbs.innerHTML = formatEntryms(TVmean(belttbs[bn],nrowsbs));
    // Display errors gt 50ms  
    ibel50bo.innerHTML = bel50bo[bn];
    ibel50hs.innerHTML = bel50hs[bn];  
    ibel50bs.innerHTML = bel50bs[bn]; 
    // RINGER VIEW
	var belsq = TVrms(belsebo[bn],nrowsbo)
    irvbelsq.innerHTML = formatEntryms(belsq) + stars(belsq)
	irvbel50.innerHTML = bel50bo[bn]; 
	irvbelmean.innerHTML = formatEntrymsearlylate(TVmean(belttbo[bn],nrowsbo))
    irvbelhu.innerHTML = formatEntryratio((allHsgMean+belhud[bn]/nrowsbs)/allIbgMean)+' | '+
	                     formatEntryms(TVstd(belhud[bn],belhuds[bn],nrowsbs))
    irvbelsdh.innerHTML = formatEntryms(TVstd(beltths[bn],belsehs[bn],nrowshs));
    irvbelsdb.innerHTML = formatEntryms(TVstd(belttbs[bn],belsebs[bn],nrowsbs));
	
	// Lead rows for selected bell
    if (nlrowsbo[bn]>0){    
      ibellsdbo.innerHTML= formatEntryms(TVstd(bellttbo[bn],bellsebo[bn],(nlrowsbo[bn]-1)));
      ibellsdhs.innerHTML= formatEntryms(TVstd(belltths[bn],bellsehs[bn],(nlrowshs[bn]-1)));
      ibellsdbs.innerHTML= formatEntryms(TVstd(bellttbs[bn],bellsebs[bn],(nlrowsbs[bn]-1)));
      ibellrmbo.innerHTML= formatEntryms(TVrms(bellsebo[bn],nlrowsbo[bn])); 
      ibellrmhs.innerHTML= formatEntryms(TVrms(bellsehs[bn],nlrowshs[bn])); 
      ibellrmbs.innerHTML= formatEntryms(TVrms(bellsebs[bn],nlrowsbs[bn])); 
      ibellavbo.innerHTML= formatEntryms(bellttbo[bn]/nlrowsbo[bn]); 
      ibellavhs.innerHTML= formatEntryms(belltths[bn]/nlrowshs[bn]); 
      ibellavbs.innerHTML= formatEntryms(bellttbs[bn]/nlrowsbs[bn]); 
    } else{ // Clear the selected bell at lead analysis fields if bell did not lead
      ibellsdbo.innerHTML= '-';
      ibellsdhs.innerHTML= '-';
      ibellsdbs.innerHTML= '-';
      ibellrmbo.innerHTML= '-';
      ibellrmhs.innerHTML= '-';
      ibellrmbs.innerHTML= '-';
      ibellavbo.innerHTML= '-';
      ibellavhs.innerHTML= '-';
      ibellavbs.innerHTML= '-';    
    }      
  } else{ // Clear all selected bell analysis fields
    ibelsdbo.innerHTML= '-';
    ibelsdhs.innerHTML= '-';
    ibelsdbs.innerHTML= '-';
    ibelrmbo.innerHTML= '-';
    ibelrmhs.innerHTML= '-';
    ibelrmbs.innerHTML= '-';
    ibelavbo.innerHTML= '-';
    ibelavhs.innerHTML= '-';
    ibelavbs.innerHTML= '-';
    ibel50bo.innerHTML= '-';
    ibel50hs.innerHTML= '-';
    ibel50bs.innerHTML= '-';
    ibellsdbo.innerHTML= '-';
    ibellsdhs.innerHTML= '-';
    ibellsdbs.innerHTML= '-';
    ibellrmbo.innerHTML= '-';
    ibellrmhs.innerHTML= '-';
    ibellrmbs.innerHTML= '-';
    ibellavbo.innerHTML= '-';
    ibellavhs.innerHTML= '-';
    ibellavbs.innerHTML= '-';
	
	irvbelsq.innerHTML = '-'
    irvbel50.innerHTML = '-'
	irvbelmean.innerHTML = '-'
	irvbelhu.innerHTML = '-'
    irvbelsdh.innerHTML = '-'
    irvbelsdb.innerHTML = '-'
  }
  totuplift = 0
  for (i=0;i<nBells;i++){totuplift +=upliftreltomodel[i]}
}

function paintModelName(){
  if (ssxState.modelNew == modelCurrent && !isFirstTime) return; 
  // paint modelname on RHS
  rhsmodel.innerHTML = svModelnames[ssxState.modelNew]  
}

function paintCurrentRowStats(isAnimate){
  if (!isAnimate){
    if (ssxState.rnNew == rnCurrent) return
    if (ssxState.rnNew ==-1){      // If no rn clear the fields
      selrow.innerText  = '(none)' // Row number
      irowfau.innerHTML = '-'      // Faults measured by looking at gaps
	  irowcr.innerHTML = '-'
      return
    }
  }
  var rowfau = 0;
  var ibg = allIbgMean
  for (bi=ssxState.rnNew*nBells+1 ; bi<(1+ssxState.rnNew)*nBells ; bi++){
    gap = tiActByRp[bi]-tiActByRp[bi-1];
    if (gap<ibg*.25){rowfau+=3;}
    else if (gap<ibg*.5){rowfau+=2;}
    else if (gap<ibg*.75){rowfau+=1;}
  }
  irowfau.innerHTML = Math.min(6,rowfau);  //Faults
  irowcr.innerHTML = (ssxState.rnNew+1);  // Current row number
  
}

if(1){
  precTables=10; // normal precision
}else{
   precTables=10000; // high precision for testing
}

function formatEntryms(v){
  return Math.round(v*precTables)/precTables+'ms';  // 1 decimal place
}

function formatEntrypc(v){
  var qqq,absqqq,signqqq
  qqq = Math.round(100*v*10)/10; // 1 decimal place
  absqqq = Math.abs(qqq)
  signqqq = '-+'[(Math.sign(v)+1)/2]
  return qqq+'%'
}

function stars (ms){
  var mult, maxstars, ss, nstars
  maxstars = 7
  mult = 1.17
  ss = 20
  nstars=0
  for (i=0; i<maxstars; i++){
    if (ms<ss) nstars++
    ss = ss*mult
  }
  st='<img src="' +tvLoc+ 'iconstar.png" alt="[derivation]">'
  allstars=''
  for (i=0 ; i<nstars ; i++){
    allstars = allstars + st
  }
  return allstars
} 

function formatEntrypcpm(v){
  var qqq,absqqq,signqqq
  qqq = Math.round(100*v*10)/10; // 1 decimal place
  absqqq = Math.abs(qqq)
  signqqq = '-+'[(Math.sign(v)+1)/2]
  return signqqq+absqqq+'%'
}

function formatEntrymsearlylate(v){
  var qqq,absqqq,signqqq
  qqq = Math.round(v*precTables)/precTables;  // 1 decimal place  absqqq = Math.abs(qqq)
  absqqq = Math.abs(qqq)
  signqqq = [' early',' late'][(Math.sign(v)+1)/2]
  return absqqq+'ms'+signqqq
}

function formatEntryratio(v){
  return Math.round(v*100)/100; // 2 decimal places
}

function formatPealspeed (msRowTime){
    mmPealTime = Math.round(msRowTime*5040/60000);
    hh = Math.floor(mmPealTime/60);
    mm = mmPealTime-hh*60;
    return ''+hh+'h'+mm;
}

function createStatsAllTable(){
  makestatsrow(all, "sd",   "hba",  
      "Standard Deviation",
      "The selected model predicts an 'ideal' time for each blow. These fields display the <a href='https://en.wikipedia.org/wiki/Standard_deviation' target='_blank'>Standard Deviation</a> of the differences between the ideal and actual times",     
      "This is a secondary measure of ringing quality that may be used in the National 12-bell contest. Lower numbers are better.");
  makestatsrow(all, "sp", "hba", "Standard Deviation %",   
      "The selected model predicts an 'ideal' time when each blow should be struck. These fields display the <a href='https://en.wikipedia.org/wiki/Standard_deviation' target='_blank'>Standard Deviation</a> of the differences between the ideal and actual times as a percentage of the interbell gap.",     
      "When the Contest model is selected the figure in the 'Both' column is the main measure of ringing quality used in the National 12-bell contest as it is deemed the best measure of overall striking quality. Lower numbers are better. ");
  makestatsrow(all, "ibg",  "other", "Inter-Bell Gap",  "The selected model computes the ideal Inter-Bell Gap for each wholepull. This field shows the average over the selected rows", "This is a measure of speed of ringing");
  makestatsrow(all, "mhu",  "other", "Handstroke uplift", 
      "This is the amount handstrokes are lifted to give the handstroke gap. This field shows the average uplift for all bells and all rows. It is calculated differently according to the model", 
	  "This is the most meaningful indicator of the average handstroke gap, and should be close to 2 times the interbell gap for pleasant-sounding ringing");
  makestatsrow(all, "ahsg",  "other", "Audible Handstroke Gap", 
      "This is the average time between the last blow at backstroke and the next blow at handstroke. It is a poor measure of the underlying handstroke uplift because it depends only on the leading and lying bells and can be unduly influenced", "If significantly different from the Model Handstroke Gap bells may be having problems with leading and lying, for example the bells in last place at backstroke may be frequently late. This is however a common characteristic of 12-bell ringing");
  makestatsrow(all, "50", "hba", "Errors over 50ms",   
      "The selected model predicts an 'ideal' time when each blow should be struck. The differences between the ideal and actual times are calculated for each blow and the numbers of errors over 50ms are counted.",     
      "");
  makestatsrow(all, "xx",   "subtitle", "Leading",    "", "");
  makestatsrow(all, "lrm",   "hba",   "Lead RMS Error",      
      "The selected model predicts an 'ideal' time when each blow should be struck. The differences between the ideal and actual times are calculated for each blow. The Root Mean Square Error is a measure of the inaccuracy of lead blows", "");
  makestatsrow(all, "lsd",   "hba",   "Lead Standard Deviation",      
      "The selected model predicts an 'ideal' time when each blow should be struck. The differences between the ideal and actual times are calculated for each blow. The <a href='https://en.wikipedia.org/wiki/Standard_deviation' target='_blank'>Standard Deviation</a> of these differences is calculated.",
      "The amount of randomness in the blow times compared to the ideal.");
  makestatsrow(all, "lav",   "hba",   "Lead Average Error",       
      "The model predicts an 'ideal' time when each blow should be struck. The actual times are subtracted from the ideal times to give an error for each blow and the errors are averaged.", 
      "Some ringers are habitually late or early, which is often something they will correct when it's pointed out. Note that average errors can also accumulate if microphone is close to some bells and far from others so careful listening is needed to see if the error really exists. Average errors less than 15ms are not worth worrying about.", "");
}

function createStatsBelTable(){
  makestatsrow(bel, "rm",   "hba",   "RMS Error",      
      "The selected model predicts an 'ideal' time when each blow should be struck. The differences between the ideal and actual times are calculated for each blow.","A measure of the negative impact of this bell on the overall striking. Lower numbers are better");
  makestatsrow(bel, "sd",   "hba",   "Standard Deviation",      
      "The selected model predicts an 'ideal' time when each blow should be struck. The differences between the ideal and actual times are calculated for each blow. The <a href='https://en.wikipedia.org/wiki/Standard_deviation' target='_blank'>Standard Deviation</a> of these differences is calculated.",
      "The amount of randomness in the blow times compared to the ideal.", "");
  makestatsrow(bel, "av",   "hba",   "Average Error",       
      "The model predicts an 'ideal' time when each blow should be struck. The actual times are subtracted from the ideal times to give an error for each blow and the errors are averaged.", "");
  makestatsrow(bel, "50",   "hba", "Errors over 50ms",       
      "The selected model predicts an 'ideal' time when each blow should be struck. The differences between the ideal and actual times are calculated for each blow and the numbers of errors over 50ms are counted.", "");
  makestatsrow(bel, "xx",   "subtitle","Leading",    "", "");
  makestatsrow(bel, "lrm",   "hba",   "Lead RMS Error",      
      "The selected model predicts an 'ideal' time when each blow should be struck. The differences between the ideal and actual times are calculated for each blow. The Root Mean Square Error is a measure of the negative impact of this bell on the overall striking. Lower numbers are better", "");
  makestatsrow(bel, "lsd",   "hba",   "Lead Standard Deviation",      
      "The selected model predicts an 'ideal' time when each blow should be struck. The differences between the ideal and actual times are calculated for each blow. The <a href='https://en.wikipedia.org/wiki/Standard_deviation' target='_blank'>Standard Deviation</a> of these differences is calculated.", "");
  makestatsrow(bel, "lav",   "hba",   "Lead Average Error",       
      "The model predicts an 'ideal' time when each blow should be struck. The actual times are subtracted from the ideal times to give an error for each blow and the errors are averaged.", "");
  
}

function createStatsRowTable(){
  makestatsrow(row, "cr",   "other", "Row",    "", "");
  makestatsrow(row, "fau",  "other", "Faults", "Here HawkEar is marking rows by counting faults. Two bells striking less than 75% of the correct interval apart count 1 fault, less than 50% of the correct interval count as 2 faults and less than 25% of the correct interval count as 3 faults up to a maximum of 5 faults per row. ", "Listen to the ringing and give a score per row between 0 (best) and 5 (worst). HawkEar's score is displayed briefly when the row finishes to allow you to compare.");
}

function createRingerAllTable(){
  makestatsrow(rvall, "sq", "other", "Band Striking Quality", "", "Seven stars - Never been done!<br>Five to six stars - Excellent.<br>Four stars - Very good.<br>Three stars -Good.<br>Two stars - Not too bad.<br>One star - You're on the way.<br>No stars - Oh dear!")
  makestatsrow(rvall, "sr", "other", "Peal Speed", "", "The speed may have varied during the ringing but this is the average")
  makestatsrow(rvall, "hut", "other", "Handstroke Uplift Target", "", "The target amount handstrokes should be are held up. A band should agree on a target and aim for it. Errors are reported against the target.")
  makestatsrow(rvall, "hu", "other", "Handstroke Uplift Actual", "", "The average amount over the touch and for all bells that handstrokes were held up.")
  makestatsrow(rvall, "ahsg", "other", "Audible Handstroke Gap", "", "Average over the touch of the gaps between the last blow of one wholepull and first blow of the next")
  makestatsrow(rvall, "50", "other", "Errors over 50ms", "", "")
}

function createRingerBellTable(){
  makestatsrow(rvbel, "xx", "subtitle", "Overall error", "", ""); ////////////////////
  makestatsrow(rvbel, "sq", "other",    "Individual Striking Quality", "", "Seven stars - Never been done!<br>Five to six stars - Excellent.<br>Four stars - Very good.<br>Three stars -Good.<br>Two stars - Not too bad.<br>One star - You're on the way.<br>No stars - Oh dear!")
  makestatsrow(rvbel, "50", "other",    "Errors over 50ms", "", "")
  makestatsrow(rvbel, "xx", "subtitle", "Error breakdown", "", ""); 
  makestatsrow(rvbel, "mean", "other",  "On average", "", "The average amount you were quick or slow. Less than 15ms is very good. This number can be influenced by the relative distances between ringer bell and microphone. For example in a tower with a single bell 5 feet above the others that bell could be 10 feet closer to the microphone than the ringer.In consequence this number would be 10ms higher than it would have been. Note that individual striking quality would be little affected as the average error is only one element in the overall error.")
  makestatsrow(rvbel, "hu", "other",    "Handstroke Uplift", "", "The amount you held up your handstrokes.")
  makestatsrow(rvbel, "sdh", "other",   "Random error at hand", "", "A measure of the random errors at handstroke for this bell. Random errors are usually caused by difficulty in handling the bell or handling style, but can also be caused by method uncertainty.")
  makestatsrow(rvbel, "sdb", "other",   "Random error at back", "", "A measure of the random errors at backstroke for this bell. Random errors are usually caused by difficulty in handling the bell or handling style, but can also be caused by method uncertainty.")
}

function  makestatsrow(theTable, idRow, sRowFormat, htmlRowLabel, htmlDerive, htmlLearn){
  // Creates the DOM elements for a row of statistics on the RHS of the striking graph.
  // Row consists of text label, derivation helptip, significance helptip, table data
  // id of <td> items are i (all/bel/row) Row(sd/av/50/rm) col(hs/bs/bo/xx) eg "iallsdhs"
  // Parameters:
  //   - thetable:     Which table (rall, rbel) which are defined in html in index.html
  //   - idRow:        ID of row (sq/ps/hu/50)
  //   - sRowFormat:   Format of row (Other)
  //   - htmlRowLabel: Row label text
  //   - htmlDerive:   Helptext describing how the row is derived
  //   - htmlLearn:    Helptext describing how to learn from this
  // FieldIds for the values to be inserted are:
  //   - idTable+idRow+[Hs|Bs|Al]

  var mytr;
  var myth;
  var mytd;
  var mydiv;
  var myspan;
  mytbody = theTable.tBodies[0];
  
  //<tr>
  mytr = document.createElement("tr"); mytbody.appendChild(mytr);
  
  //  <th>htmlRowLabel
  myth = document.createElement("th"); mytr.appendChild(myth);
  if (sRowFormat == 'subtitle'){
    myth.setAttribute("align", "left");
    myth.innerHTML = htmlRowLabel+' ';
	myth.setAttribute("style", "width:200px; background-color: #E8E8E8");
    myth.setAttribute("colspan","5");
  }else{
    myth.setAttribute("align", "left");
	myth.setAttribute("style", "width:200px; padding-left:15px");
    myth.innerHTML = htmlRowLabel+' ';
	if (htmlDerive.length>0){ // For derivation help
      mydiv = document.createElement("div"); myth.appendChild(mydiv);
      mydiv.setAttribute("class","helptip");
      //      <img src="iconderive.png" alt="[derivation]">
      myimg = document.createElement("img"); mydiv.appendChild(myimg);
      myimg.setAttribute("src",tvLoc+"iconderive.png");
      myimg.setAttribute("alt","[derivation]");
      myimg.setAttribute("class", "helpiconclass");
      //      <span class="helptiptext">
      myspan = document.createElement("span"); mydiv.appendChild(myspan);
      myspan.setAttribute("class","helptiptext");
      myspan.innerHTML = htmlDerive;
	} if (htmlDerive.length > 0 && htmlLearn.length > 0){ // whitespace between icons
      wsp=document.createElement("text");
      mydiv.appendChild(wsp);
      wsp.innerHTML='&nbsp;';
	} if (htmlLearn.length > 0){ // For learning help
      mydiv = document.createElement("div"); myth.appendChild(mydiv);
      mydiv.setAttribute("class","helptip");    
      //      <img src="iconlearn.png" alt="[learn]">
      myimg = document.createElement("img"); mydiv.appendChild(myimg);
      myimg.setAttribute("src", tvLoc+"iconlearn.png");
      myimg.setAttribute("alt", "[learn]");
      myimg.setAttribute("class", "helpiconclass");
      //      <span class="helptiptext">
      myspan = document.createElement("span"); mydiv.appendChild(myspan);
      myspan.setAttribute("class","helptiptext");
      myspan.innerHTML = htmlLearn;
	}
  }
  /////////
  // id of <td> items are i Table(all/bel/row) Row(sd/av/50/rm) col(hs/bs/bo/'') eg "iallsdhs"
  if (sRowFormat == 'other'){
    mytd=document.createElement("td"); mytr.appendChild(mytd);
    mytd.setAttribute("id", 'i'+theTable.id+idRow);
    mytd.setAttribute("style", "width: 218px");
    mytd.setAttribute("colspan","3");
    mytd.style.borderWidth=0;
    mytd.innerHTML = '?';
  } else if (sRowFormat == 'hba') {
    mytd=document.createElement("td"); mytr.appendChild(mytd);
    mytd.setAttribute("id",  'i'+theTable.id+idRow+"bo");
    mytd.setAttribute("style", "width:70px;");
    mytd.style.borderWidth=0;
    mytd.innerHTML = '?';
    mytd=document.createElement("td"); mytr.appendChild(mytd);
    mytd.setAttribute("id",  'i'+theTable.id+idRow+"hs");
    mytd.setAttribute("style", "width:70px;");
    mytd.style.borderWidth=0;
    mytd.innerHTML = '?';
    mytd=document.createElement("td"); mytr.appendChild(mytd);
    mytd.setAttribute("id",  'i'+theTable.id+idRow+"bs");
    mytd.setAttribute("style", "width:70px;");
    mytd.style.borderWidth=0;
    mytd.innerHTML = '?';
  }
}
