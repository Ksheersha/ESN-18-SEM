// ###################### Instruction List Page ######################

let instructionListPage = {
  'DOMs': {},
  'functions': {},
  'http': {},
  'title': 'First Aid'
};


instructionListPage.DOMs.this = $('#instructionListPage');
instructionListPage.DOMs.list = $('#instructionList');


instructionListPage.http.getInstructionList = function (onSuccess) {
  $.ajax({
    url: "/instructions",
    type: "GET",
    success: onSuccess
  });
};

instructionListPage.functions.buildListItem = function (title, id_) {
  return $(
    '<li class="list-group-item" instructionId="' + id_ + '">' +
    title +
    '</li>'
  )
};

instructionListPage.functions.buildList = function (data) {
  instructionListPage.DOMs.list.empty();
  for (let i = 0; i < data.length; ++i) {
    let listItem = instructionListPage.functions.buildListItem(data[i].category, data[i]._id);
    instructionListPage.DOMs.list.append(listItem);
  }
};

instructionListPage.load = function (isBack) {
  refreshPage(isBack, instructionListPage.title);
  let onSuccess = function (data) {
    instructionListPage.functions.buildList(data);
    instructionWindow.hideAll();
    instructionWindow.show();
    instructionListPage.DOMs.this.show();
  };

  instructionListPage.http.getInstructionList(onSuccess);

};


// ###################### Instruction Detail Page ######################

let instructionDetailPage = {
  'DOMs': {},
  'functions': {},
  'states': {},
  'http': {}
};


instructionDetailPage.DOMs.this = $('#instructionDetailPage');
instructionDetailPage.DOMs.title = $('#instructionDetailTitle');
instructionDetailPage.DOMs.content = $('#instructionDetailContent');


instructionDetailPage.http.getInstructionDetail = function (id_, onSuccess) {
  $.ajax({
    url: "/instructions/" + id_,
    type: "GET",
    success: onSuccess
  });
};


instructionDetailPage.functions.build = function (title, content) {
  instructionDetailPage.DOMs.title.html(title);
  instructionDetailPage.DOMs.content.empty();
  instructionDetailPage.DOMs.content.append($(content));
  instructionDetailPage.DOMs.content.append($(
    '<div>' +
      '<a target="_blank" href="https://google.com/search?q=' + encodeURIComponent(title) + '"> Search Google</a>' +
    '</div>'
  ))
};

instructionDetailPage.load = function (instructionId, isBack) {
  instructionDetailPage.states.id = instructionId;
  let onSuccess = function(data){
    refreshPage(isBack, data.category);
    instructionListPage.DOMs.this.hide();
    instructionWindow.show();
    instructionDetailPage.functions.build(data.category, data.content);
    instructionDetailPage.DOMs.this.show();
  };
  instructionDetailPage.http.getInstructionDetail(instructionId, onSuccess);
};

instructionDetailPage.loadByName = function(name, isBack){
  let onAllInstructions = function(data){
    let found = false;
    for(let i = 0; i < data.length; ++i){
      if(data[i].category === name){
        instructionDetailPage.load(data[i]._id, isBack);
        found = true;
        break;
      }
    }

    if(!found){
      refreshPage(isBack, data.category);
      instructionListPage.DOMs.this.hide();
      instructionWindow.show();
      instructionDetailPage.functions.build(name, '');
      instructionDetailPage.DOMs.this.show();
    }
  };

  instructionListPage.http.getInstructionList(onAllInstructions);

};

instructionWindow.hideAll = function () {
  instructionListPage.DOMs.this.hide();
  instructionDetailPage.DOMs.this.hide();
};


$(function () {
  firstAidBtn.click(function () {
    instructionListPage.load(false);
  });

  instructionListPage.DOMs.list.on('click', 'li', function () {
    instructionDetailPage.load($(this).attr('instructionId'), false);
  });

  firstAidInstructionPage.DOMs.showNurseDirectoryBtn.click(function () {
    NursePage.functions.clickTab();
  });

  $('#patientPageFirstAidInstructionBtn').click(function () {
    firstAidInstructionPage.functions.load(firstAidInstructionPage.loadDirState);
  });

  firstAidInstructionTab.click(function () {
    instructionListPage.load(false);
  });
});
