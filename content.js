var marginX = 10;
var marginY = 20;
var popupWidth = 360;
var noAudios;

function searchWord(e, word, x, y) {
  noAudios = 0;
  var queryURL = "http://endic.naver.com/searchAssistDict.nhn?query=" + word;
  
  chrome.runtime.sendMessage({
    method: 'POST',
    action: 'xhttp',
    url: queryURL,
    }, function(data) {
      if (data.indexOf('<h3') != -1)  {
        manipulated = makeFrameData(data);
        showFrame(e, manipulated, x, y);
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
  })
}

function translateWord(e, phrase, top, left, naver_client_id, naver_client_secret) {
  var client_id = naver_client_id;
  var client_secret = naver_client_secret;
  var queryURL = 'http://www.gencode.me/api/papago/';
  var formData = "source=en&target=ko&client_id=" + client_id + "&client_secret=" + client_secret + "&text=" + phrase;

  chrome.runtime.sendMessage({
    method: 'POST',
    action: 'navertrans',
    data: formData,
    url: queryURL,
    }, function(dataout) {
      var texthead = dataout.indexOf('"translatedText":"');
      var texttail = dataout.indexOf('"}}}', texthead + 18);
      var data = dataout.substring(texthead + 18, texttail);
      showFrame(e, data, top, left);
  })
}

function showFrame(e, datain, top, left) {
  $('<div/>', {
    id: 'popupFrame',
    class: 'popupFrame',
    html: datain,
    style: "position:absolute;top:" + top + "px;left:" + left + "px;width:" + popupWidth +"px;height:auto;line-height:normal;display:block;z-index:99997;background-color:#FFFFDD;font-size: 9pt;color:black;box-shadow:0 0 3px 3px #888;"
  }).appendTo('body');

  var height = $('#popupFrame').height();
  var winheight = $(window).height();

  if (height + e.clientY > winheight) {
    newtop = top - height - 2 * marginY;
    $('#popupFrame').css('top', newtop);
  }

  $('#popupFrame').on('mousedown', function(e) {
    e.stopPropagation();
  }).on('mousemove', function(e) {
    e.stopPropagation();
  }).on('mouseup', function(e) {
    e.stopPropagation();
  });
}

function makeFrameData(datain) {
  var data = datain.replace(/<a href="/gi, '<a href="http://endic.naver.com');
  data = data.replace(/http:\/\/dicimg.naver.net\/endic\/img\/btn_guide.gif/gi, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAQCAIAAABocZPBAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAZdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjAuMTM0A1t6AAAAf0lEQVQ4T72OyxXAIAgE01P6b8N2EmSRp4Caj8mcEJaRLa0mG491/GXcC/pEQaBvkBlz6UazY5gY+csGNDENMdPujXUui9s1M5WKiY0IadTsEDeMNPbpugN8RolvnKIW/1lgpJBHZgXfUWKjVAXtZHcHBIiHNw4IjC/5zLiSlE6khUhjbxE10wAAAABJRU5ErkJggg==');
  data = data.replace(/http:\/\/dicimg.naver.net\/endic\/img\/btn_syn.gif/gi, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAQCAIAAADxiUp0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAZdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjAuMTM0A1t6AAAAiklEQVQ4T82PQQqAMBAD/bYP8R++xXNP/kJ6sVIIYTdbFLEV5rAmwaHTlvZuXLIj5w6Mls3L6vEtJ3w3Wi3jT0b+xR9R+AOZBxXPoiMKhQzwDpSwwok56g0QWhmPDNgYUPFGhq2X3eStrCyYKAdoeelDIeM6ShjjqHCC+9nLJO0Bt1r2ESNknUj7CV29/v0DruQhAAAAAElFTkSuQmCC');

  while(true) {
    var audiostring = '';
    var audiohead = data.indexOf('playlist="');
    if (audiohead != -1) {
      var audiotail = data.indexOf(' class=', audiohead + 10)
      var audiosource = data.substring(audiohead + 10, audiotail);

      var playhead = data.indexOf('<img class="play"');
      var playsource = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAQAAAD8x0bcAAAAkUlEQVR4AWOgObjJUMDAhlu6AUxuZPjHcI5BGpeS/1CWI8MbhhsMfNiV/IfzzBl+MUzGogSuaAkDM5CcwvCDQRAm/R8ZQkWygaQpkA7Bp2gXkOQA0hUUK0oHkmZAOhi3w+czMAHJ6QzfGQTwB4Elw2+GCfgD04XhHcNVBh580bIFqPgUgwT+CL7OkMPASv10AwC3FEwe7LROMwAAAABJRU5ErkJggg==";
      audiostring = '<audio src="' + audiosource + '" id="proaudio' + noAudios + '"></audio> <input type="image" id="playaudio' + noAudios + '" src="' + playsource + '" style="cursor:pointer;">';
    } else {
      break;
    }

    var trashhead = data.indexOf('<a id="pron_en"');
    if (trashhead == -1) {
      break;
    }
    var trashtail = data.indexOf('</a>', trashhead);

    var datapart1 = data.substring(0, trashhead);
    var datapart2 = data.substring(trashtail + 4);
    data = datapart1 + audiostring + datapart2;
    noAudios++;
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

  var lasthead = data.indexOf('<dt class="last');
  if (lasthead != -1) {
    var lasttail = data.indexOf('</dt>', lasthead);

    var datapart1 = data.substring(0, lasthead);
    var datapart2 = data.substring(lasttail + 5);
    data = datapart1 + datapart2;
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

var checkTrigger = function(e, key) {
  switch(key) {
    case 'ctrl':
      if (!e.ctrlKey || e.altKey)
        return false;
      break;
    case 'alt':
      if (e.ctrlKey || !e.altKey)
        return false;
      break;
    case 'ctrlalt':
      if (!e.ctrlKey || !e.altKey)
        return false;
      break;
    case 'none':
    default:
      if (e.ctrlKey || e.altKey)
        return false;
      break;
  }

  return true;
}

function openPopup(e, naver_client_id, naver_client_secret, type = 'search') {
  var top = e.clientY + $(document).scrollTop() + marginY;
  var left = e.clientX - 180 + $(document).scrollLeft();
  var clientY = e.clientY;
  if (e.clientX - 180 < marginX)
    left = marginX + $(document).scrollLeft();

  var winWidth = $(window).width();
  if (left + popupWidth > winWidth) {
    left = winWidth - popupWidth - marginX;
  }

  var selection = window.getSelection();
  if (selection.rangeCount > 0) {
      var range = selection.getRangeAt(0);
      var text = range.cloneContents().textContent.trim();
      var english = /^[A-Za-z]*$/;
      if (english.test(text[0]) && text.split(/\s+/).length < 4) {
        searchWord(e, text.toLowerCase(), top, left);
      }
      else if (type == 'translate') {
        translateWord(e, text, top, left, naver_client_id, naver_client_secret);
      }
  }
}

function registerEventListener() {
  chrome.storage.sync.get({
    dclick: true,
    dclick_trigger_key: 'none',
    drag: true,
    drag_trigger_key: 'ctrl',
    translate: false,
    translate_trigger_key: 'ctrlalt',
    naver_client_id: '',
    naver_client_secret: ''
  }, function(items) {
    if (!items.dclick && !items.drag) {
      return;
    }
    var mousedown = false;
    var mousemove = false;
    var scrollXOffset = 8;
    var clicks = 0;
    var timeout;
    var prevX;

    $('body').on('mousedown', function(e) {
      mousedown = true;
      prevX = e.pageX;
    });

    $('body').on('mousemove', function(e) {
      if (!mousedown)
        return;
      if (Math.abs(e.pageX - prevX) > scrollXOffset)
        mousemove = true;
    });

    $('body').on('mouseup', function(e) {
      if (mousemove && items.drag && checkTrigger(e, items.drag_trigger_key)) {
        mousedown = mousemove = false;
        $('#popupFrame').remove();
        openPopup(e, items.naver_client_id, items.naver_client_secret);
      }
      else if (mousemove && items.translate && checkTrigger(e, items.translate_trigger_key)) {
        mousedown = mousemove = false;
        $('#popupFrame').remove();
        openPopup(e, items.naver_client_id, items.naver_client_secret, 'translate');
      }
      else if (!mousemove && items.dclick && checkTrigger(e, items.dclick_trigger_key)) {
        mousedown = false;
        clicks++;

        if (clicks == 1) {
          timeout = setTimeout(function () {
            $('#popupFrame').remove();
            clicks = 0;
          }, 400);
        } else {
          $('#popupFrame').remove();
          clearTimeout(timeout);
          openPopup(e, items.naver_client_id, items.naver_client_secret);
          clicks = 0;
        }
      }
      else {
        mousedown = mousemove = false;
        $('#popupFrame').remove();
      }
    });
  });
}

registerEventListener();
