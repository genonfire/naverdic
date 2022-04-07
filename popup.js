var noAudios = 0;

function searchWord(e) {
  const dicURL = "https://en.dict.naver.com/api3/enko/search?m=mobile&query=";
  const queryURL = dicURL + document.getElementById("dic").value.toLowerCase();

  chrome.runtime.sendMessage({
    method: 'GET',
    action: 'endic',
    url: queryURL,
    }, function(data) {
      if (!data || !data.searchResultMap)
        return

    var items = data.searchResultMap.searchResultListMap.WORD.items;

    if (items.length > 0) {
      var html = ''
      var audio = null;

      for (var i = 0; i < items.length; i++) {
        var word = items[i].expEntry;
        var means = items[i].meansCollector[0].means;
        var partOfSpeech = items[i].meansCollector[0].partOfSpeech;
        if (audio == null && items[i].searchPhoneticSymbolList.length > 0) {
          audio = items[i].searchPhoneticSymbolList[0].symbolFile;
        }

        html += '<div class="naverdic-wordTitle">' + word;
        if (audio && noAudios == 0) {
          var audioID = 'proaudio' + ++noAudios;
          var playAudio = '<span><audio class=naverdic-audio controls src="' + audio + '" id="' + audioID + '" controlslist="nodownload nooption"></audio></span>';
          html += playAudio;
        }
        html += '</div>';

        for (var j = 0; j < means.length; j++) {
          if (j == means.length - 1) {
            itemStyle = "margin-bottom:5px;"
          }
          else {
            itemStyle = "margin-bottom:2px;"
          }
          html += '<div style=' + itemStyle + '>' + means[j].order + '. ' + means[j].value + '</div>'
        }
      }
      audio == null;
      noAudios = 0;

    }
    document.getElementById('content').innerHTML = html;
  });
}

function onKeyPress(e) {
  if (e.keyCode == 13) {
    e.preventDefault();
    searchWord();
  }
}

function onLoad() {
  document.getElementById("dic").focus();
}

window.addEventListener("load", function() {
  document.getElementById("search").addEventListener("click", searchWord);
  document.getElementById("dic").addEventListener("keydown", onKeyPress);
}, true);

window.onload = onLoad;
