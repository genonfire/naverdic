var noAudios;

function searchWord(e) {
  noAudios = 0;
  var word = $('#dic').val();
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
            if (play)
              play.id = i;
              play.addEventListener("click", function(e){
                document.getElementById('proaudio' + this.id).play();
              }, false);
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
        var playtail = data.indexOf('" alt="', audiohead + 23);
        var playsource = data.substring(playhead + 23, playtail);

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
  document.getElementById("dic").focus();
}

window.addEventListener("load", function()
{
  document.getElementById("search").addEventListener("click", searchWord);
  document.getElementById("dic").addEventListener("keydown", onKeyPress);
}, true);

window.onload = onLoad;
