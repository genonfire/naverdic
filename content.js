var marginX = 10;
var marginY = 20;
var popupWidth = 360;
var noAudios = 0;
var popupColor = '#FFFFDD';
var popupFontsize = '11';

function searchWord(e, word, x, y) {
  const dicURL = "https://dict.naver.com/search.dict?dicQuery=";
  const queryURL = dicURL + word;

  if (word.length == 0) {
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

    showFrame(e, html, x, y);
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
  var div = document.createElement('div');
  div.innerHTML = datain;
  div.setAttribute('id', 'popupFrame');
  div.className = 'popupFrame';
  div.style.cssText = "position:absolute;top:" + top + "px;left:" + left + "px;width:" + popupWidth +"px;height:auto;line-height:normal;display:block;z-index:99997;background-color:" + popupColor + ";padding:5px;font-size: " + popupFontsize + "pt;color:black;box-shadow:0 0 3px 3px #888;";

  document.body.appendChild(div);

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
  if (e.clientX - 180 < marginX) {
    left = marginX + document.querySelector('html').scrollLeft;
  }

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
