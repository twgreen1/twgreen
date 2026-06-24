var StatisticsJs = true; // so that loader.js can tell if loaded

function calcStats(){  // Calculates Overall statistics and per bell statistics for all bells
  if (ssxState.modelNew == modelCurrent && JSON.stringify(ssxState.rangeNew) == JSON.stringify(rangeCurrent) && !isFirstTime) return

  // Init accumulators
  ssIbg = 0; // Total IBG in the range
  ssHsg = 0; // Total HSG in the range
  allttbo=0; // Total(errors)
  alltths=0;
  allttbs=0;
  allsebo=0; // Total(errors squared)
  allsehs=0;
  allsebs=0;
  all50bo=0; // Total(errors>50ms)
  all50hs=0;
  all50bs=0;
  allhud =0; // Total(handstroke uplifts)
  allhuds=0; // Total(handstroke uplifts squared)
  belttbo=Array.from(new Array(nBells), () => 0); // Total(errors)
  beltths=Array.from(new Array(nBells), () => 0);
  belttbs=Array.from(new Array(nBells), () => 0);
  belsebo=Array.from(new Array(nBells), () => 0); // Total(errors squared)
  belsehs=Array.from(new Array(nBells), () => 0);
  belsebs=Array.from(new Array(nBells), () => 0);
  bel50bo=Array.from(new Array(nBells), () => 0); // Total(errors>50ms)
  bel50hs=Array.from(new Array(nBells), () => 0);
  bel50bs=Array.from(new Array(nBells), () => 0);
  belhud =Array.from(new Array(nBells), () => 0); // Total(handstroke uplifts)
  belhuds=Array.from(new Array(nBells), () => 0); // Total(handstroke uplifts squared)

  // TOTALS FOR THE LEADING BELL
  alllttbo=0; // Lead Total (error)
  allltths=0;
  alllttbs=0;
  alllsebo=0; // Lead Total (error squared)
  alllsehs=0;
  alllsebs=0;
  bellttbo=Array.from(new Array(nBells), () => 0); // Lead Total (error)
  belltths=Array.from(new Array(nBells), () => 0);
  bellttbs=Array.from(new Array(nBells), () => 0);
  bellsebo=Array.from(new Array(nBells), () => 0); // Lead Total (error squared)
  bellsehs=Array.from(new Array(nBells), () => 0);
  bellsebs=Array.from(new Array(nBells), () => 0);
  nlrowsbo=Array.from(new Array(nBells), () => 0); // Count of Lead Blows
  nlrowshs=Array.from(new Array(nBells), () => 0);
  nlrowsbs=Array.from(new Array(nBells), () => 0);
  var prevtths = Array.from(new Array(nBells), () => NaN);
  bnPosFirst = Array.from(new Array(nRowsInPiece),  () => -1);

  rnRange = [ssxState.rangeNew.rows[0], ssxState.rangeNew.rows[1]] // zero-origin, so even numbered rows are handstrokes
  nrowsbo = rnRange[1] - rnRange[0] +1;
  var asd = Math.floor(nrowsbo/2) ; // base number of hs and bs rows 
  if (nrowsbo%2 != 0){ // if odd number of rows in range
      nrowshs = asd + 1-rnRange[1]%2; // extra row if last row is a handstroke
      nrowsbs = asd +   rnRange[1]%2; // extra row if last row in range is a backstroke
  }else{
      nrowshs = asd;
      nrowsbs = asd;
  } 
  nblowsbo = nrowsbo*nBells;
  nblowshs = nrowshs*nBells;
  nblowsbs = nrowsbs*nBells;

  ttAudibleHsgTotal = 0;
  for (var rn=rnRange[0]; rn<=rnRange[1]; rn++){
	if (rn%2==0){
      ttAudibleHsgTotal += tiActByRp[rn*nBells]-tiActByRp[rn*nBells-1];
    }
    ssIbg+=ttIbgByModelRn[ssxState.modelNew][rn];
    ssHsg+=ttHsgByModelRn[ssxState.modelNew][rn];
    var tiLead = Infinity;
    var tiLie  = -Infinity;
    for (var bn=0; bn<nBells; bn++){
      var ti = tiActByRb[rn*nBells+bn];
      var tt = ti - tiIdealByModelRb[ssxState.modelNew][rn*nBells+bn];
      var tt50 = 0+(Math.abs(tt)>50);
      if (tiLead >= ti) { // find first blow
        tiLead = ti;
        bnPosFirst[rn] = bn;
      }
      
	  // could miss these out and just add the hs and bs equivalents when displaying, ie in rhs.js
      belttbo[bn] += tt;
      belsebo[bn] += tt**2;
      bel50bo[bn] += tt50;
      if (rn%2 == 0){   // if handstroke 
        alltths     += tt;
        allsehs     += tt**2;
        all50hs     += tt50;
        beltths[bn] += tt;
        belsehs[bn] += tt**2;
        bel50hs[bn] += tt50;
		prevtths[bn] = tt;
      }else{
        allttbs     += tt;
        allsebs     += tt**2;
        all50bs     += tt50;
        belttbs[bn] += tt;
        belsebs[bn] += tt**2;
        bel50bs[bn] += tt50;
		// don't include if first row is at backstroke. (Last row at hand will be ignored automatically)
		if (!isNaN(prevtths[bn])){
		  allhud      += (prevtths[bn]-tt)
		  allhuds     += (prevtths[bn]-tt)**2
		  belhud[bn]  += (prevtths[bn]-tt)
		  belhuds[bn] += (prevtths[bn]-tt)**2
		}
      }
    }

    // collect data for first blow of row 
    bnLead = bnPosFirst[rn];     // pick out the lead bell for the row
    biLead = rn*nBells+bnLead;       //pick out the blow index in Rb matrix for the lead blow of the row
    if (tiActByRp[rn*nBells] != tiActByRb[biLead]){
      //alert('First Error rn:'+rn+ 'bnLead:'+bnLead); // detect if conflict with the Rp matrix
    }
    var tt = tiActByRb[biLead] - tiIdealByModelRb[ssxState.modelNew][biLead];
    alllttbo         += tt;
    alllsebo         += tt**2;
    bellttbo[bnLead] += tt;
    bellsebo[bnLead] += tt**2;
    nlrowsbo[bnLead] ++;       // Count of all this bell's leads
    if (rn%2 == 0){       // if handstroke 
      allltths         += tt;
      alllsehs         += tt**2;
      belltths[bnLead] += tt;
      bellsehs[bnLead] += tt**2;
      nlrowshs[bnLead] ++;       // Count of this bell's hs leads
    }else{
      alllttbs         += tt;
      alllsebs         += tt**2;
      bellttbs[bnLead] += tt;
      bellsebs[bnLead] += tt**2;
      nlrowsbs[bnLead] ++;       // Count of this bell's bs leads
    }
  }
  // Build up the "all" accumulators from the bell accumulators
  // (This is not complete yet but worth doing for longer touches)
  allttbo = alltths + allttbs
  allsebo = allsehs + allsebs
  all50bo = all50hs + all50bs
  allIbgMean = ssIbg/nrowsbo
  allHsgMean = ssHsg/nrowsbo
}

// Touch Viewer functions to calculate std, mean and rms 
// given sx   - sum of the values
//       ssqx - sum of the squares of the values
//       lx   - number of values
function TVstd (sx, ssqx, lx){ 
  return Math.sqrt((ssqx-sx**2/lx)/(lx-1))
}
function TVmean(sx, lx){
  return sx/lx
}
function TVrms(ssqx, lx){
  return Math.sqrt(ssqx/lx)
}
