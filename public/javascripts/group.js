/**
 * Design insights:
 *
 * 1. There are conceptually two pages - Group list page & Group editing page.
 * 2. Each page is considered as a "state".
 * 3. Loading a page is a transition between states, and is handled by a transition
 * worker function, with possible
 *
 *
 * Current refactor status:
 *
 *  1. All new support functions are done.
 *  2. Unused legacy functions are removed.
 *  3. Submit button polymorphism NEEDED.
 *
 *
 * Refactor tips:
 *
 *  1. Read the "TODO <Refactor Needed>" comments before each legacy function.
 *  2. To display each page, just call `loadGroupListPage()` or `loadEditingPage(groupId)`.
 *  3. Migrate HTTP related functions to `/public/javascript/util/HTTPUtil.js`.
 *  4. Use `let` instead `var` for local variable declarations.
 *
 *
 *  Nathaniel
 *  03:25 am
 *  3/18/18
 */

// Global variables
const newGroupId = 'new_group';
let groupData = {'new_group': {'participants': [], 'owner': id, 'name': '', description: ''}};
let highlightWaitlist = [];
let editorGroupId = newGroupId;

// Group List page DOMs
let groupListPageDOM = $('#group_directory');
let ownedGroupListDOM = $('#ownedGroups');
let participatedGroupListDOM = $('#participantGroups');
let groupPageAlertDOM = $('#groupPageAlert');
let groupPageAlertOKButtonDOM = $('#groupPageAlertOKButton');

// Group Editing page DOMs
let groupEditingPageDOM = $('#groups_manage');
let groupNameInputDOM = $('#group_name');
let groupDescriptionInputDOM = $('#group_description');
let groupOwnerTextBoxDOM = $('#group_owner');
let participantListDOM = $('#participant_list');
let createGroupButtonDOM = $('#createNewGroup');
let submitGroupButtonDOM = $('#submitGroupInfo');
let cancelGroupButtonDOM = $('#cancelGroupInfo');
let deleteGroupButtonDOM = $('#deleteGroupInfo');
let groupAlertTextDOM = $('#groupAlertText');
let groupsToHide=[],citizenGroupsClosed=[];

/**
 * Build a list item HTML in Group List page
 * @param group A single `Group` object in the list return by the "Group List" API
 * @returns HTML segment
 */
function buildGroupListItemHTML(group) {
  return $('<li class="list-group-item">' +
    '<a class="group_info_button nav-item nav-link nav-link" group_id=' + group._id +
    '><i class="material-icons md-24">settings</i></a>' +
    '<a onclick="showGroupChatModal(this,citizenGroupsClosed);">' +
    "<div class='page-hidden-info hidden-name'>" + group.name + "</div>" +
    "<div class='page-hidden-info hidden-id'>" + group._id + "</div>" +
    group.name + '</a></li>');
}

/**
 * Build the Group List page HTML
 */
function buildGroupListHTML(){
  let onSuccess = function(data){
    // build owned groups list
    ownedGroupListDOM.empty();
    ownedGroupListDOM.append($('<li class="list-group-item home-nav">Groups that I manage</li>'));
    for (let i = 0; i < data.ownedGroups.length; i++) {
      if(groupsToHide.indexOf(data.ownedGroups[i].name) <= -1 && data.ownedGroups[i].owner===id) {
        ownedGroupListDOM.append(buildGroupListItemHTML(data.ownedGroups[i],citizenGroupsClosed));
        groupData[data.ownedGroups[i]._id] = data.ownedGroups[i];
      }
      else {
        console.log("GROUPS HIDDEN:"+data.ownedGroups[i].name+",index:"+groupsToHide.indexOf(data.ownedGroups[i].name));
      }
    }
    // build participating group list
    participatedGroupListDOM.empty();
    participatedGroupListDOM.append($('<li class="list-group-item home-nav">Groups that I belong to</li>'));
    for (let i = 0; i < data.participantGroups.length; i++) {
      if(groupsToHide.indexOf(data.participantGroups[i].name) <= -1 && data.participantGroups[i].owner!== id) {
        participatedGroupListDOM.append(buildGroupListItemHTML(data.participantGroups[i]));
        groupData[data.participantGroups[i]._id] = data.participantGroups[i];
      }
      else {
        console.log("GROUPS HIDDEN:"+data.participantGroups[i].name+",index:"+groupsToHide.indexOf(data.participantGroups[i].name));
      }
    }
  };

  let onError = function(){
    showMessageModal('Error!', 'Your groups information could not be loaded. Please try again.');
  };

  getGroupListAjax(id, onSuccess, onError);
}

