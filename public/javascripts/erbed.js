let updateHospitalResponseHandler = {
  200: function (data) {
  },
  500: function () {
      showMessageModal("Error!", "Hospital information was not saved. Please try again.");
  }
}

let getHospitalByNurseIdResponseHandler = {
  200: function (data) {
    if (data.length == 0) { // If nurse is not working, do not enter this page
      showMessageModal('Alert', 'You are not working in any hospital');
      clickHospitalDirectory();
    }
    else { // If nurse is working, enter corresponding hospital beds modifying page
      let hospital = data[0];
      $('#workingHospitalId').text(hospital._id);
      $('#workingHospitalName').text(hospital.hospitalName);
      $('#erbedNumber').val(hospital.beds === undefined ? '?' : hospital.beds);

      erbedWindow.show();
    }
  },
  500: function () {
    showMessageModal("Error!", "Something went wrong. Please try again.");
  }
};

function clickERBed(isBack = false) {
  refreshPage(isBack, ERBED_WINDOW_TITLE);
  enterERBed();
}

function enterERBed () {
  let id = $("#id").html();
  getHospitalByNurseId (id, getHospitalByNurseIdResponseHandler);
}

function updateERBed () {
  let bedNumber = Number($('#erbedNumber').val());
  if (isNaN(bedNumber)) {
    showMessageModal('Error', 'Please input a number.');
  }
  else {
    let updateInfo = {_id: $('#workingHospitalId').text(), beds: bedNumber};
    updateHospitalInfo(updateInfo, updateHospitalResponseHandler);
  }
}

$(function () {
  $('#bedsAvailableBtn').click(() => {
    clickERBed();
  });

  $('#bedsAvailableTab').click(() => {
    clickERBed();
  });

  $('#erbedNumber').on('input',function(e){
    updateERBed();
  });

  socket.on('beds number in hospitals updated by assigning patients', function () {
    if (currentWindow === ERBED_WINDOW_TITLE) {
      enterERBed();
    }
  });
});
