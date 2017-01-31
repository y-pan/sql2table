/**string of h1,h2,'h3,33',h4 => array of [h1,h2,'h3,33',h4]*/
function str2arr(string,delim=','){
	var arr = string.split(delim); var arr2 = []; var strBuilder = "";
	for(var i=0,len=arr.length; i<len; i++){
		if(arr[i].startsWith("'")){
			if(arr[i].endsWith("'") && arr[i].length>1){ arr2.push(arr[i]); }			
			else{	strBuilder=arr[i]; i++; if(i<arr.length){ strBuilder+=delim+arr[i];}	
				while(!strBuilder.endsWith("'") && ++i<arr.length){ strBuilder+=delim+arr[i]; }
				arr2.push(strBuilder); strBuilder="";
			}
		}
		else if(arr[i].startsWith("to_timestamp(")){ strBuilder+=arr[i];
			while(!strBuilder.endsWith(")") && ++i<arr.length){ strBuilder+=delim+arr[i]; }
			arr2.push(strBuilder); strBuilder=""; 
		}
		else{ arr2.push(arr[i]); }
	}
	return arr2;
}
/**array of [h1,h2,'h3,33',h4] => html of <th>h1</th><th>h2</th><th>'h3,33'</th><th>h4</th>  or <td>h1</td><td>h2</td><td>'h3,33'</td><td>h4</td> */
function arr2cells(array,type='r',dataId){
	var htm="";	switch(type){case 'h': for(var i=0, len=array.length;i<len;i++){htm+='<th data-id='+dataId+' data-cid='+i+'>'+array[i]+'</th>'};break;
							 case 'r': for(var i=0,len=array.length; i<len; i++){htm+='<td data-id='+dataId+' data-cid='+i+'>'+array[i]+'</td>'};break; 
							 default:break;}	
	return htm;
}
function cleanBracketString(string){
	var stringBuilder=string.toString().trim();	stringBuilder=stringBuilder.replace(/[()]/g, "");
 	return stringBuilder.toString().trim();
}
function log(str1,str2){ 
	if(str2){
		console.log(str1 + " : " + str2);
	}else{
		console.log(str1); 
	}
	
}


/**
assume that always parsing complete sql statement(s)
Usage: sqlParser.parse(sqlstring) -> get properties: sqlParser.sqlCommand (others like: tableName,hColumns,rColumns)*/
function sqlParser(){ 
	this.insertPtn = /^INSERT\s{1,}INTO\s.*[)]\s*VALUES\s*[(].*$/i;
  	this.commandInsertHeadPtn=/^INSERT\sINTO\s*/i;
	this.tableNamePtn=/^[^,]+[(]/g;
	this.commandMidValuesPtn = /[)]\s*VALUES\s*[(]/gi;
	this.commandEndPtn = /[)][;]\s*$/g;

	this.id=0;
	this.nextId = function(){ return ++this.id }

	this.parseStr2Json = function(sqlString){
  	if(this.insertPtn.test(sqlString)){
  		var id = this.nextId();
    	var com,tname,hCols,rCols,hArr,rArr,json;
        
	  	com = sqlString.match(this.commandInsertHeadPtn);
	  	var tableName_NRest = sqlString.substring(com.toString().length);
	  	tname = tableName_NRest.match(this.tableNamePtn);

	  	var hColumns_NRest = tableName_NRest.substring(tname.toString().length);
	  	this.commandMidValuesPtn.test(hColumns_NRest)
	  	hCols = hColumns_NRest.substring(0,this.commandMidValuesPtn.lastIndex)
	  	rCols = hColumns_NRest.substring(this.commandMidValuesPtn.lastIndex)

	  	var lenToDump = hCols.match(this.commandMidValuesPtn).toString().length
	  	var hlen = hCols.toString().length;
	  	hCols = hCols.toString().substring(0, hlen-lenToDump).trim();        	

	  	var lenToDump = rCols.match(this.commandEndPtn).pop().toString().length;
	  	var rlen = rCols.toString().length;
	  	rCols = rCols.toString().substring(0,rlen-lenToDump).trim();

	  	com = com.toString().trim();
	  	tname = cleanBracketString(tname); 

	  	hArr = str2arr(hCols,','); rArr = str2arr(rCols,',');

	  	return {"id":id,"tname":tname,"command":com,"hArray":hArr,"rArray":rArr}

  	}else{
  		return null;
  	}
  }
}// ***endOf sqlParser

