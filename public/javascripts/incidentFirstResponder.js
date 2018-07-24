let addIncidentButton = $('#addIncidentButton');
let responderId = $('#id').html();

let myIncidentTableBodyFirstResponder = $('#myIncidentTableBodyFirstResponder');
let otherOpenIncidentsTableBodyFirstResponder = $('#otherOpenIncidentsTableBodyFirstResponder');
let closedIncidentsTableBodyFirstResponder = $('#closedIncidentsTableBodyFirstResponder');

// tables inside cards to get users

function displayIncidentsForFirstResponder (incidents) {
  myIncidentTableBodyFirstResponder.html(generateTableContent(incidents.myIncidents, true));
  otherOpenIncidentsTableBodyFirstResponder.html(generateTableContent(incidents.otherOpenIncidents, true));
  closedIncidentsTableBodyFirstResponder.html(generateTableContent(incidents.closedIncidents, true));
  allClosedIncidents(incidents.closedIncidents);

  // generate click handllers for each incident
  generateIncidentClickHandlers(incidents.myIncidents);
  generateIncidentClickHandlers(incidents.otherOpenIncidents);
  generateIncidentClickHandlers(incidents.closedIncidents);
}
$(function () {
  addIncidentButton.click(function () {
    createIncidentFirstResponder(responderId);
  });
});


