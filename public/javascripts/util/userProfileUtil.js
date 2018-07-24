function editUserProfileHandler(element) {
  var editButton = $(element);
  var username = editButton.data('username');
  var userid = editButton.data('userid');
  getUserByIdHTTP(userid, function(user) {
    console.log("get user:", user);
    var modal = $("#modalEditUserProfile");
    modal.find('.modal-title').text('Edit user ' + user.username);
    modal.find('.modal-body #profile-username').val(username);
    modal.find('.modal-body #profile-userid').val(userid);
    modal.find('.modal-body #profile-password').val("");
    modal.find('.modal-body #profile-is-active').val(user.isActive.toString());
    modal.find('.modal-body #profile-role').val(user.role);
    if (user.isCoordinator) {
      $("#isCoordinator").prop('checked', true);
    }
    else {
      $("#notCoordinator").prop('checked', true);
    }
    $('#modalEditUserProfile').modal('show');
  });
}

function getFormData($form){
  var unindexed_array = $form.serializeArray();
  var indexed_array = {};
  $.map(unindexed_array, function(n, i){
    indexed_array[n['name']] = n['value'];
  });
  return indexed_array;
}

function editUserProfileSaveHandler() {
  var userid = $('#profile-userid').val();
  console.log("save...", userid, $("#editProfileForm").serialize());
  var formData = getFormData($("#editProfileForm"));
  var usernameDom = $("#profile-username");
  var passwordDom = $("#profile-password");
  if (usernameDom.hasClass("is-invalid") || passwordDom.hasClass('is-invalid')) {
    showMessageModal("Failed", "Please correct any errors");
  } else {
    formData.password = sha1(formData.password);
    formData.isCoordinator = getIsCoordinator(formData.role, formData.isCoordinator);
    postUserByIdHTTP(userid, formData, function (response) {
      $('#modalEditUserProfile').modal('hide');
      showMessageModal("Saved", response);
    })
  }
}

function getIsCoordinator (role, isCoordinator) {
  if (role === 'Administrator' || role === 'FireChief' || role === 'PoliceChief') {
    return true;
  }
  return isCoordinator;
}

function editUserProfileUsernameKeyupHandler() {
  var usernameDom = $("#profile-username");
  var usernameFb = $("#profile-username + .invalid-feedback");
  var validateResult = validateUserName(getEscapedInputBoxContent(usernameDom).toLowerCase());
  usernameFb.html(validateResult);
  if (validateResult !== "OK") {
    usernameDom.addClass("is-invalid");
  } else {
    usernameDom.removeClass("is-invalid");
  }
}

function editUserProfilePasswordKeyupHandler() {
  var passwordDom = $("#profile-password");
  var passwordFb = $("#profile-password + .invalid-feedback");
  var validateResult = validatePassword(passwordDom.val());
  passwordFb.html(validateResult);
  if (validateResult !== "OK") {
    passwordDom.addClass("is-invalid");
  } else {
    passwordDom.removeClass("is-invalid");
  }
}

function editUserProfileRoleChangeHandler () {
  let role = $(this).val();
  $('input:radio[name="isCoordinator"][value="1"]').attr("disabled", false);
  $('input:radio[name="isCoordinator"][value="0"]').attr("disabled", false);
  if (role === "Administrator" || role === "FireChief" || role === "PoliceChief") {
    $("#isCoordinator").prop('checked', true);
    $("#notCoordinator").prop('checked', false);
    $('input:radio[name="isCoordinator"][value="1"]').attr("disabled", true);
    $('input:radio[name="isCoordinator"][value="0"]').attr("disabled", true);
  }
  else {
    $("#isCoordinator").prop('checked', false);
    $("#notCoordinator").prop('checked', true);
  }
}
