let situationList = $('#situationList');
let createNewSituationButton = $('#createNewSituationButton');
let modalNewSituationConfirmation = $('#modalNewSituationConfirmation');
let confirmNewSituationBtn = $('#confirmNewSituationBtn');
let cancelNewSituationBtn = $('#cancelNewSituationBtn');
let situationsSpinner = $('#situationsSpinner');
let modalRelevantSituations = $("#modalRelevantSituations");
let listOfOfflineSituations = $("#listOfOfflineSituations");
let closeOfflineSituations = $("#closeOfflineSituations");
let curSituationId = '';
let updateSituationCondition = 'false';
let closeSituationButton = $('#closeSituationButton');
let relevantSituationsTitle = $("#relevantSituationsTitle");

function getSituationCardHTML (situation) {
  let result = "<div class=\"card-spacer\"></div>" +
    "<div class=\"card\" data-id=\"" + situation._id + "\">" +
    "<div class=\"card-body\">" +
    "<h5 class=\"card-title situationTitle\">" + situation.name + "</h5>";

  if (situation.distance) {
    result += "<p>Distance from me: " + situation.distance + "mi</p>";
  }
  if(!situation.affectedUsers || !situation.affectedUsers.includes(id)){
    result += "<button type='button' class='btn btn-primary float-right affectedBySituationButton'>I am affected</button>" +
      "</div>" +
      "</div>";
  } else {
    result += "<button type='button' class='btn btn-primary float-right affectedBySituationButton'>I'm not affected anymore</button>" +
      "</div>" +
    "</div>";
  }
  return result;
}

function displayListOfSituations (situations) {
  let situationsHTML = "";
  for (let i = 0; i < situations.length; i++) {
    situationsHTML += getSituationCardHTML(situations[i]);
  }
  situationList.html(situationsHTML);
}

function initCardClickListeners () {
  $(".situationTitle").click(function () {
    let situationId = $(this).parent().parent().attr("data-id");
    curSituationId = situationId;
    updateSituationCondition = 'true';
    loadSituationDetail(situationId);
  });
  $(" .affectedBySituationButton ").click(function () {
    let situationId = $(this).parent().parent().attr("data-id");
    updateAffectedUserList(situationId, id);
  });
}

function loadSituationDetail(situationId) {
  $.ajax({
    url: "/situations/" + situationId,
    type: "GET",
    statusCode: loadSituationDetailHandler
  });
}

let loadSituationDetailHandler = {
  200: function (situation) {
    loadSituationDetailPage(situation);
  },
  500: function () {
    showMessageModal("Error!", "The situations detail could not be displayed. Please try again.");
  }
};

function loadSituationDetailPage(situation){
  displaySituationPage(false, false);

  situationName.val(situation.name);
  $('#situationAddress').val(situation.address);

  affectedAreaRadius.val(situation.affectedRadius);
  let radiusInMeters = situation.affectedRadius * 1609.34;
  newSituationArea.setRadius(radiusInMeters);

  newSituationDescription.val(situation.description);
  newSituationSpecialNotes.val(situation.specialNotes);

  locationLatLng.latitude = situation.location.coordinates[1];
  locationLatLng.longitude = situation.location.coordinates[0];
  displaySituationOnMap(locationLatLng);

  affectedUserListButton.show();
  submitNewSituationBtn.text("UPDATE");
  closeSituationButton.show();


  getUserByIdHTTP(situation.creatorId, function(user){
    if(situation.creatorId !== id && !isResponder(role)){
      newSituationTitle.text(situation.name.toUpperCase() + ' in ' + situation.address.split(',')[1]);
      situationDetail.show();
      let time = new Date(situation.creationTime);
      situationDetail.html('<label> Created By: '  + user.username + '</label>');
      situationDetail.append('<label> Created On: '  + convertUTCDateToLocalDate(time).toLocaleString() + '</label>');
      situationDetail.append('<label> Location: '  + situation.address + '</label>');

      situationNameForm.hide();
      situationAddressForm.hide();
      situationRadiusForm.hide();
      newSituationDescription.prop('disabled',true);
      newSituationSpecialNotes.prop('disabled',true);
      closeSituationButton.hide();
      submitNewSituationBtn.hide();
    }
  });

}

