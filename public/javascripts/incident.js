let commanderId = $('#commander').html();

function isGroupPage(sourceId) {
  let groupDirectory = $('#groups_window');
  return groupDirectory.css("display") !== "none"
    && idDOM.html() === sourceId;
}
function clickIncident (isBack = false) {
  incidentTab.find('i.material-icons.md-24.md-light').css('color', 'rgba(255, 255, 255, 1)');
  incidentTab.find('i.tab-badge').css('display', 'none');
  incidentId = $('#incidentId').html();

  if (isDispatcher(role)) {
    getIncidentsForRole('dispatcher', id, displayIncidentsForDispatcher);

    refreshPage(isBack, INCIDENT_WINDOW_TITLE);
    incidentDispatcherWindow.show();
  } else if (isCitizen(role) || isAdministrator(role)) {
    initIncidentMap();

    showIncidentDetail(isBack, REACH911_WINDOW_TITLE);
    incidentWindow.show();
  } else {
    getIncidentsForRole('firstResponder', id, displayIncidentsForFirstResponder);

    refreshPage(isBack, INCIDENT_WINDOW_TITLE);
    incidentFirstResponderWindow.show();
  }
}

function showIncidentDetail (isBack = false, title = INCIDENT_DETAIL_TITLE) {
  if (isFirstResponder(role)) {
    treatPatientBtn.show();
  } else {
    treatPatientBtn.hide();
  }
  refreshPage(isBack, title);
  incidentWindow.show();
}

function displayIncidentDetail (incidentIdValue, incidentStateValue) {
  $('#incidentId').html(incidentIdValue);
  incidentId = incidentIdValue;
  if (isDispatcher(role)) {
    displayIncidentId();
    if (incidentStateValue !== 2) {
      updateIncidentState();
    }
  }
  getIncidentAddress();
  initIncidentMap();
  // Need to get the questions based on the emergency type
  getQuestionsForEmergency();

  showIncidentDetail();
  showStep(1);
}

function showIncidentNavBadge () {
  incidentTab.find('i.material-icons.md-24.md-light').css('color', 'rgba(255, 255, 10, 1)');
  incidentTab.find('i.tab-badge').css('display', 'block');
}

$(function () {

  incidentTab.click(function () {
    clickIncident();
  });

  emergencyBtn.click(function () {
    createIncident(id, {
      200: function (data) {
        $('#incidentId').html(data.incidentId);
        incidentId = data.incidentId;
        clickIncident();
        loadExistingData(1);
      },
      201: function (data) {
        $('#incidentId').html(data.incidentId);
        incidentId = data.incidentId;
        clickIncident();
        create911Group(data.creatorId, data.callerId, data.displayId);
      },
      500: function () {
        showMessageModal('Error!', 'There was an error. Please try calling 911 again.');
      }
    });
  });

  incidentsBtn.click(function () {
    clickIncident();
  });

  resourceAllocationBtn.click(function () {
    showResourcePage();
  });

  if (isCitizen(role) || isAdministrator(role)) {
    displayStepperForNonResponseTeam();
    $('#step1title').text('You have reached 911');
  }
  makeStepActive(1);
  for (let i = 1; i < 6; i++) {
    $('#step' + i + 'button').click(renderStep(i));
  }

  fireTypeButton.click(function () {
    saveIncidentType(1);
  });
  medicalTypeButton.click(function () {
    saveIncidentType(2);
  });

  policeTypeButton.click(function () {
    saveIncidentType(3);
  });
  chat911DispatcherButton.click(function () {
    showIncidentGroupChatModal();
  });
  incidentSendButton.click(function () {
    sendIncidentGroupMessage();
  });
  chatWithRespondersButton.click(function () {
    showIncidentTeamChatModal();
  });
  incidentTeamSendButton.click(function () {
    sendIncidentTeamMessage();
  });

  closeIncidentButton.click(function () {
    if (incidentCommander === id || isDispatcher(role)) {
      $('#closeIncidentButton').prop('disabled', false);
      closeIncidentModel('Alert', 'Are you sure you want to close the incident?');
      $('#btnCloseIncident').one('click', function () {
        deallocateResourcesForIncident(incidentId);
        closeIncidentPage();
      });
      $('#btnCancelCLoseIncident').click(function () {
      });
    } else {
      $('#closeIncidentButton').prop('disabled', true);
      showMessageModal('Permission Denied', 'Close operation not authorized for this incident');
    }
  });

  allocateResourcesButton.click(function () {
    showResourcePage();
  });

  treatPatientBtn.click(function (event) {
    event.preventDefault();
    showPatientPage();
  });

  function changeListenerToAutoSave (input) {
    return function () {
      answers[input] = $(this).val();
      saveAnswers(answers);
    };
  }

  function createChangeListeners () {
    let autoSaveInputsCheckbox = ['breathing', 'citizenPatientsProfile',
      'conscient', 'fireInjury', 'flame', 'getOut', 'hazardous', 'patient',
      'safe', 'sex', 'smoke', 'suspectLeft', 'weapon', 'weaponInjury'];

    let autoSaveInputsText = ['citizenAge', 'citizenCrimeDetail', 'citizenChiefComplaint',
      'citizenSuspectDescription', 'citizenPeople', 'smokeColor', 'smokeQuantity'];

    for (let i = 0; i < autoSaveInputsCheckbox.length; i++) {
      $('#incident_window input[name=' + autoSaveInputsCheckbox[i] + ']').change(changeListenerToAutoSave(autoSaveInputsCheckbox[i]));
    }
    for (let i = 0; i < autoSaveInputsText.length; i++) {
      $('#' + autoSaveInputsText[i]).bind('input propertychange', changeListenerToAutoSave(autoSaveInputsText[i]));
    }
  }

  createChangeListeners();
  socket.on('Received New Incident', function () {
    showIncidentNavBadge();
  });

  function highlightGroup(groupId) {
    let groupDirectory = $('#group_directory');
    groupDirectory.find(".hidden-id:contains('" + groupId + "')").parent().parent().css("background-color", "rgba(255, 255, 80, 0.4)");
  }

  socket.on('Message group send', function (content) {
    appendMessage('#incidentHistoryMsg', content, false);
    scrollBottom(privateSearchInput, incidentHistoryMsg);
    appendMessage('#incidentTeamHistoryMsg', content, false);
    scrollBottom(privateSearchInput, incidentTeamHistoryMsg);
  });
  // when receive
  socket.on('Message group receive', function (content) {
    let messageGroupId = content.to;
    let messageSenderId = content.uid;
    if (!isGroupPage(messageSenderId)) {
      highlightGroup(messageGroupId);
    }
    console.log('message receive in incident');
    appendMessage('#incidentHistoryMsg', content, false);
    scrollBottom(privateSearchInput, incidentHistoryMsg);
    appendMessage('#incidentTeamHistoryMsg', content, false);
    scrollBottom(privateSearchInput, incidentTeamHistoryMsg);
  });
});