/**
 * Build the HTML section containing group name, description and owner
 * @param groupId
 */
function buildGroupInfoHTML(groupId){
  let currentGroup = groupData[groupId];
  groupNameInputDOM.val(currentGroup.name);
  groupDescriptionInputDOM.val(currentGroup.description);
  groupOwnerTextBoxDOM.attr('userId', currentGroup.owner);
  if(currentGroup.owner){
    getUserByIdHTTP(currentGroup.owner, function(user){
      groupOwnerTextBoxDOM.val(user.username);
    });
  }
  else{
    groupOwnerTextBoxDOM.val('System');
  }

  if(isOwner()){
    groupNameInputDOM.removeAttr("disabled");
    groupDescriptionInputDOM.removeAttr("disabled");
  }
  else{
    groupNameInputDOM.attr("disabled", "disabled");
    groupDescriptionInputDOM.attr("disabled", "disabled");
  }
}

/**
 * Build the CSS class name for participating/non-participating list item
 * @param participating Boolean; whether the user is a current participant
 * @returns {string} The CSS class name for `#participant_list.li`
 */
function buildCssClassNameForParticipantListItem(participating){
  let base = "list-group-item list-group-item-";
  if(participating){
    base += "primary";
  }
  else{
    base += "secondary";
  }

  return base
}


function changeListItemCheckedStatus(listItemDOM){
  let checkedClass = buildCssClassNameForParticipantListItem(true);
  let uncheckedClass = buildCssClassNameForParticipantListItem(false);
  if(listItemDOM.hasClass(checkedClass)){
    listItemDOM.removeClass(checkedClass);
    listItemDOM.addClass(uncheckedClass);
  }
  else if(listItemDOM.hasClass(uncheckedClass)){
    listItemDOM.removeClass(uncheckedClass);
    listItemDOM.addClass(checkedClass);
  }
}

/**
 * Click event handler; check/uncheck the participant list item when users clicks s
 * @param participantListItemDOM The DOM of the list item selected by JQuery
 */
function changeParticipantListItemCheckedStatus(participantListItemDOM){
  if(!isOwner()){
    return;
  }
  changeListItemCheckedStatus(participantListItemDOM);
}

/**
 * Build a single `#participant_list.li` DOM in the group editing page
 * @param user The user to be displayed in the list
 * @param participating Boolean, whether a user is a current participant
 * @returns {*|jQuery|HTMLElement}
 */
function buildParticipantListItemHtml(user, participating){
  return $('<li class="' + buildCssClassNameForParticipantListItem(participating) + '" '
    +  'id=participantListItemUserId' + user._id + ' userId=' + user._id + '> ' + user.username + '</li>');
}

/**
 * Build the `#participant_list` DOM in the group editing page
 * @param groupId
 */
