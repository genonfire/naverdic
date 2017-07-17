var noAudios;

function searchWord(e) {
  noAudios = 0;
  var word = $('#dic').val().toLowerCase();
  var queryURL = "http://endic.naver.com/searchAssistDict.nhn?query=" + word;
  
  $.ajax({
      url: queryURL,
      crossDomain: false,
      dataType: 'html',
      success: function(data) {
          manipulated = parseAndManipulate(data);
          $('#content').html(manipulated);
          for (var i = 0; i < noAudios; i++) {
            play = document.getElementById("playaudio" + i);
            if (play) {
              play.id = i;
              play.addEventListener("click", function(e){
                document.getElementById('proaudio' + this.id).play();
              }, false);
            }
          }
      }
  });
}

function onKeyPress(e) {
  if (e.keyCode == 13) {
    e.preventDefault();
    searchWord();
  }
}

function parseAndManipulate(datain) {
  var data = datain.replace(/<a href="/gi, '<a href="http://endic.naver.com');
  while(true) {
    var audiostring = '';
    var audiohead = data.indexOf('playlist="');
    if (audiohead != -1) {
      var audiotail = data.indexOf(' class=', audiohead + 10)
      var audiosource = data.substring(audiohead + 10, audiotail);

      var playhead = data.indexOf('<img class="play"');
      if (playhead != -1) {
        var playsource = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAQAAAD8x0bcAAAAkUlEQVR4AWOgObjJUMDAhlu6AUxuZPjHcI5BGpeS/1CWI8MbhhsMfNiV/IfzzBl+MUzGogSuaAkDM5CcwvCDQRAm/R8ZQkWygaQpkA7Bp2gXkOQA0hUUK0oHkmZAOhi3w+czMAHJ6QzfGQTwB4Elw2+GCfgD04XhHcNVBh580bIFqPgUgwT+CL7OkMPASv10AwC3FEwe7LROMwAAAABJRU5ErkJggg==";
        audiostring = '<audio src="' + audiosource + '" id="proaudio' + noAudios + '"></audio> <input type="image" id="playaudio' + noAudios + '" src="' + playsource + '">';
      }
      else {
        audiostring = '<audio src="' + audiosource + '" id="proaudio' + noAudios + '"></audio> <input type="button" id="playaudio' + noAudios + '" value="play">';
      }
    } else {
      return data;
    }

    var trashhead = data.indexOf('<a id="pron_en"');
    var trashtail = data.indexOf('</a>', trashhead);
    var datapart1 = data.substring(0, trashhead);
    var datapart2 = data.substring(trashtail + 4);

    data = datapart1 + audiostring + datapart2;
    noAudios++;
  }

  return data;
}

function onLoad() {
  // var version = chrome.app.getDetails().version;
  // var status = document.getElementById('version_text');
  // status.textContent = version;
  document.getElementById("dic").focus();
}

window.addEventListener("load", function()
{
  document.getElementById("search").addEventListener("click", searchWord);
  document.getElementById("dic").addEventListener("keydown", onKeyPress);
}, true);

window.onload = onLoad;
