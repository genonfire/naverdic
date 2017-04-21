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
  else if (request.action == "navertrans") {
    $.ajax({
        type: request.method,
        url: request.url,
        crossDomain: false,
        data: request.data,
        headers: request.headers,
        success: function(data) {
          callback(data);
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
          alert(XMLHttpRequest);
          callback();
        }
    });
    return true;
  }
});
