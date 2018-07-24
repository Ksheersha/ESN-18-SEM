let chatContentDOM = $('#chat_content');
let userDOM = $('#userName');
let idDOM = $('#id');
let userStatusDOM = $('#userStatus');
let historyMsgDOM = $('#historyMsg');
let selectCategoryDOM = $('#selectCategory');
let selectIdDOM = $('#selectID');
let sendBtn = $('#send_button');
let imageSendModal = $('#modalSendImage');
let imageBtn = $('#image_button');
let sendImageBtn = $('#sendImage');
let groupListDOM = $('#group-list');
let contactListDOM = $('#contact-list');
let currentContactDOM = $('#currentContact');
let alertModal = $('#alertPanelModal');
let alertBtn = $('#alert_button');


// responder list
let groupMessageResponder = {
  200:reloadPublicMessage,
  500:function(err){
    console.log(err);
  }
};

let groupListResponder = {
  200:reloadGroupDirectory,
  500:function(err){
    console.log(err);
  }
};

let privateMessageResponder = {
  500: function (err) {
    console.log(err);
  }
};


function sendTextMessage() {
  sendMessageUtil("",false);
}

function sendImageMessage(content) {
  sendMessageUtil(content,true);
}

function sendMessageUtil(content,isImage){
  let data = retrieveMsg(content,isImage);
  let isEmpty = data.chatContent === '';
  let category = selectCategoryDOM.html();
  let isGroup = category === 'group';
  let isContact = category === 'contact';
  if (isEmpty) {
    showMessageModal('Alert', 'Please input message before clicking send');
  } else {
    if (isGroup && isImage) postGroupImageMessage(data,postGroupMessageHandler);
    else if (isGroup && !isImage) postGroupMessage(data, postGroupMessageHandler);
    else if (isContact && isImage) postPrivateImageMessage(data,privateMessageResponder);
    else if (isContact && !isImage) postPrivateMessageHTTP(data,privateMessageResponder);
    chatContentDOM.val('');
  }
}

function retrieveMsg(content,isImage){
  let username = userDOM.html();
  let id = idDOM.html();
  let toID = selectIdDOM.html();
  let category = selectCategoryDOM.html();
  let chatContent = (isImage === false)? getEscapedInputBoxContent(chatContentDOM):content;
  let userStatus = userStatusDOM.html();

  let contactMessageData={toID, id, username, chatContent, userStatus,};
  let groupMessageData = structGroupMsg(userDOM,idDOM,selectIdDOM,userStatusDOM);
  groupMessageData.chatContent = chatContent;

  if (category === 'group'){
    return groupMessageData;
  }else if (category === 'contact'){
    return contactMessageData;
  }
  return null;
}


function renderPublicMessage(data) {
  renderMoreBtn(navSearchInput, navMoreBtn, data);
  for (let i = 0; i < data.length; i++) {
      if(data[i].content.startsWith('Image: ')){
          // the image message format is 'Image: Id'
          // we need the id, start from index 8
          let imageId = data[i].content.substring(7);
          getImageById(imageId,function (image) {
              data[i].content = image.content;
              appendMessage('#historyMsg', data[i],false,true);
              scrollBottom(navSearchInput, historyMsgDOM);
          });
      }else{
          appendMessage('#historyMsg', data[i],true,false);
          scrollBottom(navSearchInput, historyMsgDOM);
      }
  }
}

function reloadPublicMessage(data) {
  historyMsgDOM.html("");      // clear previous message to reload
  renderPublicMessage(data);
}

function reloadContactsDirectory(userList){
  contactListDOM.html("");
  for (let i = 0; i < userList.length; i++) {
     appendEntry(userList[i],'clickContact',false);
  }
}

function sortGroups(groupData) {
  let participantGroup = groupData.participantGroups;
  let ownerGroup = groupData.ownedGroups;
  let group = Array();
  for (let i = 0;i < participantGroup.length; i++) {
    group.push(participantGroup[i]);
  }
  for (let i = 0;i < ownerGroup.length; i++) {
    group.push(ownerGroup[i]);
  }
  // compare string alphabetically
  group.sort(function (a, b) {
    return a.name < b.name ;
  });
  return group;
}

function reloadGroupDirectory(groupData){
  groupListDOM.html('');
  let group = sortGroups(groupData);
  for (let i = 0; i < group.length; i++) {
     appendEntry(group[i],'clickGroup',true);
  }
}

