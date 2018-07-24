function postAlertMessage(sendId,groupId,content,responseHandler){
  return $.ajax({
    url: "/alert",
    type: "POST",
    data:{sendId,groupId,content},
    statusCode: responseHandler
  });
}

function getAlertMessage(alertId,responseHandler){
  return $.ajax({
    url: "/alert/" + alertId,
    type: "GET",
    statusCode: responseHandler
  });
}

function updateAlertMessage(alertId,userId,responseHandler){
  return $.ajax({
    url: "/alert/list",
    type: "POST",
    data: {alertId,userId},
    statusCode: responseHandler
  });
}