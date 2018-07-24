function clickSupply(isBack = false) {
  refreshPage(isBack, SUPPLY_WINDOW_TITLE);
  addSupplyBtn.show();
  supplyWindow.show();
  $('#supplyList').html('');
  getSupplyHTTP(reloadSupplyList);
}

$(function () {
  supplyTab.click(function () {
    clickSupply();
  });

  socket.on('new supply', function(doc) {
    appendSupply('#supplyList', JSON.parse(doc), true);
  });
  socket.on('reload supply', function(d) {
    getSupplyHTTP(reloadSupplyList);
  });

  addSupplyBtn.click(function() {
    showAddSupplyModal();
  });
  addSupplyFinishBtn.click(addSupply);
  requestSupplyBtn.click(requestSupply);
  deleteSupplyBtn.click(showDeleteSupplyDialog);
  deleteSupplyConfirmBtn.click(doDeleteSupply);



  $('#checkAll').click(function () {
    $('.checkbox-sub').prop('checked', $(this).prop('checked'));
  });

  $('.checkbox-sub').change(function() {
    if (!$(this).prop('checked')) {
      $('#checkAll').prop('checked', false);
    }
  });
});