function arrayHasItem(arr,item){
	var it = item.toLowerCase();
	for(var i=0, len=arr.length; i<len; i++){
		if(arr[i].toLowerCase() == it) return true;
	}
	return false;
}

function sqlRecorder(){
	this.records=[]; //{"id":id,"tname":tname,"command":com,"hArray":hArr,"rArray":rArr}
	// 

	this.temp=[];

	this.init = function(){ this.records.length=0; this.temp.length=0;}

	this.searchTName = function(tname){
		// get search and store in temp array
		if(tname.length>0){
			var tname = tname.toLowerCase();
			this.temp.length=0;
			for(var i=0,len=this.getSize(); i<len; i++){
				var item = this.records[i];
				if(item.tname.toLowerCase() == tname) { this.temp.push(item); }
			}
			return this.getAllHtms(this.temp);
		}else{
			return this.getAllHtms();
		}
	}

	this.searchCName = function(cname){
		if(cname.length>0){
			var cname = cname.toLowerCase();
			this.temp.length=0;
			for(var i=0,len=this.getSize(); i<len; i++){
				var item = this.records[i];
				var cnames = item.hArray;
				if(arrayHasItem(cnames,cname)) { this.temp.push(item); }
			}
			return this.getAllHtms(this.temp);
		}else{
			return this.getAllHtms();
		}
	}

	this.addJson2List = function(json){
		if(json){this.records.push(json);return 1; }else{return null};
	}

	this.getIndexById = function(id){
		if(this.getSize() <=0 ) return null;

		for(var i=0, len=this.getSize();i<len;i++){  if(this.records[i].id==id){return i;}  };return null;
	}
	//	this.getLastJson = function(){ return this.records[this.records.length-1]; }
	this.getLastHtms = function(){
		if(this.getSize() <=0 ) return null;
		return this.getHtmsByIndex(this.records.length-1);
	}
	this.getHtmsByIndex = function(i,arr=null){
		var array;
		if(Array.isArray(arr)){ 
			if(arr.length <= 0){return null; } else { array=arr;  }
			
		} 
		else { array=this.records; }

		var len = array.length
		if(len <=0 || len <= i || isNaN(i) || i < 0) { log("wrong index");return null;}

		var rc=array[i];
		var idx = rc.id;
	  	var com = rc.command;
	  	var tname = rc.tname;
	  	var rhtm = arr2cells(rc.rArray,'r',idx);
	  	var hhtm = arr2cells(rc.hArray,'h',idx);
	  	//htmr="<tr data-id="+idx+" class='responsable'><td data-id="+idx+" data-cid='-2' class='tbcomm'>"+com+"</td><td data-id="+idx+" data-cid='-1' class='tbname hidden'>"+tname+"</td>"+rhtm+"</tr>";
	  	//htmh="<tr data-id="+idx+" class='responsable'><th data-id="+idx+" data-cid='-2' class='hidden'>"+com+"</th><th data-id="+idx+" data-cid='-1' class='tbname'>"+tname+"</th>"+hhtm+"</tr>";
		htmr="<tr data-id="+idx+" class='responsable'><td data-id="+idx+" data-cid='-2' class='tbcomm headCell'>"+com+"</td><td data-id="+idx+" data-cid='-1' class='tbname alwaysHidden'>"+tname+"</td>"+rhtm+"</tr>";
	  	htmh="<tr data-id="+idx+" class='responsable'><th data-id="+idx+" data-cid='-2' class='alwaysHidden'>"+com+"</th><th data-id="+idx+" data-cid='-1' class='tbname headCell'>"+tname+"</th>"+hhtm+"</tr>";
		
		return [htmh,htmr];
  }
  this.getAllHtms = function(arr=null){
  	var array, result = [];
  	if(arr) { array = arr } else { array = this.records;}
  	
  	for(var i=0,len=array.length; i<len; i++){
  		result.push(this.getHtmsByIndex(i)); 
  	}
  	return result;
  }
  /*
  this.getItem = function(i){
  	//if(i>= this.getSize())
  	return this.records[i];
  }*/
  this.getSize = function(){
  	return this.records.length;
  }

} // ***endOf sqlRecorder

