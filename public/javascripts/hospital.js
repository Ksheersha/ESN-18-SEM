// input fields
let nurseId = $("#id").html();
let hospitalName = $("#hospitalName");
let hospitalAddress = $("#hospitalAddress");
let hospitalDescription = $("#hospitalDescription");
let nurseName = $("#nurseName");
let hospitalLocation;

//Buttons
let cancelButton = $("#cancelButtonRegisterHosp");
let deleteButton = $("#deleteButtonRegisterHosp");
let addressAutocomplete;

function clickHospitalPage(isBack = false, state) {
    let id = isBack ? state.id : getHospitalId();
    refreshPage(isBack, HOSPITAL_WINDOW_TITLE, {id: id});
    initHospitalPage(id);
    setHospitalPageTitle(id);
    displayDeleteButton(id === '');
    initAutocompleteAddress();
    hospitalWindow.show();
}

function initHospitalPage (id) {
    if (id === '') {
        clearHospitalInfo();
    }
    else {
        getHospitalDescription(id);
    }
}

function displayDeleteButton (display) {
    if (display) {
        $("#deleteButtonRegisterHosp").attr("disabled", "disabled");
    }
    else {
        $("#deleteButtonRegisterHosp").removeAttr("disabled");
    }
}

function setHospitalPageTitle (id) {
    let title = id === '' ? 'Register Hospital' : 'Hospital Information';
    $('#hospitalTitle').text(title);
}

function clearHospitalInfo () {
    hospitalName.val('');
    hospitalAddress.val('');
    hospitalDescription.val('');
    $('#existingNurses').text('None Listed');
    nurseName.prop('checked', false);
}

function getHospitalDescription (id) {
    let getHospitalResponseHandler = {
        200: function (hospital) {
            fillHospitalInfo(hospital);
        },
        500: function () {
            showMessageModal("Error!", "Hospital does not exist. Please try again.");
        }
    };

    getHospitalById(id, getHospitalResponseHandler);
}

function fillHospitalInfo (hospital) {
    hospitalName.val(hospital.hospitalName);
    hospitalAddress.val(hospital.address);
    hospitalDescription.val(hospital.description);

    displayNurseList(hospital.nurse);
    checkNurseWork(hospital.nurse);
    setHospitalId(hospital._id);
}

function displayNurseList (nurses) {
    let existingNurses = $('#existingNurses');
    existingNurses.text('');
    if (nurses.length === 0) {
        existingNurses.text('None Listed');
    }
    else {
        for (let i=0; i<nurses.length; i++) {
            getUserByIdHTTP(nurses[i], function(user) {
                let nurseStr = existingNurses.text();
                nurseStr = (nurseStr.length === 0) ? nurseStr + user.username : nurseStr + ', ' + user.username;
                existingNurses.text(nurseStr);
            });
        }
    }
}

function checkNurseWork (nurses) {
    let nurseId = $("#id").html();
    if (nurses !== null && nurses.length > 0 && nurses.indexOf(nurseId) >= 0) {
        $('#nurseName').prop('checked', true);
    }
    else {
        $('#nurseName').prop('checked', false);
    }
}


function getHospitalInfoWithUpdatedNurse(hospital) {
    return {
        hospitalId: hospital._id,
        hospitalName: hospital.hospitalName,
        address: hospital.address,
        description: hospital.description,
        nurse : nurseId,
        nurseIdCheck : false,
        location: hospitalLocation
    }
}

let getHospitalByNurseIdResponseHandlerForNurse = {
    200: function (data) {
        if (data.length != 0) { //If nurse works at any hospital, remove her from that hospital
            let hospital = getHospitalInfoWithUpdatedNurse(data[0]);
            saveHospitalInfo(hospital);
        }
    },
    500: function () {
        console.log("Error in Handling getHospitalByNurseId");
    }
};

function getHospitalInfo() {
    return {
        hospitalId: getHospitalId(),
        hospitalName: hospitalName.val(),
        address: hospitalAddress.val(),
        description: hospitalDescription.val(),
        nurse : nurseId,
        nurseIdCheck : !!nurseName.prop('checked'),
        location: hospitalLocation
    }
}

function deleteHospital () {
    $('#modalDeleteHospitalAlert').modal('hide');
    let id = getHospitalId();
    deleteHospitalById(id, deleteHospitalResponseHandler);
}

function initAutocompleteAddress() {
    addressAutocomplete = new google.maps.places.Autocomplete(hospitalAddress[0], {});
    addressAutocomplete.addListener('place_changed', function () {
        let locationLatLng = {};
        let place = addressAutocomplete.getPlace();
        locationLatLng.address = place.formatted_address;
        locationLatLng.latitude = place.geometry.location.lat();
        locationLatLng.longitude = place.geometry.location.lng();
        hospitalLocation = locationLatLng;
    });
}

let deleteHospitalResponseHandler = {
    202: function (data) {
    },
    500: function () {
        showMessageModal("Error!", "Hospital can not be removed or something went wrong. Please try again.");
    }
};

$(function () {
    let saveHospitalResponseHandler = {
        200: function (data) {
            console.log("save hosp", data);
            setHospitalId(data._id);
            clickHospitalPage(false, data._id);
            showMessageModal("Successful!", "Hospital information has been saved succesfully.");
        },
        500: function () {
            showMessageModal("Error!", "Hospital information was not saved. Please try again.");
        }
    };

    $('#hospitalForm').submit(function () {
        let hospitalInfo = getHospitalInfo();
        saveHospitalInfo(hospitalInfo, saveHospitalResponseHandler);
        return false;
    });

    deleteButton.click(function () {
        $('#modalDeleteHospitalAlert').modal('show');
    });

    $('#modalDeleteHospitalAlert').find('#hospital-delete').click(deleteHospital);

    cancelButton.click(() => {
        let id = getHospitalId();
        initHospitalPage(id);
    });

    socket.on('hospital updated', function (id) {
        if (currentWindow === HOSPITAL_DIRECTORY_WINDOW_TITLE) {
            clickHospitalDirectory();
        }
        /*else if (currentWindow === HOSPITAL_WINDOW_TITLE) {
            if (getHospitalId() === id) {
                clickHospitalPage(false, {id: id});
            }
        }*/
    });

    socket.on('hospital deleted', function (id) {
        if (currentWindow === HOSPITAL_DIRECTORY_WINDOW_TITLE) {
            clickHospitalDirectory();
        }
        else if (currentWindow === HOSPITAL_WINDOW_TITLE) {
            if (getHospitalId() === id) {
                showMessageModal('Message', 'Hospital you are viewing has been deleted.');
                clickHospitalDirectory();
            }
        }
    });

});