function buildParticipantListHTML(groupId){
  let group = groupData[groupId];
  let groupIsOwned = isOwner(groupId);

  // clear current participant list
  participantListDOM.empty();

  // define what to do after getting a list of users from backend
  let getUsersCallback = function(users){

    // split the list of users into participants and non-participants
    let currentParticipants = new Set(group.participants);
    let checked = [];   // participants
    let unchecked = []; // non-participants
    for(let i = 0; i < users.length; ++i){
      let currentUser = users[i];
      let currentId = users[i]._id;
      if(currentId != id){
        if(currentParticipants.has(currentId)){
          checked.push(currentUser)
        }
        else{
          unchecked.push(currentUser)
        }
      }
    }

    if(!groupIsOwned){
      participantListDOM.append(buildParticipantListItemHtml({_id: id, username: user}, true));
    }

    // render participants
    for(let i = 0; i < checked.length; ++i){
      participantListDOM.append(buildParticipantListItemHtml(checked[i], true));
    }

    if(groupIsOwned){
      // render non-participants
      for(let i = 0; i < unchecked.length; ++i){
        participantListDOM.append(buildParticipantListItemHtml(unchecked[i], false));
      }
    }
  };

  // call API to get a list of users
  getUsersHTTP(getUsersCallback, null, false);
}

function isOwner(){
  return (groupData[editorGroupId].owner === id);
}

function buildEditingPageButtonsHTML(groupId){
  if(isOwner()){
    submitGroupButtonDOM.show();
    deleteGroupButtonDOM.text('Delete')
  }
  else{
    submitGroupButtonDOM.hide();
    deleteGroupButtonDOM.text('Quit This Group')
  }
  if(groupId === newGroupId){

    deleteGroupButtonDOM.hide();
  }
  else{
    deleteGroupButtonDOM.show();
  }
  if(groupData[groupId].owner){
    deleteGroupButtonDOM.show();
  }
  else{
    deleteGroupButtonDOM.hide();
  }
}

/**
 * Extract the current values in the form, e.g.
 *    {
 *      "name": "My new group",
 *      "description": "Some description",
 *      "owner": "5aad5695ba8e42f9c9860cd9",
 *      "participants": [
 *        "5aad569fba8e42f9c9860cde"
 *      ]
 *     }
 * @returns Formatted form values
 */
function extractGroupDataFromForm(){
  let currentGroup = {
    'name': groupNameInputDOM.val(),
    'description': groupDescriptionInputDOM.val()
  };

  let checked = [];

  $("li[id^=participantListItemUserId]").each(function(){
    if($(this).hasClass(buildCssClassNameForParticipantListItem(true))){
      checked.push($(this).attr('userId'));
    }
  });
  currentGroup['participants'] = checked;
  return currentGroup;
}

function createGroup(data) {
  let newGroupData = data;
  newGroupData.participants = JSON.stringify(newGroupData.participants);

  let createNewGroupResponseHandler = {
    201: function(){
      groupPageShowAlert('Group created successfully!');
      loadGroupListPage();
    },
    404: function() {
      groupPageShowAlert('Error! Group is not created.');
      loadGroupListPage();
    }
  };
  createGroupAjax(id, newGroupData, createNewGroupResponseHandler);
}

/**
 * Load the Group List page
 */
function loadGroupListPage() {
  buildGroupListHTML();
  groupEditingPageDOM.hide();
  groupListPageDOM.show();
  dismissNewGroupAlert();
}

// TODO: alert copied from private chat. needs refactor
function dismissNewGroupAlert() {
  groupTab.find("i.material-icons.md-24.md-light").css("color", "rgba(255, 255, 255)");
  highlightWaitlist.forEach(function (groupName) {
    let frame = groupsWindow.find('.hidden-name:contains(\'' + groupName + '\')').
      parent().
      parent();
    frame.css('background-color', 'rgba(255, 255, 80, 0.4)');
    console.log(frame);
  });
  highlightWaitlist = [];
  setTimeout(function () {
    let frames = groupsWindow.find('.hidden-name').
      parent().
      parent();
    frames.css('background-color', 'rgba(255, 255, 255)');
  }, 5000)
}

/**
 * Load the Group Editing page
 * @param groupId
 */
function loadEditingPage(groupId){
  editorGroupId = groupId;
  buildGroupInfoHTML(groupId);
  buildParticipantListHTML(groupId);
  buildEditingPageButtonsHTML(groupId);
  groupListPageDOM.hide();
  groupEditingPageDOM.show();
}

