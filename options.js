function save_options() {
  var check_dclick = document.getElementById('check_dclick').checked;
  var dclick_trigger_key = document.getElementById('dclick_trigger_key').value;
  var check_drag = document.getElementById('check_drag').checked;
  var drag_trigger_key = document.getElementById('drag_trigger_key').value;
  var check_translate = document.getElementById('check_translate').checked;
  var translate_trigger_key = document.getElementById('translate_trigger_key').value;
  var naver_client_id = document.getElementById('naver_client_id').value;
  var naver_client_secret = document.getElementById('naver_client_secret').value;
  chrome.storage.sync.set({
    dclick: check_dclick,
    dclick_trigger_key: dclick_trigger_key,
    drag: check_drag,
    drag_trigger_key: drag_trigger_key,
    translate: check_translate,
    translate_trigger_key: translate_trigger_key,
    naver_client_id: naver_client_id,
    naver_client_secret: naver_client_secret
  }, function() {
    var status = document.getElementById('option_save_status');
    status.textContent = '저장되었습니다. (열려있는 창은 새로 고침 후 반영됩니다)';
    setTimeout(function() {
      status.textContent = '';
    }, 5000);
  });
}

function restore_options() {
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
    document.getElementById('check_dclick').checked = items.dclick;
    document.getElementById('dclick_trigger_key').value = items.dclick_trigger_key;
    document.getElementById('check_drag').checked = items.drag;
    document.getElementById('drag_trigger_key').value = items.drag_trigger_key;
    document.getElementById('check_translate').checked = items.translate;
    document.getElementById('translate_trigger_key').value = items.translate_trigger_key;
    document.getElementById('naver_client_id').value = items.naver_client_id;
    document.getElementById('naver_client_secret').value = items.naver_client_secret;
  });

  var version = chrome.app.getDetails().version;
  var status = document.getElementById('version_text');
  status.textContent = version;
}

function reset_options() {
  chrome.storage.sync.set({
    dclick: true,
    dclick_trigger_key: 'none',
    drag: true,
    drag_trigger_key: 'ctrl',
    translate: false,
    translate_trigger_key: 'ctrlalt',
    naver_client_id: '',
    naver_client_secret: ''
  }, function() {
    document.getElementById('check_dclick').checked = true;
    document.getElementById('dclick_trigger_key').value = 'none';
    document.getElementById('check_drag').checked = true;
    document.getElementById('drag_trigger_key').value = 'ctrl';
    document.getElementById('check_translate').checked = false;
    document.getElementById('translate_trigger_key').value = 'ctrlalt';
    document.getElementById('naver_client_id').value = '';
    document.getElementById('naver_client_secret').value = '';
    var status = document.getElementById('option_save_status');
    status.textContent = '초기화 되었습니다.';
    setTimeout(function() {
      status.textContent = '';
    }, 3000);
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('option_save').addEventListener('click', save_options);
document.getElementById('option_reset').addEventListener('click', reset_options);
