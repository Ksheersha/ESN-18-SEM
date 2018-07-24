
var addSupplyBtn = $("#addSupplyBtn");
var checkAll = $("#checkAll");
var checkAvailable = $("#checkAvailable");
var checkRequested = $("#checkRequested");
var checkMySupply = $("#checkMySupply");
var checkUnavailable = $("#checkUnavailable");

var modalAddSupply = $("#modalAddSupply");
var inputSupplyName = $("#inputSupplyName");
var inputSupplyQuantity = $("#inputSupplyQuantity");
var inputSupplyLocation = $("#inputSupplyLocation");
var inputSupplyDescription = $("#inputSupplyDescription");
var addSupplyFinishBtn = $("#addSupplyFinishBtn");
var requestSupplyBtn = $("#requestSupplyBtn");
var deleteSupplyBtn = $("#deleteSupplyBtn");
var modalSupplyInfo = $("#modalSupplyInfo");
var modalDeleteSupply = $("#modalDeleteSupply");
var deleteSupplyConfirmBtn = $("#deleteSupplyConfirmBtn");

function reloadSupplyList(response) {
    $("#supplyList").html("");
    let id = $("#id").text();
    if (checkAll.prop("checked")) {
        for (let i = 0; i < response.length; i++) {
            appendSupply('#supplyList', response[i]);
        }
        return;
    }
    for (let i = 0; i < response.length; i++) {
        if (isOwnSupply(id, response[i])
            && checkMySupply.prop("checked")) {
            appendSupply('#supplyList', response[i]);
            continue;   // append own supply
        }
        if (isAvailableSupply(id, response[i])
            && checkAvailable.prop("checked")) {
            appendSupply('#supplyList', response[i]);
            continue;   // append available supply
        }
        if (isRequestedSupply(id, response[i])
            && checkRequested.prop("checked")) {
            appendSupply('#supplyList', response[i]);
            continue;   // append requested supply
        }
        if (isUnavailableSupply(id, response[i])
            && checkUnavailable.prop("checked")) {
            appendSupply('#supplyList', response[i]);   // append unavailable supply
        }
    }
}
function isOwnSupply(id, supply) {
    return supply.ownerId === id;
}
function isAvailableSupply(id, supply) {
    return !isOwnSupply(id, supply)
        && (!supply.requesterId);
}
function isRequestedSupply(id, supply) {
    return !isAvailableSupply(id, supply)
        && supply.requesterId === id;
}
function isUnavailableSupply(id, supply) {
    return !isOwnSupply(id, supply)
        && !isAvailableSupply(id, supply)
        && supply.requesterId !== id;
}
function showAddSupplyModal() {
    modalAddSupply.modal("show");
    inputSupplyName.val("");
    inputSupplyQuantity.val("");
    inputSupplyDescription.val("");
    inputSupplyLocation.val("");
}
function addSupply() {
    let name = inputSupplyName.val();
    let quantity = inputSupplyQuantity.val();
    let location = inputSupplyLocation.val();
    let description = inputSupplyDescription.val();
    if (name === "") {
        showMessageModal("Incomplete Supply Info", "Please input supply name");
    } else if (quantity === "") {
        showMessageModal("Incomplete Supply Info", "Please input supply quantity");
    } else if (location === "") {
        showMessageModal("Incomplete Supply Info", "Please input the location of supply");
    } else {
        let ownerId = $("#id").html();
        let data = {
            name, quantity, ownerId, location, description
        }
        postSupplyHTTP(data, {
            200: function (data, status) {
                showMessageModal("Succeed", "Finished to add new supply. Thanks for your kindness.");
                modalAddSupply.modal("hide");
            },
            404: function (response) {
            }
        });
    }
}

function appendSupply(elementID, supply, isPrepend) {
    var divStr = "";
    divStr += supplyCardSyntax(supply);
    divStr += supplyHeaderSyntax(supply);
    divStr += supplyBodySyntax(supply);
    divStr += "</div>"

    var supplyDiv = $(elementID.toString());
    if (isPrepend) {
        supplyDiv.prepend(divStr);
    } else {
        supplyDiv.append(divStr);
    }
}
function supplyCardSyntax(supply) {
    let divStr = "";
    let id = $("#id").html();
    if (supply.ownerId === id) {
        divStr += "<div class='card supply-card supply-me' onclick='showSupplyInfo(this)'>";
    } else {
        divStr += "<div class='card supply-card' onclick='showSupplyInfo(this)'>";
    }
    return divStr;
}
function supplyHeaderSyntax(supply) {
    let divStr = "";
    divStr += "<div class='row'><div class='col-7 card-title supplyName'>" + supply.name + "</div>";
    divStr += "<div class='col-5 ml-auto supplyTime'>" + getTimeString(supply.timestamp) + "</div></div>";
    return divStr;
}

