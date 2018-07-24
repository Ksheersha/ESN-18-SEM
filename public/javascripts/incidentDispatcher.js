let waitingIncidentsTableBody = $('#waitingIncidentsTableBody');
let triageIncidentsTableBody = $('#triageIncidentsTableBody');
let assignedIncidentsTableBody = $('#assignedIncidentsTableBody');
let closedIncidentsTableBody = $('#closedIncidentsTableBody');
let dispatcherId = $('#id').html();

function displayIncidentsForDispatcher (incidents) {
  waitingIncidentsTableBody.html(generateTableContent(incidents.waitingIncidents, true));
  triageIncidentsTableBody.html(generateTableContent(incidents.triageIncidents, true));
  assignedIncidentsTableBody.html(generateTableContent(incidents.assignedIncidents, true));
  closedIncidentsTableBody.html(generateTableContent(incidents.closedIncidents, true));
  allClosedIncidents(incidents.closedIncidents);

  // generate click handllers for each incident
  generateIncidentClickHandlers(incidents.waitingIncidents);
  generateIncidentClickHandlers(incidents.triageIncidents);
  generateIncidentClickHandlers(incidents.assignedIncidents);
  generateIncidentClickHandlers(incidents.closedIncidents);
}
