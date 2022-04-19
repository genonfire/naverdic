var marginX = 10;
var marginY = 20;
var popupWidth = 360;
var noAudios = 0;
var popupColor = '#FFFFDD';
var popupFontsize = '11';

function searchWord(e, word, x, y) {
  const dicURL = "https://en.dict.naver.com/api3/enko/search?m=mobile&query=";
  const naverURL = "https://dict.naver.com/search.dict?dicQuery="
  const queryURL = dicURL + word;
  const linkURL = naverURL + word;

  chrome.runtime.sendMessage({
    method: 'GET',
    action: 'endic',
    url: queryURL,
    }, function(data) {
      if (!data || !data.searchResultMap)
        return

    var items = data.searchResultMap.searchResultListMap.WORD.items;

    if (items.length > 0) {
      var html = '';
      var audio = null;

      for (var i = 0; i < items.length; i++) {
        var word = items[i].expEntry;
        var means = items[i].meansCollector[0].means;
        var phonetic = items[i].searchPhoneticSymbolList[0]
        var partOfSpeech = items[i].meansCollector[0].partOfSpeech;
        if (audio == null && items[i].searchPhoneticSymbolList.length > 0) {
          audio = items[i].searchPhoneticSymbolList[0].symbolFile;
        }

        html += '<div class="naverdic-wordTitle"><a href="' + linkURL + ' " target="_blank">' + word + '</a>';

        if (partOfSpeech) {
          html += ' [' + partOfSpeech + ']'
        }

        if (audio && noAudios == 0) {
          if (phonetic && phonetic.symbolValue) {
            html += '<span>[' + phonetic.symbolValue + ']</span>'
          }

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

      showFrame(e, html, x, y)
    }
  });
}

function translateWord(e, phrase, top, left, naver_client_id, naver_client_secret) {
  var client_id = naver_client_id;
  var client_secret = naver_client_secret;
  var queryURL = 'http://www.gencode.me/api/papago/';
  var formData = "source=en&target=ko&client_id=" + client_id + "&client_secret=" + client_secret + "&text=" + phrase;

  chrome.runtime.sendMessage({
    method: 'POST',
    action: 'papago',
    data: formData,
    url: queryURL,
    }, function(data) {
      showFrame(e, data, top, left);
  });
}

function showFrame(e, datain, top, left) {
  var div = document.createElement('div')
  div.innerHTML = datain;
  div.setAttribute('id', 'popupFrame');
  div.className = 'popupFrame';
  div.style.cssText = "position:absolute;top:" + top + "px;left:" + left + "px;width:" + popupWidth +"px;height:auto;line-height:normal;display:block;z-index:99997;background-color:" + popupColor + ";padding:5px;font-size: " + popupFontsize + "pt;color:black;box-shadow:0 0 3px 3px #888;";

  document.body.appendChild(div)

  var height = document.getElementById('popupFrame').height;
  var winheight = window.height;

  if (height + e.clientY > winheight) {
    newtop = top - height - 2 * marginY;
    document.getElementById('popupFrame').cssText = "top: " + newtop + ";";
  }

  document.getElementById('popupFrame').onmousedown = function(e) {
    e.stopPropagation();
  }
  document.getElementById('popupFrame').onmousemove = function(e) {
    e.stopPropagation();
  }
  document.getElementById('popupFrame').onmouseup = function(e) {
    e.stopPropagation();
  }
}

var checkTrigger = function(e, key) {
  if (window.navigator.platform.includes('Mac')) {
    ctrlKey = e.metaKey;
  }
  else {
    ctrlKey = e.ctrlKey;
  }
  switch(key) {
    case 'ctrl':
      if (!ctrlKey || e.altKey)
        return false;
      break;
    case 'alt':
      if (ctrlKey || !e.altKey)
        return false;
      break;
    case 'ctrlalt':
      if (!ctrlKey || !e.altKey)
        return false;
      break;
    case 'none':
    default:
      if (ctrlKey || e.altKey)
        return false;
      break;
  }

  return true;
}

function openPopup(e, naver_client_id, naver_client_secret, type = 'search') {
  var top = e.clientY + document.querySelector('html').scrollTop + marginY;
  var left = e.clientX - 180 + document.querySelector('html').scrollLeft;
  var clientY = e.clientY;
  if (e.clientX - 180 < marginX)
    left = marginX + document.querySelector('html').scrollLeft;

  var winWidth = window.width;
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
    naver_client_secret: '',
    popup_bgcolor: '#FFFFDD',
    popup_fontsize: '11'
  }, function(items) {
    if (!items.dclick && !items.drag && !items.translate) {
      return;
    }
    var mousedown = false;
    var mousemove = false;
    var scrollXOffset = 8;
    var clicks = 0;
    var timeout;
    var prevX;

    if (items.popup_bgcolor) {
      popupColor = items.popup_bgcolor;
    }
    if (items.popup_fontsize) {
      popupFontsize = items.popup_fontsize;
    }

    document.body.onmousedown = function(e) {
      mousedown = true;
      prevX = e.pageX;
    }

    document.body.onmousemove = function(e) {
      if (!mousedown)
        return;
      if (Math.abs(e.pageX - prevX) > scrollXOffset)
        mousemove = true;
    }

    document.body.onmouseup = function(e) {
      if (mousemove && items.drag && checkTrigger(e, items.drag_trigger_key)) {
        mousedown = mousemove = false;
        if (document.getElementById('popupFrame')) {
          document.getElementById('popupFrame').remove();
        }
        openPopup(e, items.naver_client_id, items.naver_client_secret);
      }
      else if (mousemove && items.translate && checkTrigger(e, items.translate_trigger_key)) {
        mousedown = mousemove = false;
        if (document.getElementById('popupFrame')) {
          document.getElementById('popupFrame').remove();
        }
        openPopup(e, items.naver_client_id, items.naver_client_secret, 'translate');
      }
      else if (!mousemove && items.dclick && checkTrigger(e, items.dclick_trigger_key)) {
        mousedown = false;
        clicks++;

        if (clicks == 1) {
          timeout = setTimeout(function () {
            if (document.getElementById('popupFrame')) {
              document.getElementById('popupFrame').remove();
            }
            clicks = 0;
          }, 400);
        } else {
          if (document.getElementById('popupFrame')) {
            document.getElementById('popupFrame').remove();
          }
          clearTimeout(timeout);
          openPopup(e, items.naver_client_id, items.naver_client_secret);
          clicks = 0;
        }
      }
      else {
        mousedown = mousemove = false;
        if (document.getElementById('popupFrame')) {
          document.getElementById('popupFrame').remove();
        }
      }
    }
  });
}

registerEventListener();
