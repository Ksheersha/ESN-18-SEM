let announce = '';

function announcementHomeSyntax(docs,user) {
  var divStr = '';
  divStr += '<div class="col-12 announce-box">';
  divStr += '<div class="sender-info">';
  if (user === docs.username) divStr += ' Me @  ';
  else divStr += ' ' + docs.username + ' @  ';
  divStr += getTimeString(docs.timestamp) + '</div>';
  divStr += '<div class="card text-white bg-secondary announce-content">';
  divStr += docs.content + '</div></div>';
  return divStr;
}

function announcementPopupSyntax(docs, user) {
  let announce = '';
  announce += '<div class="col-12 announce-box announce-box-me ml-auto">';
  announce += '<div>';
  if (docs.username !== user) {
    announce += ' ' + docs.username + ' @  ';
  }
  announce += getTimeString(docs.timestamp) + '</div>';
  announce += '<div class="announce-content card text-white" style="white-space: normal;word-break: break-all;padding: .5rem; margin-top: .3rem">';
  announce += docs.content + '</div></div>';
  return announce;
}

function appendAnnouncement(docs, isPrepend) {
  let announce = '';
  var user = $("#userName").html();
  var divStr = '';
  divStr += announcementHomeSyntax(docs, user);
  announce += announcementPopupSyntax(docs, user);

  if (isPrepend) {
    $('#announcementMsg').prepend(divStr);
  } else {
    $('#announcementMsg').append(divStr);
  }

  return announce;
}

function renderAnnouncements (data) {
  renderMoreBtn(navSearchInput, navMoreBtn, data);
  for (let i = 0; i < data.length; i++) {
    appendAnnouncement(data[i]);
  }
}

function reloadAnnouncements(data) {
  $('#announcementMsg').html("");     // clear previous announcements to reload
  renderAnnouncements(data);
}

function clickAnnouncement(isBack = false) {
  refreshPage(isBack, ANNOUNCEMENT_WINDOW_TITLE);
  navShowSearchBtn.show();
  announceWindow.show();
  if (role === 'Coordinator' || role === 'Administrator') {
    $('#annoucement_input').show();
  }
  $('#announcementMsg').html('');
  getPublicAnnouncementsHTTP(reloadAnnouncements);
}

function sendAnnouncement() {
  var announcementContent = getEscapedInputBoxContent($("#announce_content"));
  if (announcementContent === '') {
    showMessageModal('Announcement', 'Please input announcement before clicking send');
  } else {
    // in HTTPUtil
    postPublicAnnouncementHTTP(user, announcementContent, "Undefined", function (data, status) {
    });
    $('#announce_content').val("");
  }
}

$(function () {
  announcementTab.click(function () {
    clickAnnouncement();
  });
  announcementBtn.click(function () {
    clickAnnouncement();
  });

  socket.on('new announcement', function(doc) {
    announce = appendAnnouncement(JSON.parse(doc), true);
    if (user != (JSON.parse(doc)).username) showMessageModal('Announcement', announce);
  });

  $('#announce_button').click(sendAnnouncement);
  $('#announce_content').keyup(function (e) {
    if (e.keyCode == 13) $('#announce_button').click();
  });
});
