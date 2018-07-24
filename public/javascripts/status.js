function reloadUserStatus () {
  let status = $('#userStatus').html();
  $('#' + status).prop('checked', true);
}

function clickStatus(isBack = false) {
  refreshPage(isBack, STATUS_WINDOW_TITLE);
  shareStatusWindow.show();
  reloadUserStatus();
}

let situationsOnStatusChangeHandler = {
  200: (situations) => {
    displaySituationsModal(situations, "Are you affected by these nearby situations?");
  }
};

function getSituationsOnStatusChange (userId) {
  $.ajax({
    url: '/situations/nearby/user/' + userId,
    type: 'GET',
    statusCode: situationsOnStatusChangeHandler
  });
}

let statusUpdateHandler = {
  200: () => {
    getSituationsOnStatusChange($('#id').html());
  }
}

$(function () {
  statusTab.click(function () {
    clickStatus();
  });
  statusBtn.click(function () {
    clickStatus();
  });

  $('#share_status input').click(function () {
    let status = $(this).attr('id');
    $('#userStatus').html(status);
    postStatusHTTP($('#id').html(), status, statusUpdateHandler);
  });
});