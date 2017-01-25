
// =========================================== main ======================================
$.noConflict();


jQuery( document ).ready(function( $ ) {
// 1
  var parser = new sqlParser();
  var recorder = new sqlRecorder();
  var tracker = new cellTracker();
  var lines;
// 2 ?
function readSingleFile(evt) {
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
	      	for(var i=0;i<lines.length;i++){
	      		var feedback = recorder.addJson2List(parser.parseStr2Json(lines[i]));
	      		if(feedback){
      				$('tr.hiddenEnd').before(recorder.getLastHtms(0)[0]);
      				$('tr.hiddenEnd').before(recorder.getLastHtms(0)[1]);
				      loaded.push(i+1);
	      		}else{
	      			ignores.push(i+1);
	      		}
	      	}
	      	if(ignores.length > 0){
	      		log("Loaded "+loaded.length + "/"+ lines.length + " : "+ loaded+"\n"+
	      			"Ignored "+ignores.length + "/"+ lines.length + " : "+ ignores)
	      	}
	      }
      }
      r.readAsText(f);

      log('File loaded');
    } else {     	
      alert("Failed to load file");
      return null;
    }
  }

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ 3. Events ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	

  window.onscroll = function() {
  	$('#scroll').text("screen.height="+document.body.scrollLeft+", documentElement.scrollLeft="+document.documentElement.scrollLeft);
  };

	if (window.File && window.FileReader && window.FileList && window.Blob) {
		  document.getElementById('fileinput').addEventListener('change', readSingleFile, false);
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
        $('tr.hiddenEnd').before(recorder.getLastHtms(0)[0]);
        $('tr.hiddenEnd').before(recorder.getLastHtms(0)[1]);
      }


  });// ***endOf btnConvert.click

  $( document ).on( 'mouseover', 'tr.responsable', function(event) {   $(this).addClass('highlight')  })
              .on( 'mouseleave', 'tr.responsable', function(event) {   $(this).removeClass('highlight') })
              .on( 'dblclick', 'tr.responsable>td,th', function(event){
                  var d_id = $(this).attr('data-id')
                  var d_cid = $(this).attr('data-cid');

                  tracker.trackCell(d_id, d_cid)
                log("cell@ "+tracker.x+","+tracker.y+","+tracker.w+","+tracker.h);
  });

              

});
// ======================================= end of main ============================================


