let modalGroupChat = $('#modalGroupChat');
let groupChatContentDOM = $('#group_chat_content');
let groupHistroyMsgDOM = $("#groupHistoryMsg");
let groupSendBtn = $('#group_send_button');

function renderGroupMessage(response) {
  renderMoreBtn(privateSearchInput, privateMoreBtn, response);
  for (let i = 0; i < response.length; i++) {
    appendMessage('#groupHistoryMsg', response[i], !isSearch(privateSearchInput));
  }
  scrollBottom(privateSearchInput, groupHistroyMsgDOM);
}

function reloadGroupMessage(response) {
  groupHistroyMsgDOM.html("");
  renderGroupMessage(response);
}

function showGroupChatModal(element,citizenGroupsClosed) {
  $(element).parent().css("background-color", "");
  privateSearchInput.val("");
  $(element).find(".list-badge").css("display", "none");
  let groupName = $(element).find('.hidden-name').text();
  let groupID = $(element).find('.hidden-id').text();
  if(citizenGroupsClosed.indexOf(groupName) <= -1) {
    $('#group_chat_content').removeAttr('disabled');
  }
  else {
    $('#group_chat_content').attr('disabled',true);
  }
  modalGroupChat.find('.modal-content').height($( window ).height() - 30);
  let idEl = '<div id="groupId" class="page-hidden-info hidden-id">' + groupID +'</div>';
  let titleStr = groupName + idEl;
  modalGroupChat.find('.modal-title').html(titleStr);
  getGroupMessages(groupID, reloadGroupMessage);
  modalGroupChat.modal('show');
}


function sendGroupHelper() {
  let myGroupIdDom = modalGroupChat.find('.hidden-id');
  console.log(myGroupIdDom.html());
  sendGroupMessage(userDOM,idDOM,groupChatContentDOM,myGroupIdDom,userStatusDOM);
}

$(function() {
  groupSendBtn.click(sendGroupHelper);

  // when message successfully sent, update into view
  socket.on('Message send', function(content) {
    appendMessage('#groupHistoryMsg', content, false);
    scrollBottom(privateSearchInput, groupHistroyMsgDOM);
  });
  // when receive
  socket.on('Message receive', function(content) {
    appendMessage('#groupHistoryMsg', content, false);
    scrollBottom(privateSearchInput, groupHistroyMsgDOM);
  });
});
