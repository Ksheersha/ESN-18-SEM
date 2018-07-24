let NursePage = {};
NursePage.DOMs = {};
NursePage.functions = {};
NursePage.DOMs.directory = $('#nurse_directory');
NursePage.DOMs.window = $('#nurse_window');
NursePage.DOMs.showBtn = $('#showAllNurse');
NursePage.DOMs.title = 'Nurse Directory';



NursePage.functions.constructEntry =
  function (data) {
  let Entry = "";
  for(let i = 0; i < data.length ; i++){
    let entry = data[i];
    Entry += '<div class="list-group">';
    Entry += '<li class="list-group-item home-nav">' + entry.hospitalName + '</li>';
    for(let j = 0;j < entry.nurse.length; j++) {
      let nurse = entry.nurse[j];
      Entry += '<li class="list-group-item" style="background-color: rgb(255, 255, 255);">';
      Entry += '<a class="group_info_button nav-item nav-link nav-link"><i class="material-icons md-24">phone</i></a>';
      Entry += '<a href= tel:' + nurse.personalInfo.phoneNumber + '>';
      Entry += '<div class="page-hidden-info hidden-id">'+ nurse._id +'</div>';
      Entry += nurse.username;
      Entry += '</a>';
      Entry += '</li>';
    }
    Entry += '</div>'
  }
  return Entry;
};

NursePage.functions.getNurseResponseHandler = {
  200:reloadNurseDirectory,
  500:function (err) {
    console.log(err);
  }
};

function reloadNurseDirectory(data) {
  NursePage.functions.initNursePage();
  let entry = NursePage.functions.constructEntry(data);
  NursePage.DOMs.directory.append(entry);
}

NursePage.functions.clickTab = function () {
  NursePage.functions.initNursePage();
  getAllNurse(NursePage.functions.getNurseResponseHandler);
};

NursePage.functions.loadNursesOfHospital = function (hospitalId) {
    NursePage.functions.initNursePage();
    getNursesInOneHospital(hospitalId, NursePage.functions.getNurseResponseHandler);
}

/*
*   If you want to find all nurses in one hospital, please use this function
*   pass the hospital id as argument
* */
NursePage.functions.getNursesDirByHospitalId = function (hospitalId) {
  getNursesInOneHospital(hospitalId,NursePage.functions.getNurseResponseHandler);
};

NursePage.functions.initNursePage = function (isBack = false) {
  refreshPage(isBack, NursePage.DOMs.title);
  NursePage.DOMs.window.show();
  NursePage.DOMs.directory.html('');
};



$(function () {
  NursePage.DOMs.showBtn.click(function () {
    NursePage.functions.clickTab();
  });

  nursePageTab.click(function () {
    NursePage.functions.clickTab();
  });

  $('#patientPageNurseDirectoryBtn').click(function () {
    NursePage.functions.clickTab();
  })
});