function cellTracker(){

	this.cell;
	this.d_id;
	this.d_cid;

	this.onClass = "cellOn"; // to be add to cell to show tracked/selected
	this.x;
	this.y;
	this.w;
	this.h;
	this.text;

	this.isOpen;
	this.keepOpen=false; // when editing/inserting/deleting, keepOpen=true, and shouldn't be interupted. only
	this.close = function(){
		this.keepOpen = false;
		this.showHideMenue();
	}
	this.cellOnOff = function(isToBeOn){
		if(this.keepOpen){ return null; }
		if(!this.cell){ return null; }

		if(isToBeOn){
			if(!this.cell.classList.contains(this.onClass)) {this.cell.classList.add(this.onClass);}
			this.isOpen=true;
		}else{
			if(this.cell.classList.contains(this.onClass)) {this.cell.classList.remove(this.onClass);}
			this.isOpen=false;
		}		
	}
	this.popupOnOff = function(isToBeOn){
		if(this.keepOpen){ return null; }
		if(!this.cell){ return null; }
		var menu=document.getElementById("popupTrackerMenu");
		if(!menu){ return null; }

		if(isToBeOn){
			if(!menu.classList.contains("popupOn")){menu.classList.add('popupOn');}
			menu.style.left = this.x+document.documentElement.scrollLeft+'px';
			menu.style.top = this.y+this.h+document.documentElement.scrollTop+'px';
			//$(window).height(); 
		}else{
			if(menu.classList.contains("popupOn")){menu.classList.remove('popupOn');}
		}		
	}

	this.reset = function(){
		/*this.cellOnOff(false);*/
		this.x="";
		this.y="";
		this.w="";
		this.h="";
		this.text="";
		this.cell="";
		this.d_id="";
		this.d_cid="";
	}
	this.trackCell = function(d_id,d_cid){
		
		if(this.keepOpen){ return null; }

		this.cellOnOff(false);
		this.popupOnOff(false);
		if(this.d_id == d_id && this.d_cid == d_cid){
			this.reset();

		}else{
			this.reset();
			this.d_id=d_id;
			this.d_cid=d_cid;

			var cells = getTrByAtt('data-id',this.d_id).childNodes;
			for(var i=0,len=cells.length; i<len; i++){
				if(cells[i].getAttribute('data-cid')==this.d_cid) {
					var rect = cells[i].getBoundingClientRect();
					this.x=rect.left;
					this.y=rect.top;
					this.w=rect.right-rect.left;
					this.h=rect.bottom-rect.top;
					this.text=cells[i].innerText;				
					this.cell=cells[i];
					i=+cells.length
				}
			}
			if(this.cell){ this.cellOnOff(true); this.popupOnOff(true); }
		}		
	}
} // *** endof cellTracker


/**data-id for each row/tr is unique: 3h,3r*/
function getTrByAtt(attrName='data-id',attrValue){
	var rows=document.getElementsByTagName('TR');
	for(var i=0,len=rows.length;i<len;i++){ if(rows[i].getAttribute(attrName)==attrValue) return rows[i] }
	return null;
}