function clickContact(element){
    let toName = $(element).find('.hidden-name').text();
    let toID = $(element).find('.hidden-id').text();
    if (checkChat(toName, toID) === true) {
        return;
    }
    selectCategoryDOM.text('contact');
    currentContactDOM.text(toName);
    selectIdDOM.text(toID);
    historyMsgDOM.html('');
    getPrivateMessageHTTP(idDOM.html(), toID, reloadPublicMessage);
}

function clickGroup(element){
  let groupID = $(element).find('.hidden-id').text();
  let groupName = $(element).find('.hidden-name').text();
  historyMsgDOM.html('');
  currentContactDOM.text(groupName);
  selectCategoryDOM.text('group');
  selectIdDOM.text(groupID);
  getGroupMessageById(groupID,groupMessageResponder);
}


function constructEntry(data,func,isGroup) {
    let id = $("#id").html();
    let namePrefix = ((isGroup)?"":usertag[data.role].namePrefix);
    let dataName = namePrefix + data.name;
    let dataUserName = namePrefix + data.username;
    let showName = ((isGroup)? dataName:dataUserName);
    let name = (data.isOnline) ?
        "<span class='username online' style='word-break:break-all'>&nbsp;" :
      "<span class='username offline' style='word-break:break-all'>&nbsp;";
    name += showName;
    name += (data._id === id)? "(ME)</span>" : "</span>";

    return "<li "
        + "title='Click to send a private message' onclick="
        + func
        + "(this);> "
        + "<label>"
        + name
        + "</label>"
        + "<div class='page-hidden-info hidden-name'>"
        + showName
        + "</div>"
        + "<div class='page-hidden-info hidden-id'>" + data._id + "</div>"
        + "</li>";
}

function appendEntry(data,func,isGroup){
  let entry = constructEntry(data,func,isGroup);
  if (isGroup) {
    groupListDOM.append(entry);
  }else {
    contactListDOM.append(entry);
  }
}

function messageHandler(msg) {
  let content = msg.content;
  if (!isSearch(navSearchInput)) {    // not in search mode, update new public message
    if(content.startsWith('Image: ')){
      // the image message format is 'Image: Id'
      // we need the id, start from index 8
      let imageId = content.substring(7);
      getImageById(imageId,function (image) {
        msg.content = image.content;
        appendMessage('#historyMsg', msg, false,true);
        scrollBottom(navSearchInput, historyMsgDOM);
      });
    }else{
      appendMessage('#historyMsg',msg, false,false);
      scrollBottom(navSearchInput, historyMsgDOM);
    }
  }
}

function receiveMessageHandler(msg){
  let receiverId = msg.to;
  let senderId = msg.uid;
  let currentId = selectIdDOM.html();
  let currentCategory = selectCategoryDOM.html();
  if (currentCategory === 'group') {
    if (receiverId !== currentId) return;
  } else if (currentCategory === 'contact'){
    if (senderId !== currentId) return;
  } else {
    return;
  }
  messageHandler(msg);
}

let openFile = function(file) {
    let input = file.target;
    let reader = new FileReader();
    reader.onload = function(){
        let dataURL = reader.result;
        let output = document.getElementById('outputImage');
        output.src = dataURL;
    };
    reader.readAsDataURL(input.files[0]);
};


function clickImageButton() {
  let image = document.getElementById('outputImage');
  image.src = "";
  imageSendModal.modal('show');
}

function clickSendImage(){
  let image = document.getElementById('outputImage');
  let imageContent = image.src;
  imageSendModal.modal('hide');
  if(!imageContent.startsWith('data:image')) return;
  sendImageMessage(imageContent);
}

function clickPubChat (isBack = false) {
  refreshPage(isBack, MESSAGES_WINDOW_TITLE);
  navShowSearchBtn.show();
  chatWindow.show();
  historyMsgDOM.html('');
  currentContactDOM.text('None');
  getUsersHTTP(reloadContactsDirectory, null, role === 'Administrator');
  getGroupInfoById(id,groupListResponder);
}

$(function () {
  pubChatTab.click(function () {
    clickPubChat();
  });

  pubChatBtn.click(function () {
    clickPubChat();
  });

  alertBtn.click(function () {
    showAlertPanel();
  });

  sendBtn.click(sendTextMessage);
  chatContentDOM.keyup(function (e) {
    if (e.keyCode === 13) sendBtn.click();
  });

  imageBtn.click(clickImageButton);
  sendImageBtn.click(clickSendImage);

    // monitor new message. Need to parse doc as JSON before calling appendMessage
  socket.on('Message send', messageHandler);
  socket.on('Message receive',receiveMessageHandler)
});