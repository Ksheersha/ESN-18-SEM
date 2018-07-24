function messageContentSyntax(docs) {
  var divStr = '';
  if (docs.username === user) {
    divStr += '<div class="chat-content card text-white">';
  } else {
    divStr += '<div class="chat-content card bg-light">';
  }
  return divStr;
}

function appendMessage(elementID, docs, isPrepend,isImage = false){
  var user = $("#userName").html();
  var divStr = '';
  divStr += messageChatBoxSyntax(docs);
  divStr += messageSenderInfoSyntax(docs);
  divStr += messageContentSyntax(docs);


  if(isImage === true){
    divStr += "<img style='height: 7rem' src="
      + docs.content
      + ">"
  }else
    divStr += docs.content;
  divStr += '</div></div>';

  var msgDiv = $(elementID.toString());
  if (isPrepend) {
    msgDiv.prepend(divStr);
  } else {
    msgDiv.append(divStr);
  }
}

function renderMoreBtn(searchInput, btn, response) {
  if (searchInput.val() === "") {     // not in search mode
    return;
  }
  if (response.length < 10) {
    btn.fadeOut();
  } else {
    navSearchOffset += 10;
    privateSearchOffset += 10;
    btn.fadeIn();
  }
}

function scrollBottom(searchElement, messageElement) {
  if (!isSearch(searchElement)) {
    messageElement.scrollTop(messageElement.prop('scrollHeight'));
  }
}

let postGroupMessageHandler = {
  201: function (data, status) {

  },
  500: function (response) {

  }
};

function structGroupMsg(usernameDOM,idDOM,groupIdDOM,userStatusDOM) {
  let username = usernameDOM.html();
  let id = idDOM.html();
  let groupId = groupIdDOM.html();
  let userStatus = userStatusDOM.html();
  return  {username, id, groupId, userStatus};
}

function sendGroupMessage(userDOM,idDOM,chatContentDOM,groupIdDOM,userStatusDOM) {
  let chatContent = getEscapedInputBoxContent(chatContentDOM);
  let data = structGroupMsg(userDOM,idDOM,groupIdDOM,userStatusDOM);
  data.chatContent = chatContent;
  console.log(data);

  if (chatContent === '') {
    showMessageModal('Group chat message', 'Please input message before clicking send');
  } else {
    postGroupMessage(data, postGroupMessageHandler);
    $(chatContentDOM).val("");
  }
}