function supplyBodySyntax(supply) {
    let divStr = "";
    divStr += "<div class='row'><div class='col-6 card-text supplyLocation'><i class=\"material-icons md-18 md-grey\">room</i>" + supply.location + "</div>";
    divStr += getSupplyQuantityDiv(supply) + "</div>";
    divStr += "<div class='page-hidden-info hidden-supplyId'>" + supply._id + "</div>";
    divStr += "<div class='page-hidden-info hidden-supplyOwnerId'>" + supply.ownerId + "</div>";
    divStr += "<div class='page-hidden-info hidden-supplyRequesterId'>" + supply.requesterId + "</div>"
    divStr += "<div class='page-hidden-info hidden-supplyDescription'>" + supply.description + "</div>"
    divStr += "<div class='page-hidden-info hidden-supplyQuantity'>" + supply.quantity + "</div>"
    divStr += "<div class='page-hidden-info hidden-supplyLocation'>" + supply.location + "</div>"
    return divStr;
}
function getSupplyQuantityDiv(supply) {
    let divStr = "<div class='col-6 card-text ml-auto supplyQuantity'>";
    let id = $("#id").text();
    if (supply.ownerId === id) {
        if (supply.requesterId) {
            divStr += "Confirmed<i class=\"material-icons md-purple\">tag_faces</i><i class=\"material-icons\">playlist_add_check</i>";
        } else {
            divStr += "Your Supply<i class=\"material-icons md-purple\">tag_faces</i>";
        }
    } else {
        if (supply.requesterId) {
            if (supply.requesterId === id) {
                divStr += "Requested<i class=\"material-icons icon-help\">star</i>";
            } else {
                divStr += "Unavailable<i class=\"material-icons icon-emergency\">block</i>";
            }
        } else {
            divStr += supply.quantity + " available<i class=\"material-icons icon-ok\">add_shopping_cart</i>";
        }
    }
    divStr += "</div>";
    return divStr;
}
function showSupplyInfo(element) {
    let supplyId = $(element).find('.hidden-supplyId').text();
    let supplyName = $(element).find(".supplyName").text();
    let supplyTime = $(element).find(".supplyTime").text();
    let supplyLocation = $(element).find(".hidden-supplyLocation").text();
    let supplyQuantity = $(element).find(".hidden-supplyQuantity").text();
    let supplyDescription = $(element).find(".hidden-supplyDescription").text();
    let supplyOwnerId = $(element).find(".hidden-supplyOwnerId").text();
    let supplyRequesterId = $(element).find(".hidden-supplyRequesterId").text();

    let id = $("#id").text();
    modalSupplyInfo.find(".hidden-supplyId").text(supplyId);
    modalSupplyInfo.find(".hidden-ownerId").text(supplyOwnerId);
    modalSupplyInfo.find("#supplyInfoName").text(supplyName);
    modalSupplyInfo.find("#supplyInfoLocation").text(supplyLocation);
    modalSupplyInfo.find("#supplyInfoQuantity").text(supplyQuantity);
    modalSupplyInfo.find("#supplyInfoPostTime").text(supplyTime);
    modalSupplyInfo.find("#supplyInfoDescription").text(supplyDescription);
    getUserByIdHTTP(supplyOwnerId, function(user) {
        modalSupplyInfo.find("#supplyInfoOwner").text(user.username);
    });
    // check if the supply hasn't been requested
    if (supplyRequesterId != "undefined") {
        getUserByIdHTTP(supplyRequesterId, function(user) {
            modalSupplyInfo.find("#supplyInfoRequester").text(user.username);
            modalSupplyInfo.find(".supply-requester").css("display", "flex");
            modalSupplyInfo.find("#requestSupplyBtn").css("display", "none");
        });
    } else {
        modalSupplyInfo.find(".supply-requester").css("display", "none");
        modalSupplyInfo.find("#requestSupplyBtn").css("display", "inline-block");
    }
    if (supplyOwnerId === id) {     // own supply
        modalSupplyInfo.find("#requestSupplyBtn").css("display", "none");
        deleteSupplyBtn.css("display", "inline-block");
    }
    modalSupplyInfo.modal("show");
}
function requestSupply() {
    let supplyId = modalSupplyInfo.find(".hidden-supplyId").text();
    let supplyName = modalSupplyInfo.find("#supplyInfoName").text();
    let requesterId = $("#id").text();
    let ownerId = modalSupplyInfo.find(".hidden-ownerId").text();
    let ownerName = modalSupplyInfo.find("#supplyInfoOwner").text();

    postSupplyRequestHTTP(supplyId, requesterId, function() {
        showMessageModal("Request Succeed", "Your request has been sent to the supply owner " + ownerName);
        getSupplyHTTP(reloadSupplyList);
        let requesterStatus = $("#userStatus").text();
        let requesterName = $("#userName").text();
        let content = "Hi, " + ownerName + ". My name is " + requesterName
            + ". I would like to get your supply '" + supplyName + "'. I was wondering when it is convenient to get it?" + " Thank you.";

        let data = {
            toID: ownerId,
            id: requesterId,
            username: requesterName,
            chatContent: content,
            userStatus: requesterStatus
        }
        postPrivateMessageHTTP(data, {
            200: function (data, status) {},
            500: function (response) {}
        });
    });
}
function showDeleteSupplyDialog() {
    let str = "Do you really want to delete your supply \"";
    let supplyName = modalSupplyInfo.find("#supplyInfoName").text();
    modalDeleteSupply.find(".modal-body").html(str + supplyName + "\"?");
    modalDeleteSupply.modal("show");
}
function doDeleteSupply() {
    let id = $("#id").text();
    let supplyId = modalSupplyInfo.find(".hidden-supplyId").text();
    postSupplyDeletionHTTP(id, supplyId, {
        200: function() {
            showMessageModal("Delete succeed", "Your supply has been deleted succesfully.");
            modalSupplyInfo.modal("hide");
        },
        401: function() {
            showMessageModal("Delete fail", "You cannot delete others supply.");
        },
        404: function() {
            showMessageModal("Delete fail", "The supply does not exist.");
        }
    });
}