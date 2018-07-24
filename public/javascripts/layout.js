$(document).ready(
    function() {
        $('body').bootstrapMaterialDesign();
    }
);
var showMessageModal = function(title, content) {
    $('#modalPromoteMessage .modal-title').html(title);
    $('#modalPromoteMessage .modal-body').html(content);
    $('#modalPromoteMessage').modal('show');
}

var showAlertModal = function(title, content) {
    $('#modalAlertMessage .modal-title').html(title);
    $('#modalAlertMessage .modal-body').html(content);
    $('#modalAlertMessage').modal('show');
}

var closeIncidentModel = function(title,content) {
    $('#modalCloseIncident .modal-title').html(title);
    $('#modalCloseIncident .modal-body').html(content);
    $('#modalCloseIncident').modal('show');
}