function convertUTCDateToLocalDate(date) {
  let newDate = new Date(date.getTime()+date.getTimezoneOffset()*60*1000);

  let offset = date.getTimezoneOffset() / 60;
  let hours = date.getHours();

  newDate.setHours(hours - offset);

  return newDate;
}

function updateAffectedUserList (situationId, userId) {
  $.ajax({
    url: "/situations/" + situationId + '/affectedUsers',
    data: {
      userId: userId
    },
    type: "PUT",
    statusCode: updateAffectedUserListHandler
  });
}

let updateAffectedUserListHandler = {
  200: function (situation) {
    if(situation.affectedUsers.includes(id)){
      $("[data-id=" + situation._id + "]").find('.affectedBySituationButton').text("I'm not affected anymore");
    } else {
      $("[data-id=" + situation._id + "]").find('.affectedBySituationButton').text("I am affected");
    }

  },
  500: function () {
    showMessageModal("Error!", "the list hasn't been updated Please try again.");
  }
};

function displaySituations(situations) {
  displayListOfSituations(situations);
  initCardClickListeners();
}

let loadSituationsHandler = {
  200: function (situations) {
    displaySituations(situations);
    situationsSpinner.hide();
  },
  500: function () {
    showMessageModal("Error!", "The situations could not be displayed. Please try again.");
    situationsSpinner.hide();
  }
};

function getSituationsFromLocation(loc) {
  let userLocation = {
    longitude: loc.longitude,
    latitude: loc.latitude
  };
  $.ajax({
    url: "/situations",
    data: userLocation,
    type: "GET",
    statusCode: loadSituationsHandler
  });
}

function loadSituationsPage () {
  situationsSpinner.show();
  let situationLocationOptions = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
  };
  if ("geolocation" in navigator){
    navigator.geolocation.getCurrentPosition(function(position) {
        getSituationsFromLocation(position.coords);
    }, function () {
      getSituationsFromLocation({});
    }, situationLocationOptions);
  } else {
    getSituationsFromLocation({});
  }
}


function displaySituationsModal (situations, title) {
  let result = "";
  if (situations.length) {
    for (let i = 0; i < situations.length; i++) {
      result += getSituationCardHTML(situations[i]);
    }
    listOfOfflineSituations.html(result);
    relevantSituationsTitle.html(title);
    modalRelevantSituations.show();
    initCardClickListeners();
  }
}

let offlineSituationsHandler = {
  200: function (situations) {
    displaySituationsModal(situations, "These situations were published while you were offline.");
  },
  500: function () {
    showMessageModal("Error!", "The situations could not be displayed. Please try again.");
  }
};

function getSituationsWhileOffline () {
  if ("geolocation" in navigator){
    navigator.geolocation.getCurrentPosition(function(position) {
      let pos = {};
      pos.latitude = position.coords.latitude;
      pos.longitude = position.coords.longitude;
      $.ajax({
        url: "/situations/offline/user/" + userId.html(),
        type: "GET",
        data: pos,
        statusCode: offlineSituationsHandler
      });
    });
  }
}

function closeSituation() {
  $.ajax({
    url: "/situations/close/" + curSituationId,
    type: "PUT",
    statusCode: closeSituationHandler
  })
}

let closeSituationHandler =  {
  200: function () {
    showMessageModal("Success!", "The situation is closed.");
    clickSituations(true);
  },
  500: function () {
    showMessageModal("Error!", "The situation could not be closed. Please try again.");
  }
};

closeSituationButton.click(function () {
  closeSituation();
});
closeOfflineSituations.click(function () {
  modalRelevantSituations.hide();
});
function hideSituationConfirmationModal () {
  modalNewSituationConfirmation.hide();
}
createNewSituationButton.click(function () {
  modalNewSituationConfirmation.show();
});
cancelNewSituationBtn.click(function () {
  hideSituationConfirmationModal();
});
confirmNewSituationBtn.click(function () {
  hideSituationConfirmationModal();
  updateSituationCondition = 'false';
  displaySituationPage(false, true);
});

getSituationsWhileOffline();