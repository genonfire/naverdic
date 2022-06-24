chrome.runtime.onMessage.addListener(function(request, sender, callback) {
  if (request.action == "endic") {
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
  // if (request.action == "endic") {
  //   fetch(request.url, {
  //     method: request.method
  //   })
  //   .then(response => response.json())
  //   .then(data => callback(data))
  //   return true;
  // }
  else if (request.action == "papago") {
    $.ajax({
      type: request.method,
      url: request.url,
      crossDomain: false,
      data: request.data,
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
