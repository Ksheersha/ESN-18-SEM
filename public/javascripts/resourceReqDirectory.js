let resourceReqDirectory = {
  'functions': {},
  'DOM': {'list': $('#resourceReqDirectory'), 'modalRequestInfo': $('#modalRequestInfo')},
  'state': {}
};

resourceReqDirectory.load = function (isBack = false) {
  refreshPage(isBack, RESOURCE_REQ_DIRECTORY_TITLE);
  //If they're a nurse, only show them the requests at their hospital
  if(isNurse(role)) {
    getHospitalByNurseId(id, {200: (hospital) => {
      getResourceRequests(null, hospital[0]._id, resourceReqDirectory.functions.handler);
    }})
  } else {
    getResourceRequests(null, null, resourceReqDirectory.functions.handler);
  }
  resourceReqDirectoryWindow.show();
};

resourceReqDirectory.functions.handler = {
  200: (requests) => {
    resourceReqDirectory.functions.generateReqTable(requests);
  }
};

resourceReqDirectory.functions.generateReqTable = (requests) => {
  let reqListHTML = '';
  resourceReqDirectory.state.requests = requests;
  for (let i in requests) {
    if(requests[i].status !== 'on-truck') {
      reqListHTML += resourceReqDirectory.functions.addRequest(requests[i]);
    }
  }
  resourceReqDirectory.DOM.list.html(reqListHTML);
};

resourceReqDirectory.functions.addRequest = (request) => {
  let divStr = "<div class = 'card supply-card'>";
  divStr += resourceReqDirectory.functions.reqFirstLineSyntax(request);
  divStr += resourceReqDirectory.functions.reqSecondLineSyntax(request);
  divStr += '</div>';
  return divStr;
};

resourceReqDirectory.functions.reqFirstLineSyntax = (request) => {
  let divStr = "<div class='row'><div class='col-7 card-title supplyName'>" + request.displayId + '</div>';
  divStr += "<div class='col-5 ml-auto supplyTime'>" + moment(request.createdAt).format('M/D h:mm:ss A') + '</div></div>';
  return divStr;
};

resourceReqDirectory.functions.capitalize = (str) => {
  str = str.replace('-',' ').toLowerCase();
  return str.charAt(0).toUpperCase() + str.slice(1) ;
};

resourceReqDirectory.functions.reqSecondLineSyntax = (request) => {
  let divStr = '';
  divStr += "<div class='row'><span class='col-4 card-text reqStatus font-weight-bold' style='margin:auto'>" + resourceReqDirectory.functions.capitalize(request.status) + '</span>';
  if (resourceReqDirectory.functions.showMoveStateButton(request)) {
      let nextStatus = resourceReqDirectory.state.nextStatusMap.get(request.status);
      nextStatus = resourceReqDirectory.functions.capitalize(nextStatus);
      divStr += "<button onclick='resourceReqDirectory.functions.moveStateForward(this)' type='button' " +
        "class='col-4 btn btn-primary btn-raised'><span class='center text-center'>" +
        nextStatus + "</span></button>";
  }
  divStr += "<button class='btn btn-primary ml-auto' onclick='resourceReqDirectory.functions.showInfoModal(this)'><i class=\"material-icons\">info</i></button>";
  divStr += "<div class='page-hidden-info hidden-reqId'>" + request._id + '</div></div>';
  return divStr;
};

resourceReqDirectory.functions.showMoveStateButton = (request) => {
  return (isNurse(role) && request.status.toLowerCase() === 'requested') ||
  (isNurse(role) && request.status.toLowerCase() === 'ready') ||
  (isFirstResponder(role) && request.status.toLowerCase() === 'picked-up')
};

resourceReqDirectory.functions.moveStateForward = (element) => {
  let reqId = $(element).parent().find('.hidden-reqId').text();
  let curStatus = $(element).parent().find('.reqStatus').text().toLowerCase().replace(' ', '-');
  updateResourceRequest(reqId, resourceReqDirectory.state.nextStatusMap.get(curStatus), resourceReqDirectory.load);
};

resourceReqDirectory.functions.showInfoModal = (element) => {
  let reqId = $(element).parent().find('.hidden-reqId').text();
  let req = resourceReqDirectory.state.requests.find(r => r._id === reqId);
  let modalInfo = resourceReqDirectory.DOM.modalRequestInfo;

  modalInfo.find('#resourceReqName').text(req.displayId);
  modalInfo.find('#resourceReqHospital').text(req.hospital.hospitalName);
  modalInfo.find('#resourceReqStatus').text(resourceReqDirectory.functions.capitalize(req.status));
  modalInfo.find('#resourceReqCreatedTime').text(moment(req.createdAt).format('M/D h:mm:ss A'));
  modalInfo.find('#resourceReqSanitizers').text(req.sanitizerCount);
  modalInfo.find('#resourceReqColdCompresses').text(req.coldCompressCount);
  modalInfo.find('#resourceReqAspirin').text(req.aspirinCount);
  modalInfo.find('#resourceReqOintment').text(req.ointmentCount);
  modalInfo.find('#resourceReqPainKiller').text(req.painKillerCount);
  modalInfo.find('#resourceReqAntibiotics').text(req.antibioticsCount);
  modalInfo.find('#resourceReqBandages').text(req.bandageCount);
  modalInfo.modal("show");
};

resourceReqDirectory.functions.reloadOnSocket = () => {
  if (currentWindow === RESOURCE_REQ_DIRECTORY_TITLE) {
    resourceReqDirectory.load();
  }
};

$(function () {
  resourceReqDirectoryTab.click(function() {
    resourceReqDirectory.load();
  });
  resourceReqDirectory.state.nextStatusMap = new Map([['requested', 'ready'], ['ready', 'picked-up'], ['picked-up', 'on-truck']]);

  socket.on('InventoryRequestCreated', () => {
    resourceReqDirectory.functions.reloadOnSocket()
  });
  socket.on('Resource Request Status Change', () => {
    resourceReqDirectory.functions.reloadOnSocket()
  });

  socket.on('Resource Request Ready for Pickup', (request) => {
    if(isFirstResponder(role)) {
      getVehicleByUserId(id, {200: (vehicles) => {
        if(vehicles.find(v => v._id === request.truck._id)) {
          let title = 'Resources Ready';
          let message = 'The resources requested for your truck are available for pickup at '
            + request.hospital.hospitalName + '.';
          showMessageModal(title, message);
        }
      }});
    }
  });

});