function arraylise(string){
    var array=[];
    var str = string.toString();
    for(var i=0,len=str.length; i<len; i++){
        array.push(str.substring(i,i+1));
    }
    return array;
}
/*
function getMaxLen(array){
    var max=0;
    for(var i=0,len=array.length; i<len; i++){
        var l=array[i].toString().length;
        if(max < l) max=l;
    }
    return max;
}

function getMax(array){
    var max=0;
    for(var i=0,len=array.length; i<len; i++){
        if(max<array[i]) max=array[i];
    }
    return max;
}
*/
/**Compare targets from $htmMask.showCol() -> getTargetElements() */
function textCompare(){
	this.threshold1 = 0; // level 1 -> compareAlert1 (pink, might be error)
	this.threshold2 = -10; // level 2 -> compareAlert2 (red, should be error)
	this.alertClass1 = 'compareAlert1';
	this.alertClass2 = 'compareAlert2';
	this.elements=[];
	this.scores = [];
	this.popularTypes = [];
	this.alertCount = 0;
    this.getCharType = function(c){
    	if(c.toString().length==0){ /*log("empty");*/ return -1; }
	    if(/\d/.test(c)) { return 1; }
	    if(/\w/.test(c)) { return 2; }
	    if(/\s/.test(c)) { return 3; }
	    //else if(/^$/.test(c)) { return 9;}
	    else { return 4; }
    }
    this.getPopularType = function(types){
        var ones=0,twos=0,threes=0,fours=0, nones=0;
        for(var i=0, len=types.length; i<len; i++){
            switch(types[i].toString()){
                case "1" : ones++; break;
                case "2" : twos++; break;
                case "3" : threes++; break;
                case "4" : fours++; break;
                case "-1" : nones++; break;
                default: break;
            }
        }
        // ones   twos   threes   fours
        // 1        3     3          2
        var maxType, max;
        max=ones; maxType=1;
        if(max < twos) { max=twos; maxType=2; }
        //else if(max==twos){}
        if(max < threes) { max=threes; maxType=3; }
    	if(max < fours) { max=fours; maxType=4; }
    	if(max < nones) { max=nones; maxType=-1; }
    	//log("now pop from types=",maxType)
        return maxType; // get most popular type, like 2
    }
    this.getMaxColLength = function(array){
		var max=0;
		for(var i=0,len=array.length; i<len; i++){
			var size = array[i].length;
			if(max < size){ max=size; }
		}
		return max;
	}
	
    this.compare = function(elements){
    	this.alertCount =0;
    	document.getElementById("alertCount").innerHTML = this.alertCount;
    	
    	if(!elements || elements.length <=0){ return null;}
    	this.elements.length = 0;
    	this.elements = elements;
        var txtArray=[], result = [];
        var charArray = [];
        var typeArray = [];

        for(var i=0,len=this.elements.length; i<len; i++){
        	var txt = this.elements[i].text();
        	if(!txt || txt == "null"){ charArray.push(""); }
        	else{ charArray.push(arraylise(txt)); }
	    }
	    /* now we have array like: charArray = 
	    	[['s','3',',',' ','n','g'],
	    	 ['s','3',',',' ','n','g'],
	    	 ['s','3','',' ','n','g']]
	    */
	    for(var y=0, rowCount=charArray.length; y<rowCount; y++){
	    	var types=[];
	    	for(var x=0, colCount=charArray[y].length; x<colCount; x++){
	    		types.push(this.getCharType(charArray[y][x]));
	    	}
	    	typeArray.push(types);
	    }
	   	/* now we have array like: typeArray =
	        [[ 2 , 1 , 4 , 3 , 2 , 2 ],
	         [ 2 , 1 , 4 , 3 , 2 , 2 ],
	         [ 2 , 1 , -1, 3 , 2 , 2 ]]
	    */
	    // need to nomarlize.   empty => -1
	    for(var x=0, maxColCount=this.getMaxColLength(typeArray); x<maxColCount; x++){
	    	var types=[];
	    	for(var y=0, rowCount=typeArray.length; y<rowCount; y++){
	    		if(!typeArray[y][x]){ typeArray[y][x] = "-1"; /*log('empty=',typeArray[y][x])*/}
	    	}	
	    }
/*
	    log("type.rowIdx7",typeArray[7])
	    log("type.rowIdx8=null",typeArray[8])
	    log("type.rowIdx9=845448536655145739",typeArray[9])
	    log("type.rowIdx10=null",typeArray[10])
	    log("type.rowIdx11=null",typeArray[11])
	    log("type.rowIdx12=null",typeArray[12])
	    log("type.rowIdx13=null",typeArray[13])
	    log("type.rowIdx14",typeArray[14])
*/
	    this.popularTypes.length = 0;
	    for(var x=0, maxColCount=this.getMaxColLength(typeArray); x<maxColCount; x++){
	    	var types=[];
	    	for(var y=0, rowCount=typeArray.length; y<rowCount; y++){
	    		types.push(typeArray[y][x]);
	    	}
	    	this.popularTypes.push(this.getPopularType(types));
	    }
	    log("popular types",this.popularTypes);  // *****************************

	    // get a score for each row/td-cell-text, and push it into this.scores
	    this.scores.length =0;
	    for(var y=0,len=typeArray.length; y<len; y++){
	    	this.getScoresPerRowAndPush(typeArray[y]);
			/*if(score <= this.threshold2){ 
				var e = this.elements[y];
				e.removeClass(this.alertClass1);
				e.removeClass(this.alertClass2);
				this.elements[y].addClass(this.alertClass2)
			}
			else if(score <= this.threshold1){ 
				var e = this.elements[y];
				e.removeClass(this.alertClass1);
				e.removeClass(this.alertClass2);
				this.elements[y].addClass(this.alertClass1)
			}*/
	    }
	   		   	
	   	log("scores",this.scores);// *****************************
	    // get MMScore, which is (mean + median)/2, and use it to determain the distance between row/cell's text & MMScore
	   	var mmScore=this.getMMScore(this.scores);// *****************************
	   	log("mmScore",mmScore);
	   	// get MMDistance, which is used to trigger alert when distance greater than MMDistance
	   	var mmDistance = this.getMMDistance(this.scores,mmScore);

	   	console.log("mmDistance="+mmDistance)
	   	for(var i=0,len=this.scores.length; i<len; i++){
	   		var e = this.elements[i];
	   		var alertLevel = this.getDistanceLevel(this.scores[i],mmScore,mmDistance);

	   		switch(alertLevel){
	   			case 2:
		   			e.removeClass(this.alertClass1);
					e.removeClass(this.alertClass2);
					this.elements[i].addClass(this.alertClass2);
					this.alertCount++;
				break;
				case 1:
					var e = this.elements[i];
					e.removeClass(this.alertClass1);
					e.removeClass(this.alertClass2);
					this.elements[i].addClass(this.alertClass1);
					this.alertCount++;
				break;
				default:
				break;
	   		}
    	document.getElementById("alertCount").innerHTML = this.alertCount;

	   	}
	   	// getDistLevel(mmDistance)  and show alert
/*
	   	for(var i=0,len=this.scores.length; i<len; i++){
	    	totalDist += this.getDistanceLevelxxx(this.scores[i],mmScore);


			if(score <= this.threshold2){ 
				var e = this.elements[i];
				e.removeClass(this.alertClass1);
				e.removeClass(this.alertClass2);
				this.elements[i].addClass(this.alertClass2)
			}
			else if(score <= this.threshold1){ 
				var e = this.elements[i];
				e.removeClass(this.alertClass1);
				e.removeClass(this.alertClass2);
				this.elements[i].addClass(this.alertClass1)
			}
	    }*/
    }
    this.getMMDistance = function(scores,mmScore){

    	var totalDist =0;
    	var len=scores.length;
    	var distArray=[]
    
	   	for(var i=0; i<len; i++){
	   		var dis = +(scores[i] - mmScore);
	   		if(dis<0) dis=-dis;
			//console.log("dis = "+dis);
	   		distArray.push(dis);
	    	totalDist += dis;
	    }
	    //console.log('totalDist = ' + totalDist)
		var meanDist = totalDist/len;
		//console.log("meanDist = " + meanDist)
		distArray.sort();
		var medianDist = distArray[Math.floor(distArray.length / 2)];
		//console.log("median = "+medianDist)
		var mmDis = (+meanDist + medianDist)/2;
		//console.log("in getmMd, mmDis=" + mmDis)
		return mmDis;

    }
    /**hight distanceLevel raises alert for user to see if there are errors*/
    this.getDistanceLevel = function(score,mmScore,mmDistance){
    	var distance = Math.abs(+score - mmScore);
    	var level=0;
    	if(mmDistance!=0){
    		if(distance >= mmDistance*1.5){
	    		level = 2;
	    	}else if(distance > mmDistance){
	    		level = 1;
	    	}
    	}

    	console.log(">>distance(score="+score+") : "+distance + " => level "+ level);
    	return level;
    }
    // scores : 28,28,28,28,28,28,28,28,-4,-4,-4,-4,-4,-4,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28
    // total  : 928
    // mean	  : 23.2
    // median : 
    this.getMMScore = function(scores){
    	var total=0;
    	var len=scores.length;
    	for(var i=0; i<len; i++){ total+=scores[i]; }
    	var mean = total/len;
    	var sarray = scores.slice(0).sort(); // make a clone of values only, without referencing; then sort it
    	var median = sarray[Math.floor(sarray.length / 2)];
    	return (mean+median)/2;
    }
    
	this.getScoresPerRowAndPush = function(targetArray){
		// compare -> score -> store in this.scores, on number value per row
		/*  popular types: 	4,2,2,2,2,2,2,2, 2, 2, 2, 4
			row's types: 	4,2,2,2,2,2,2,4,-1,-1,-1,-1
		*/
		var s=0;
		for(var x=0,len=this.popularTypes.length; x<len; x++){
			if(this.popularTypes[x] == targetArray[x]){ s++; } else { s--; }
		}

		this.scores.push(s);
		return s;
	}// endof this.getScoresPerRowAndPush

}// endof textCompare