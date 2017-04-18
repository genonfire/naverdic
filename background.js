chrome.runtime.onMessage.addListener(function(request, sender, callback) {
  if (request.action == "xhttp") {

    $.ajax({
        type: request.method,
        url: request.url,
        crossDomain: false,
        dataType: 'html',
        success: function(data) {
          callback(data);
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
          callback();
        }
    });
    return true;
  }
});
