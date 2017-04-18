function translateWord(word, x, y) {
  noAudios = 0;
  var queryURL = "http://endic.naver.com/searchAssistDict.nhn?query=" + word;
  
  chrome.runtime.sendMessage({
    method: 'POST',
    action: 'xhttp',
    url: queryURL,
    }, function(data) {
      if (data.indexOf('<h3') != -1)  {
        manipulated = makeFrameData(data);
        showFrame(manipulated, x, y);
      }
  })
  // chrome.runtime.sendMessage({"message": "open_new_tab", "url": chrome.runtime.getURL('options.html')});
}

function showFrame(datain, x, y) {
  $('<div/>', {
    id: 'popupFrame',
    class: 'popupFrame',
    html: datain,
    style: "position:absolute;top:" + x + "px;left:" + y + "px;width:360px;height:auto;display:block;z-index:99997;background-color:#FFFFDD;font-size: 9pt;box-shadow:0 0 3px 3px #888;"
  }).appendTo('body');

  $('#popupFrame').bind('click', singleClickOnPopup);
}

function singleClickOnPopup(e) {
  e.stopPropagation();
}

function makeFrameData(datain) {
  var data = datain.replace(/<a href="/gi, '<a href="http://endic.naver.com');
  data = data.replace(/http:\/\/dicimg.naver.net\/endic\/img\/btn_guide.gif/gi, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAQCAIAAABocZPBAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAZdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjAuMTM0A1t6AAAAf0lEQVQ4T72OyxXAIAgE01P6b8N2EmSRp4Caj8mcEJaRLa0mG491/GXcC/pEQaBvkBlz6UazY5gY+csGNDENMdPujXUui9s1M5WKiY0IadTsEDeMNPbpugN8RolvnKIW/1lgpJBHZgXfUWKjVAXtZHcHBIiHNw4IjC/5zLiSlE6khUhjbxE10wAAAABJRU5ErkJggg==');

  while(true) {
    var trashhead = data.indexOf('<a id="pron_en"');
    if (trashhead == -1) {
      break;
    }
    var trashtail = data.indexOf('</a>', trashhead);

    var datapart1 = data.substring(0, trashhead);
    var datapart2 = data.substring(trashtail + 4);
    data = datapart1 + datapart2;
  }

  while(true) {
    var aopenhead = data.indexOf('<a href');
    if (aopenhead == -1) {
      break;
    }
    var aopentail = data.indexOf('">', aopenhead);
    var aclose = data.indexOf('</a>', aopentail);

    var datapart1 = data.substring(0, aopenhead);
    var datapart2 = data.substring(aopentail + 2, aclose);
    var datapart3 = data.substring(aclose + 4);
    data = datapart1 + datapart2 + datapart3;
  }

  var wordhead = data.indexOf('<div class="box_a');
  if (wordhead == -1) {
    return data;
  }
  var wordtail = data.indexOf('</div>', wordhead);

  var datapart = data.substring(0, wordtail + 6);
  data = datapart + "</div></div>";

  return data;
}

var doubleClick = function(e) {
  if (e.ctrlKey || e.altKey) {
    return;
  }

  var selection = window.getSelection();
  if (selection.rangeCount > 0) {
      var range = selection.getRangeAt(0);
      var text = range.cloneContents().textContent;
      var english = /^[A-Za-z0-9]*$/;
      if (english.test(text[0])) {
        translateWord(text.toLowerCase(), e.clientX, e.clientY);
      }
  }
}

var singleClick = function(e) {
  $('#popupFrame').remove();
}

var clickListener = function(e) {
  var clicks = 0;
  var timeout;

  return function (e) {
    clicks++;

    if (clicks == 1) {
      timeout = setTimeout(function () {
        singleClick(e);
        clicks = 0;
      }, 400);
    } else {
      $('#popupFrame').remove();
      clearTimeout(timeout);
      doubleClick(e);
      clicks = 0;
    }
  };
}

document.body.addEventListener('click', clickListener(), false);
