function save_options() {
  var check_dclick = document.getElementById('check_dclick').checked;
  var dclick_trigger_key = document.getElementById('dclick_trigger_key').value;
  var check_drag = document.getElementById('check_drag').checked;
  var drag_trigger_key = document.getElementById('drag_trigger_key').value;
  chrome.storage.sync.set({
    dclick: check_dclick,
    dclick_trigger_key: dclick_trigger_key,
    drag: check_drag,
    drag_trigger_key: drag_trigger_key
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
    dclick: 'true',
    dclick_trigger_key: 'none',
    drag: 'true',
    drag_trigger_key: 'ctrl'
  }, function(items) {
    document.getElementById('check_dclick').checked = items.dclick;
    document.getElementById('dclick_trigger_key').value = items.dclick_trigger_key;
    document.getElementById('check_drag').checked = items.drag;
    document.getElementById('drag_trigger_key').value = items.drag_trigger_key;
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('option_save').addEventListener('click', save_options);
