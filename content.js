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
}

function showFrame(datain, top, left) {
  $('<div/>', {
    id: 'popupFrame',
    class: 'popupFrame',
    html: datain,
    style: "position:absolute;top:" + top + "px;left:" + left + "px;width:360px;height:auto;display:block;z-index:99997;background-color:#FFFFDD;font-size: 9pt;box-shadow:0 0 3px 3px #888;"
  }).appendTo('body');

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

function openPopup(e) {
  var marginX = 10;
  var marginY = 20;
  var top = e.clientY + $(document).scrollTop() + marginY;
  var left = e.clientX - 180 + $(document).scrollLeft();
  if (e.clientX - 180 < marginX)
    left = marginX + $(document).scrollLeft();

  var selection = window.getSelection();
  if (selection.rangeCount > 0) {
      var range = selection.getRangeAt(0);
      var text = range.cloneContents().textContent.trim();
      var english = /^[A-Za-z]*$/;
      if (english.test(text[0]) && text.split(/\s+/).length < 4) {
        translateWord(text.toLowerCase(), top, left);
      }
  }
}

function registerEventListener() {
  chrome.storage.sync.get({
    dclick: 'true',
    dclick_trigger_key: 'none',
    drag: 'true',
    drag_trigger_key: 'ctrl'
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
        openPopup(e)
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
          openPopup(e)
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