function groupPageShowAlert(text, done){
  let handler = done;
  if(!handler){
    handler = function(){}
  }
  groupPageAlertOKButtonDOM.off('click').on('click', handler);
  groupPageAlertDOM.modal('show');
  groupAlertTextDOM.text(text);
}

function loadNewParicipantAlert() {
  groupTab.find("i.material-icons.md-24.md-light").css("color", "rgba(255, 255, 10, 1)");
  groupTab.find("i.tab-badge").css("display", "block");
}

function highlightGroupByName(groupName) {
  if (groupsWindow.is(':visible')) {
    groupsWindow.find('.hidden-name:contains(\'' + groupName + '\')').
      parent().
      parent()
      .css('background-color', 'rgba(255, 255, 80, 0.4)');
    setTimeout(function () {
      frame.css('background-color', 'rgba(255, 255, 255)');
    }, 5000)
  } else {
    if (highlightWaitlist.indexOf(groupName, 0) < 0) {
      console.log('pushed into queue');
      highlightWaitlist.push(groupName);
    }
  }
}

function updateGroup(data){
  updateGroupAjax(editorGroupId, data, function () {
    groupPageShowAlert('Group updated successfully!');
    loadGroupListPage();
  }, function () {
    groupPageShowAlert('Error! Group is not updated.');
    loadGroupListPage();
  });
}

function quitGroup(){
  quitGroupAjax(id, editorGroupId, function () {
    groupPageShowAlert('You left the group!');
    loadGroupListPage();
  }, function () {
    groupPageShowAlert('Error! Operation failed.');
    loadGroupListPage();
  })
}

function deleteGroup(){
  deleteGroupAjax(editorGroupId, function(){
    groupPageShowAlert('Group deleted!');
    loadGroupListPage();
  }, function(){
    groupPageShowAlert('Error! Operation failed.');
    loadGroupListPage();
  })
}

function validateGroupName(groupId, groupName, onValid){
  checkGroupNamingAjax(groupId, groupName, function(data){
    if(data.allowed){
      onValid();
    }
    else{
      groupPageShowAlert('Error! Group name already exists.', function(){});
    }
  })
}

function validateGroupData(data, onValid){
  if(data.name === ''){
    groupPageShowAlert('Error! Please enter group name.', function(){});
  }

  else if(data.participants == undefined || data.participants.length < 1){
    groupPageShowAlert('Error! Participant list cannot be empty', function(){});
  }

  else{
    validateGroupName(editorGroupId, data.name, onValid);
  }
}

$(function () {
  ownedGroupListDOM.on('click', '.group_info_button', function () {
    let groupId = $(this).attr('group_id');
    loadEditingPage(groupId)
  });

  participatedGroupListDOM.on('click', '.group_info_button', function () {
    let groupId = $(this).attr('group_id');
    loadEditingPage(groupId);
  });

  participantListDOM.on('click', 'li', function(){
    changeParticipantListItemCheckedStatus($(this))
  });

  createGroupButtonDOM.click(function() {
    loadEditingPage(newGroupId);
  });

  submitGroupButtonDOM.click(function() {
    let data = extractGroupDataFromForm();
    validateGroupData(data, function(){
      if(editorGroupId === newGroupId){
        createGroup(data);
      }
      else{
        updateGroup(data);
      }
    });
  });

  cancelGroupButtonDOM.click(function() {
    loadGroupListPage();
  });

  deleteGroupButtonDOM.click(function(){
    if(isOwner()){
      deleteGroup();
    }
    else{
      quitGroup();
    }
  });

  /* SOCKET.IO LISTENERS */
  socket.on('added to new group', function (msg) {
    if (msg.target !== id) return;
    if (!groupsWindow.is(':visible')) {
      loadNewParicipantAlert();
    }
    highlightGroupByName(msg.groupName);
  });
});

function allClosedIncidents(incidents){
  for( i=0;i<incidents.length;i++) {
    groupsToHide[i]="IT"+incidents[i].displayId.slice(1);
    citizenGroupsClosed[i]="IC"+incidents[i].displayId.slice(1);
  }
}

