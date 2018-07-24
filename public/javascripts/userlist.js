let unreadIDSet = new Set();


function getUserBackgroundColor(id) {
  if (unreadIDSet.has(id)) {
    return "style='background-color: rgba(255, 255, 80, 0.4);'";
  } else {
    return "";
  }
}

function getListBadge(id) {
  if (unreadIDSet.has(id)) {
    return "<i class=\"list-badge material-icons\">message</i>";
  } else {
    return "<i class=\"list-badge material-icons\" style=\"display: none;\">message</i>";
  }
}

function getEditUserProfileButton(user) {
  if ($("#role").html() !== "Administrator") return "";
  return "<button id='edit' type='button' class='btn btn-primary' style='color: #00695C' onclick='editUserProfileHandler(this)' " +
    "data-username='"+user.username+"' data-userid='" + user._id+"' ><i class='material-icons'>settings</i></button>"
}

function appendUser(user) {
  let id = $("#id").html();
  let name = (user.isOnline) ?
    "<span class='username online'>" : "<span class='username offline'>";
  name += (usertag[user.role].namePrefix);
  name += (user.username);
  name += (user._id == id)? " (ME)</span>" : "</span>";

  $("#user-list").append(
    "<tr class='row' " + getUserBackgroundColor(user._id) + ">"
    + "<td class='col-10' title='Click to send a private message' onclick='showPrivateChatModal(this);'>"
    + getStatusIcon(user.status.status) + " " + name
    + getListBadge(user._id)
    + "<div class='page-hidden-info hidden-name'>" + user.username + "</div>"
    + "<div class='page-hidden-info hidden-id'>" + user._id + "</div>"
    + "</td>"
    + "<td class='col-2 ' >"
    + getEditUserProfileButton(user)
    + "</td>"
    + "</tr>");
}

function renderUserDirectory(userList) {
  $('#user-list').html("");       // empty the user list
  for (let i = 0; i < userList.length; i++) {
    appendUser(userList[i]);
  }
  unreadIDSet.clear();
}

function loadAllDispatcher(onSuccess) {
  getUsersInNetworkByRoleHTTP("Dispatcher", true)
    .done(userList => {
      onSuccess(userList);
    });
}

function reloadUserDirectory() {
  getUsersInNetworkByRoleHTTP(role, role === "Administrator")
    .done(userList => {
      renderUserDirectory(userList);
    });
}

function clickUserList(isBack = false) {
  refreshPage(isBack, CONTACT_WINDOW_TITLE);
  navShowSearchBtn.show();
  userWindow.show();
  userListTab.find('i.material-icons.md-24.md-light').css('color', 'rgba(255, 255, 255, 1)');
  userListTab.find('i.tab-badge').css('display', 'none');
  reloadUserDirectory();
}

$(function () {
  userListTab.click(function () {
    clickUserList();
  });

  userListBtn.click(function () {
    clickUserList();
  });

  adminUserProfileTab.click(function () {
    clickUserList();
  });

  adminOrgTab.click(function () {
    clickOrganizations();
  })

  socket.on('reload user directory', function (data) {
    reloadUserDirectory();
  });

  socket.on('force logout', function (d) {
    showMessageModal('You have been forced to log out',
      'You will automatically logout after 3 seconds. ' +
      'This is because System Administrator has changed your account info. Please login again.');
    setTimeout(function () {
      window.location.replace('/logout');
    }, 3000);
  });
});