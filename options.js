function save_options() {
  var trigger_key = document.getElementById('trigger_key').value;
  chrome.storage.sync.set({
    trigger_key: trigger_key
  }, function() {
    var status = document.getElementById('option_save_status');
    status.textContent = '저장되었습니다.';
    setTimeout(function() {
      status.textContent = '';
    }, 3000);
  });
}

function restore_options() {
  chrome.storage.sync.get({
    trigger_key: 'none'
  }, function(items) {
    document.getElementById('trigger_key').value = items.trigger_key;
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('option_save').addEventListener('click', save_options);
