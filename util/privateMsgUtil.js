exports.structMsg =function (req) {
  return {
    uid: req.body.sendUid,
    username: req.body.username,
    content: req.body.content,
    to: req.body.uid,
    status: req.body.status
  };
};

function structUnread (targetId, sourceId) {
  return {
    id: targetId,
    list: [sourceId]
  };
};

exports.sendOffline = function (unread_list, targetId, sourceId) {
  let check = false;
  for (let n in unread_list) {
    if (unread_list[n].id === targetId) {
      unread_list[n].list.push(sourceId);
      check = true;
      break;
    }
  }
  if (check === false) {
    let unread = structUnread(targetId, sourceId);
    unread_list.push(unread);
  }
};