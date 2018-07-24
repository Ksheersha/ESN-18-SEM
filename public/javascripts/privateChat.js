function isInPrivateChat(sourceId) {
  return modalPrivateChat.css("display") !== "none"
    && $("#toID").html() === sourceId;
}

function checkChat(toName, toID) {
  if (toID === id) {
    showMessageModal("Private chat", "Please don't chat with yourself!");
    return true;
  }
  $("#toID").html(toID);
  $("#toName").html(toName);
  return false;
}

function showPrivateChatModal(element) {
  $(element).parent().css("background-color", "");
  privateSearchInput.val("");
  $(element).find(".list-badge").css("display", "none");
  let toName = $(element).find('.hidden-name').text();
  let toID = $(element).find('.hidden-id').text();
  if (checkChat(toName, toID) === true) {
    return;
  }
  modalPrivateChat.find('.modal-content').height($( window ).height() - 30);
  let titleStr = "Private chat with " + toName;
  modalPrivateChat.find('.modal-title').html(titleStr);
  getPrivateMessageHTTP(id, toID, reloadPrivateMessage);
  $('#modalPrivateChat').modal('show');
}

function structPrivateMsg() {
  var username = $("#userName").html();
  var id= $("#id").html();
  var chatContent = getEscapedInputBoxContent($("#private_chat_content"));
  var toID = $("#toID").html();
  var userStatus = $('#userStatus').html();

  var data={
    username,
    id,
    chatContent,
    toID,
    userStatus,
  }
  return data;
}

function sendPrivateMessage() {
  var chatContent = getEscapedInputBoxContent($("#private_chat_content"));
  var data = structPrivateMsg();

  if (chatContent === '') {
    showMessageModal('Private chat message', 'Please input message before clicking send');
  } else {
    // in HTTPUtil;
    postPrivateMessageHTTP(data, {
      200: function (data, status) {

      },
      500: function (response) {

      }
    });
    $('#private_chat_content').val("");
  }
}

function renderPrivateMessage(response) {
  renderMoreBtn(privateSearchInput, privateMoreBtn, response);
  for (let i = 0; i < response.length; i++) {
    appendMessage('#privateHistoryMsg', response[i], !isSearch(privateSearchInput));
  }
  scrollBottom(privateSearchInput, $("#privateHistoryMsg"));
}

function reloadPrivateMessage(response) {
  $('#privateHistoryMsg').html("");
  renderPrivateMessage(response);
}

function showNavBadge() {
  userListTab.find("i.material-icons.md-24.md-light").css("color", "rgba(255, 255, 10, 1)");
  userListTab.find("i.tab-badge").css("display", "block");
}

function highlightUser(sourceId) {
  userWindow.find(".hidden-id:contains('" + sourceId + "')").parent().parent().css("background-color", "rgba(255, 255, 80, 0.4)");
  userWindow.find(".hidden-id:contains('" + sourceId + "')").parent().find(".list-badge").css("display", "inline");
}

$(function () {
  $('#private_send_button').click(sendPrivateMessage);
  $('#modalPrivateChat').keyup(function (e) {
    if (e.keyCode == 13) $('#private_send_button').click();
  });

  privateShowSearchBtn.click(showPrivateSearch);
  privateHideSearchBtn.click(hidePrivateSearch);
  privateSearchInput.keyup(privateSearchHandler);
  privateMoreBtn.click(privateMessagesMoreBtnHandler);  // show ten more

  // when message successfully sent, update into view
  socket.on('PrivateMessageSent', function(targetId, content) {
    appendMessage('#privateHistoryMsg', content, false);
    scrollBottom(privateSearchInput, $('#privateHistoryMsg'));
  });
  // when receive
  socket.on('ReceivedPrivateMessage', function(sourceId, content) {
    if (isInPrivateChat(sourceId) && !isSearch(privateSearchInput)) {
      appendMessage('#privateHistoryMsg', content, false);
    } else {
      if (!isExpand(userWindow)) {
        showNavBadge();
      }
      unreadIDSet.add(sourceId);
      highlightUser(sourceId);
    }
  });
});