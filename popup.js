var noAudios = 0;

function searchWord(e) {
  const dicURL = "https://dict.naver.com/search.dict?dicQuery=";
  const query = document.getElementById("dic").value.trim();
  const queryURL = dicURL + query;

  if (query.length == 0) {
    return;
  }

  chrome.runtime.sendMessage({
    method: 'GET',
    action: 'endic',
    url: queryURL,
    }, function(data) {
    if (!data) {
      return;
    }

    var html = '';
    var dicHead = data.indexOf('<dl class="dic_search_result">');
    var dicTail = data.indexOf('</dl>');
    var dic = data.substring(dicHead, dicTail + 6);

    while(dic) {
      var dtPos = dic.indexOf('<dt>');
      if (dtPos < 0) {
        break;
      }

      var dt = dic.substring(dtPos, dic.indexOf('</dt>') + 5);
      var wordPos = dt.indexOf('<strong>');
      if (wordPos < 0) {
        dic = dic.substring(dic.indexOf('</dd>') + 5);
        continue;
      }
      var word = dt.substring(wordPos + 8, dt.indexOf('</strong>'));

      var linkPos = dt.indexOf('<a href=');
      var linkUrl = null;
      if (linkPos > -1) {
        linkURL = dt.substring(linkPos + 9, dt.indexOf('onclick') - 2);
      }

      if (linkURL) {
        html += '<div class="naverdic-wordTitle"><a href="' + linkURL + ' " target="_blank">' + word + '</a>';
      }
      else {
        html += '<div class="naverdic-wordTitle"><a href="#" target="_blank">' + word + '</a>';
      }

      var phoneticPos = dt.indexOf('<span class="fnt_e25">');
      if (phoneticPos > -1) {
        var phoneticHead = dt.substring(phoneticPos);
        var phonetic = phoneticHead.substring(22, phoneticHead.indexOf('</span>'));
        html += phonetic;
      }

      if (noAudios == 0) {
        var audioPos = dt.indexOf('<a playlist="');
        if (audioPos > -1) {
          var audio = dt.substring(audioPos + 13, dt.indexOf('class="play"'));
          var audioID = 'proaudio' + ++noAudios;
          var playAudio = '<span><audio class=naverdic-audio controls src="' + audio + '" id="' + audioID + '" controlslist="nodownload nooption"></audio></span>';
          html += playAudio;
        }
        html += '</div>';
      }

      var ddPos = dic.indexOf('<dd>');
      if (ddPos > -1) {
        var dd = dic.substring(ddPos, dic.indexOf('</dd>') + 5).replace('<dd', '<dd class="naverdic-means"');
        html += dd;
      }
      dic = dic.substring(dic.indexOf('</dd>') + 5);
    }

    audio == null;
    noAudios = 0;

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
