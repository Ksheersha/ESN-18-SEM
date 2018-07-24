let userListAPI = {};

userListAPI.buildReadOnlyListItem = function (user, idPrefix) {
  return $(
    '<li class="list-group-item list-group-item-secondary" id="' + idPrefix + user._id + '" userId="' + user._id + '">' +
    '</li>'
  )
};

userListAPI.buildReadOnlyList = function (listDOM, users, idPrefix) {
  listDOM.empty();
  for (let i = 0; i < users.length; ++i) {
    listDOM.append(userListAPI.buildReadOnlyListItem(users[i], idPrefix));
  }
};

userListAPI.buildSelectionListItem = function (user, checked, idPrefix) {
  let checkedString = '';

  if(checked){
    checkedString = 'checked'
  }

  return $(

    '<li class="list-group-item list-group-item-secondary">' +
    '  <label>' +
    '    <input type="checkbox" ' + checkedString + ' id="' + idPrefix + user._id +'" userId="' + user._id +'"/>' +
    '  </label>' +
    user.username +
    '</li>'
  )
};

userListAPI.buildSelectionList = function (listDOM, checked, unchecked, idPrefix) {
  listDOM.empty();
  for(let i = 0; i < checked.length; ++i){
    listDOM.append(userListAPI.buildSelectionListItem(checked[i], true, idPrefix));
  }
  for(let i = 0; i < unchecked.length; ++i){
    listDOM.append(userListAPI.buildSelectionListItem(unchecked[i], false, idPrefix));
  }
};

userListAPI.extractData = function(idPrefix){
  let checked = [];

  $('input[id^=' + idPrefix +']').each(function(){
    if($(this).is(':checked')){
      checked.push($(this).attr('userId'));
    }
  });

  return checked;
};