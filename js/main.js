
// =========================================== main ======================================
$.noConflict();


jQuery( document ).ready(function( $ ) {

// jq functions ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  function $htmWriter(){

    this.table = $('.resultTable');
    this.init = function(){
      this.table.empty();
      //this.table.append(this.lastRowHtm);
    }
    this.writeOne = function(htms,isSingle=false){
      if(Array.isArray(htms) && !isSingle){

        this.table.append(htms[0]);
        this.table.append(htms[1]);

        //this.lastRow.before(htms[0]);
        //this.lastRow.before(htms[1]);
      }else if(isSingle && htms){
        this.table.append(htms);
      }
    }
    this.writeAll = function(htmsArr){
      if(Array.isArray(htmsArr)){
        for(var i=0,len=htmsArr.length; i<len; i++){
          this.writeOne(htmsArr[i],true);
        }
      }
    }
  }//endof $htmWriter
function $refreshCount(){
    $('#rowCount').text(recorder.getSize());
}


function $htmMask(){
  this.table = $('.resultTable');
  this.hc1 = 'mhide';
  this.hc2 = 'hidden';
  this.ptns = [
      {"num": /^\d+$/},
  ];
  this.targetElements = [];
  this.cleanUp = function(){
    $("th").removeClass(this.hc1);
    $("td").removeClass(this.hc1);
    $("th").removeClass(this.hc2);
    $("td").removeClass(this.hc2);
    
  }
  this.applyAll = function(myclass){

    $("th").addClass(myclass);
    $("td").addClass(myclass);
  }
/*
  this.guessPtn = function(elements){
    var yess=0, nos=0;
    var aarr = [];
    var glass = [];
    for(var i=0,len=elements.length; i<len; i++){
        //log(array[i])
        aarr.push(arraylise(elements[i].text()));
    }
    var ct = new cTypeComp();
    for(var ci=0, clen=getMaxLen(elements); ci<len; ci++){
        for(var ri=0, rlen=elements.length; ri<rlen; ri++){
            ct.add(cType(aarr[ri][ci]))
            //log("ctype",cType(aarr[ri][ci]));
        }
        log(ct.compare());
        ct.init();

    }
  }*/
    this.showCol = function(cname){
        this.cleanUp();
        var hc;
        var tgtElements=[];
        //this.targetElements=[];

        if($('input[name=exclusion]:checked').val()=="grayout"){ hc=this.hc1; }else{ hc=this.hc2; }

        if(!cname){ return; }
        this.applyAll(hc);

        var ths=$("th:containsExact("+cname.toUpperCase()+")").not('.headCell');
        //log("ths num",ths.length)
        $('span#rowCount2').text(ths.length);
        if(ths.length <=0){ return;}
        ths.removeClass(hc);
        ths.each(function(){
          var cid=$(this).attr("data-cid");
          //$(this).parent('tr').next('tr').children("td[data-cid="+cid+"]").removeClass(hc);
          var tg = $(this).parent('tr').next('tr').children("td[data-cid="+cid+"]");
          tg.removeClass(hc);
          tgtElements.push(tg);
        });
        this.targetElements.length=0;
        this.targetElements = tgtElements;

    }
    this.getTargetElements = function(){
    return this.targetElements;
    };
  
}
// 2 ?
function $readSingleFile(evt) {
    //Retrieve the first (and only!) File from the FileList object
    var f = evt.target.files[0];     
    if (f) {
      var r = new FileReader();
      lines = "";
      var loaded=[];
      var ignores=[];
      r.onload = function(e) {   
          var content = e.target.result;   //f.name,f.type,f.size

        lines = content.split(/[\r\n]+/g); // tolerate both Windows and Unix linebreaks
          if(lines.length >0){
            for(var i=0,len=lines.length;i<len;i++){
                var feedback = recorder.addJson2List(parser.parseStr2Json(lines[i]));
                if(feedback){
                    $writer.writeOne(recorder.getLastHtms());
                      loaded.push(i+1);
                }else{
                    ignores.push(i+1);
                }
            }
            if(ignores.length > 0){
                log("Loaded "+loaded.length + "/"+ lines.length + " : "+ loaded+"\n"+
                    "Ignored "+ignores.length + "/"+ lines.length + " : "+ ignores)
            }
          $refreshCount();
          }
      }
      r.readAsText(f);

      log('File loaded');
    } else {        
      alert("Failed to load file");
      return null;
    }
  }

// -------------------------------- jq main -------------------
// 1
  var parser = new sqlParser();
  var recorder = new sqlRecorder();
  var tracker = new cellTracker();
  var lines;
  var $writer = new $htmWriter();
  var $mask = new $htmMask();
  var compare = new textCompare();
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ 3. Events ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    

  window.onscroll = function() {
    $('#scroll').text("screen.height="+document.body.scrollLeft+", documentElement.scrollLeft="+document.documentElement.scrollLeft);
  };

    if (window.File && window.FileReader && window.FileList && window.Blob) {
          document.getElementById('fileinput').addEventListener('change', $readSingleFile, false);
        } else {
            $("#fileinput").prop('disabled', true);
          alert('The File APIs are not fully supported by your browser.');
        }

  //.containsExact("sometext") use like .text("sometext")
  $.expr[":"].containsExact = function (obj, index, meta, stack) {
      return (obj.textContent || obj.innerText || $(obj).text() || "") == meta[3];
  };

//  =================================================== 4. UI actions ===================================================
  $('input.btnConvert').click(function(){ // assume that always parsing complete sql statement(s)
      var $inputField = $('input.csvText');
      var feedback = recorder.addJson2List(parser.parseStr2Json($inputField.val()));

      if(feedback){
        $writer.writeOne(recorder.getLastHtms());
        $refreshCount();
      }

  });// ***endOf btnConvert.click
  $('#txtSchId').on('keydown', function (e) {
    var key = e.which || e.keyCode;
    if (key === 13) { // 13 is enter

      var index = $(this).val();
      $writer.init();
      if(!index){
        $writer.writeAll(recorder.getAllHtms());
      }else{
        $writer.writeOne(recorder.getHtmsByIndex(index));
      }
      $refreshCount();
    }
  });

  $('#txtSchTName').on('keydown', function (e) {
    var key = e.which || e.keyCode;
    if (key === 13) { // 13 is enter
      var value = $(this).val();
      $writer.init();
      $writer.writeAll(recorder.searchTName(value));
      $refreshCount();
    }
  });

  $('#txtSchCName').on('keydown', function (e) {
    var key = e.which || e.keyCode;
    if (key === 13) { // 13 is enter
      var value = $(this).val();
      $writer.init();
      $writer.writeAll(recorder.searchCName(value));
      $refreshCount();
    }
  });

  //btnSch txtSchId txtSchTName txtSchCName txtSchCValue
  $('#btnSch').click(function(){
    var index = $('#txtSchId').val();
    $writer.init();
    if(!index){
      $writer.writeAll(recorder.getAllHtms());
    }else{
      $writer.writeOne(recorder.getHtmsByIndex(index));
    }
    $refreshCount();

  });
// selector 2
  $('#txtShowCol').on('keydown', function (e) {
    var key = e.which || e.keyCode;
    if (key === 13 || key == "ENTER") { // 13 is enter
      $mask.showCol($(this).val());
      if($(this).val().length >0){
        compare.compare($mask.getTargetElements());
      }
    }
  });

  //$('input:radio#exc_grayout').change(function(){
  $('input:radio[name=exclusion]').change(function(){

    $('#txtShowCol').trigger({type:'keydown',which:13})   // or which:"ENTER"    13
    /*
    var r=$(this)
    if(r.is(":checked") && r.val() == "grayout"){
      log("grayout")
      //{ type : 'keypress', which : character.charCodeAt(0) }
      $('#txtShowCol').trigger({type:'keydown',which:'ENTER'})

    }
    if(r.is(":checked") && r.val() == "hide"){
      log("hide")
      $('#txtShowCol').trigger({type:'keydown',which:'ENTER'})
    }*/
  })

  $('.refresh').click(function(){
    $('#rowCount').text(recorder.getSize());
  });



  $( document ).on( 'mouseover', 'tr.responsable', function(event) {   $(this).addClass('highlight')  })
              .on( 'mouseleave', 'tr.responsable', function(event) {   $(this).removeClass('highlight') })
              .on( 'dblclick', 'tr.responsable>td,th', function(event){
                  var d_id = $(this).attr('data-id')
                  var d_cid = $(this).attr('data-cid');

                  tracker.trackCell(d_id, d_cid)
                //log("cell@ "+tracker.x+","+tracker.y+","+tracker.w+","+tracker.h);
  });

              

});
// ======================================= end of main ============================================


