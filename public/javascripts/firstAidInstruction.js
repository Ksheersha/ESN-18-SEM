let firstAidInstructionPage = {};
firstAidInstructionPage.DOMs = {};
firstAidInstructionPage.functions = {};
firstAidInstructionPage.httpUtils = {};
firstAidInstructionPage.responseHanlder = {};
firstAidInstructionPage.DOMs.dirWindow = $('#first_aid_dir_window');
firstAidInstructionPage.DOMs.aidWindow = $('#first_aid_inst_window');
firstAidInstructionPage.DOMs.aidList = $('#first_aid_list');
firstAidInstructionPage.DOMs.categoryTitle = $('#first_aid_category');
firstAidInstructionPage.DOMs.contentText = $('#first_aid_content');
firstAidInstructionPage.DOMs.showNurseDirectoryBtn = $('#showNurseDirectory');
firstAidInstructionPage.title = "First Aid Inst.";
firstAidInstructionPage.loadDirState = 1;
firstAidInstructionPage.loadInstState = 2;
firstAidInstructionPage.loadGooglePageState = 3;

/*
  There are two states in first aid directory:
  1: first aid directory window
  2: first aid instruction window
  3: redirect to google page
 */

firstAidInstructionPage.functions.constructEntry = function (data) {
  //<li class="list-group-item home-nav">Groups that I manage</li>
  let entry = '';
  for(let i=0; i < data.length; i++) {
    entry += '<li class="list-group-item home-nav" onclick=firstAidInstructionPage.functions' +
      '.load(firstAidInstructionPage.loadInstState,false,"'+data[i].category +'")';
    entry += ' style=" margin-bottom:1rem;">';
    entry += data[i].category;
    entry += '</li>';
  }
  return entry;
};



firstAidInstructionPage.functions.load = function(state,isBack = false,category = 'Allergy'){
  refreshPage(isBack, firstAidInstructionPage.title);
  if (state === firstAidInstructionPage.loadDirState) {
    firstAidInstructionPage.httpUtils.getAllInstructions(firstAidInstructionPage
      .responseHanlder.getAllInstructionsHandler);

  } else if ( state === firstAidInstructionPage.loadInstState) {
    firstAidInstructionPage.httpUtils.getOneInstructionByName(category,firstAidInstructionPage.
      responseHanlder.getOneInstructionHanlder);
  }

};

firstAidInstructionPage.functions.loadDirWindow = function (data) {
  firstAidInstructionPage.DOMs.aidWindow.hide();
  firstAidInstructionPage.DOMs.aidList.html("");
  let entry = firstAidInstructionPage.functions.constructEntry(data);
  firstAidInstructionPage.DOMs.aidList.append(entry);
  firstAidInstructionPage.DOMs.dirWindow.show();
};

firstAidInstructionPage.functions.loadInstWindow = function (data) {
  console.log(data);
  firstAidInstructionPage.DOMs.dirWindow.hide();
  firstAidInstructionPage.DOMs.categoryTitle.html(data.category);
  firstAidInstructionPage.DOMs.contentText.html(data.content);
  firstAidInstructionPage.DOMs.aidWindow.show();
};


// HttpUtil for first Aid Instructions Directory
// Create first aid instructions!!!!!!!!!!!!!
firstAidInstructionPage.httpUtils.createNewInstructions = function (category,content,responseHandler) {
  $.ajax({
    url: "/instructions",
    type: "POST",
    data: {
      category: category,
      content: content
    },
    statusCode: responseHandler
  });
};

firstAidInstructionPage.httpUtils.getAllInstructions = function (responseHandler) {
  $.ajax({
    url: "/instructions",
    type: "GET",
    statusCode: responseHandler
  });
};

firstAidInstructionPage.httpUtils.getOneInstructionByName = function (category,responseHandler) {
  $.ajax({
    url: "/instructions/" + category,
    type: "GET",
    statusCode: responseHandler
  });
};

firstAidInstructionPage.responseHanlder.getAllInstructionsHandler = {
  200:firstAidInstructionPage.functions.loadDirWindow,
  500:function (err) {
    console.log(err);
  }
};
firstAidInstructionPage.responseHanlder.getOneInstructionHanlder = {
  200:firstAidInstructionPage.functions.loadInstWindow,
  500:function (err) {
    console.log(err);
  }
};

// $(function () {
//   firstAidBtn.click(function () {
//     firstAidInstructionPage.functions.load(firstAidInstructionPage.loadDirState);
//   });
//
//   firstAidInstructionTab.click(function () {
//     firstAidInstructionPage.functions.load(firstAidInstructionPage.loadDirState);
//   });
//
//   firstAidInstructionPage.DOMs.showNurseDirectoryBtn.click(function () {
//     NursePage.functions.clickTab();
//   });
//
//   $('#patientPageFirstAidInstructionBtn').click(function () {
//     firstAidInstructionPage.functions.load(firstAidInstructionPage.loadDirState);
//   })
// });