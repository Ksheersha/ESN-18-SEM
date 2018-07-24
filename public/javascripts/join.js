$(function () {

    function checkValidUsername(username) {
        var usernameValidateResult = validateUserName(username);
        if (usernameValidateResult === usernameInvalid) {
            showMessageModal(usernameInvalid, 'Please try other username.');
            $('#iptUsername').focus();
            return false;
        } else if (usernameValidateResult === usernameTooShort) {
            showMessageModal(usernameTooShort, 'Username should be at least 3 characters.');
            $('#iptUsername').focus();
            return false;
        }
        return true;
    }

    function checkValidPwd(password) {
        if (validatePassword(password) === passwordTooShort) {
            showMessageModal(passwordTooShort, 'Password should be at least 4 characters.');
            $('#iptPassword').focus();
            return false;
        }
        return true;
    }

    function tryLogin(register, responseHandler) {
        var username = $("#iptUsername").val().replace("</", "<\\/").toLowerCase();
        var password = $("#iptPassword").val();

        if (!checkValidUsername(username) || !checkValidPwd(password)) {
            return;
        }

        var hash = sha1(password);
        postUsersHTTP(username, hash, register, responseHandler);

    }

    $("#btnJoin").click(function () {
        tryLogin(false, {
            200: function (response) {
                window.location.replace('/homepage');
            },
            400: function (response) {
                showMessageModal('Login Failed', 'Password does not match the given username!');
            },
            401: function (response) {
                // username not exist, so ask to create user
                $('#modalPromoteCreateUser').modal('show');
            },
            402: function (response) {
                showMessageModal('Login Failed', 'Your account is now in inactive state. Please Contact Admin.');
            },
        });
    });

    $("#iptPassword").keyup(function(event){
        if(event.keyCode == 13){
            $("#btnJoin").click();
        }
    });

    $('#btnCreateNewUser').click(function () {
        tryLogin(true, {
            201: function (response) {      // create new user successfully
                console.log(sha1("admin"));
                $('#modalWelcome').modal('show');
            }
        });
    });

    $("#btnProceed").click(function () {
        window.location.replace('/homepage');
    });

});