/**string of h1,h2,'h3,33',h4 => array of [h1,h2,'h3,33',h4]*/
function str2arr(string,delim=','){
	var arr = string.split(delim); var arr2 = []; var strBuilder = "";
	for(var i=0;i<arr.length;i++){
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
	var htm="";	switch(type){case 'h': for(var i=0;i<array.length;i++){htm+='<th data-id='+dataId+' data-cid='+i+'>'+array[i]+'</th>'};break;
							 case 'r': for(var i=0;i<array.length;i++){htm+='<td data-id='+dataId+' data-cid='+i+'>'+array[i]+'</td>'};break; 
							 default:break;}	
	return htm;
}
function cleanBracketString(string){
	var stringBuilder=string.toString().trim();	stringBuilder=stringBuilder.replace(/[()]/g, "");
 	return stringBuilder.toString().trim();
}
function log(str){ console.log(str); }


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


function sqlRecorder(){
	this.records=[];
	this.init = function(){ this.records=[]; }
	this.add = function(json){ // json shoud be from sqlParser.getJson()
		if(json){this.records.push(json);}
	}
	this.addJson2List = function(json){
		if(json){this.records.push(json);return 1; }else{return null};
	}
	this.get = function(id=null){
		if(!id){   return this.records;   } else {   var index = this.getIndexById(id);if(index){return this.records[index];}else{return null;}   }
	}
	this.getIndexById = function(id){
		for(var i=0;i<this.records.length;i++){  if(this.records[i].id==id){return i;}  };return null;
	}
	this.getLastJson = function(){ return this.records[this.records.length-1]; }
	this.getLastHtms = function(){
		return this.getHtmsByIndex(this.records.length-1);
	}
	this.getHtmsByIndex = function(i){
		var rc=this.records[i];
		var idx = rc.id;
  	var com = rc.command;
  	var tname = rc.tname;
  	var rhtm = arr2cells(rc.rArray,'r',idx);
  	var hhtm = arr2cells(rc.hArray,'h',idx);
  	htmr="<tr data-id="+idx+" class='responsable'><td data-id="+idx+" data-cid='-2' class='tbcomm'>"+com+"</td><td data-id="+idx+" data-cid='-1' class='tbname hidden'>"+tname+"</td>"+rhtm+"</tr>";
  	htmh="<tr data-id="+idx+" class='responsable'><th data-id="+idx+" data-cid='-2' class='hidden'>"+com+"</th><th data-id="+idx+" data-cid='-1' class='tbname'>"+tname+"</th>"+hhtm+"</tr>";
		return [htmh,htmr];
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
			for(var i=0;i<cells.length;i++){
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
	for(var i=0;i<rows.length;i++){ if(rows[i].getAttribute(attrName)==attrValue) return rows[i] }
	return null;
}