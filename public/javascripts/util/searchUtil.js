var navKeyword = "";
var privateKeyword = "";
var navSearchOffset = 0;
var privateSearchOffset = 0;

var navSearchDiv = $(".nav-search-container");
var navSearchInput = navSearchDiv.find("#navSearchInput");
var navShowSearchBtn = $("#navShowSearchBtn");
var navHideSearchBtn = $("#navHideSearchBtn");
var navMoreBtn = $("#navMoreBtn");
var privateSearchDiv = $(".private-search-container");
var modalPrivateChat = $("#modalPrivateChat");
var privateSearchInput = privateSearchDiv.find("#privateSearchInput");
var privateShowSearchBtn = $("#privateShowSearchBtn");
var privateHideSearchBtn = $("#privateHideSearchBtn");
var privateMoreBtn = $("#privateMoreBtn");

function navSearchHandler() {
    navSearchOffset = 0;    // every time keywords change will clear offset
    navKeyword = encodeURIComponent(getEscapedInputBoxContent(navSearchInput));

    if (isExpand(userWindow)) {        // search for user directory
        getUsersHTTP(getUserResponseHandler, navKeyword);
    } else if (isExpand(chatWindow)) {  // search for public chat
        getPublicMessagesHTTP(reloadPublicMessage, navKeyword, navSearchOffset);
    } else if (isExpand(announceWindow)) { // search for announcement
        getPublicAnnouncementsHTTP(reloadAnnouncements, navKeyword, navSearchOffset);
    }

}

function privateSearchHandler() {
    privateSearchOffset = 0;     // every time keywords change will clear offset
    privateKeyword = encodeURIComponent(getEscapedInputBoxContent(privateSearchInput));

    let toID = $("#toID").html();
    getPrivateMessageHTTP(id, toID, reloadPrivateMessage, privateKeyword, privateSearchOffset);
}

function navMoreBtnHandler() {
    if (isExpand(pubChatTab)) { // see 10 more for public chat
        getPublicMessagesHTTP(renderPublicMessage, navKeyword, navSearchOffset);
    } else if (isExpand(announcementTab)) {  // see 10 more for announcement
        getPublicAnnouncementsHTTP(renderAnnouncements, navKeyword, navSearchOffset);
    }
}

function privateMessagesMoreBtnHandler() {
    let toID = $("#toID").html();
    getPrivateMessageHTTP(id, toID, renderPrivateMessage, privateKeyword, privateSearchOffset);
}

function isSearch(element) {
    return element.val() !== "";
}

function showNavSearch() {
    navSearchInput.val("");
    navSearchDiv.slideDown();
    navMoreBtn.fadeOut();
    navShowSearchBtn.fadeOut();
    navSearchInput.focus();
}
function hideNavSearch() {
    navSearchInput.val("");
    navSearchDiv.slideUp();
    navMoreBtn.fadeOut();
    navShowSearchBtn.fadeIn();
    navSearchHandler();
}
function showPrivateSearch() {
    privateSearchInput.val("");
    privateSearchDiv.slideDown();
    privateMoreBtn.fadeOut();
    privateShowSearchBtn.fadeOut();
    privateSearchInput.focus();
}
function hidePrivateSearch() {
    privateSearchInput.val("");
    privateSearchDiv.slideUp();
    privateMoreBtn.fadeOut();
    privateShowSearchBtn.fadeIn();
    privateSearchHandler();
}