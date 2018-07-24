let addHospitalButton = $('#addHospitalButton');

$(function () {
    hospitalDirectoryTab.click(()=> {
        clickHospitalDirectory();
    });
    addHospitalButton.click(()=> {
        setHospitalId('');
        clickHospitalPage();
    });
});

function clickHospitalDirectory (isBack = false) {
    refreshPage(isBack, HOSPITAL_DIRECTORY_WINDOW_TITLE);
    hospitalDirectoryWindow.show();
    $('#hospitalDirectory').html('');
    getHospitalDirectory(reloadHospitalDirectory);
}

function reloadHospitalDirectory(response) {
    for (let i = 0; i < response.length; i++) {
        appendHospital('#hospitalDirectory', response[i]);
    }
}

function appendHospital(elementID, hospital) {
    let divStr = "";
    divStr += hospitalListing(hospital);
    $(elementID.toString()).append(divStr);
}

function showHospital (element) {
    let id = $(element).find('.hidden-hospitalId').text();
    setHospitalId(id);
    clickHospitalPage(false);
}

function setHospitalId (id) {
    $('#hospitalId').text(id);
}

function getHospitalId () {
    return $('#hospitalId').text();
}

function hospitalListing(hospital) {
    let divStr = "";
    divStr += "<div class = 'card supply-card'><div class='row' onclick='showHospital(this);'><div class='col-10 card-title supplyName'>" + hospital.hospitalName + "</div>";
    divStr += "<i class='col-2 pull-right material-icons md-24'>keyboard_arrow_right</i>";
    divStr += "<div class='page-hidden-info hidden-hospitalId'>" + hospital._id + "</div>";
    return divStr;
}
