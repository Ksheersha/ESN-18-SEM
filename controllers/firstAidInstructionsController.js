let firstDAO = require('../util/dao/firstAidInstructionDAO');

class firstAidInstructionsController{
  createInstruction(req,res){
    let content = req.body.content;
    let category = req.body.category;
    firstDAO.insertNewInstruction(category,content)
      .then(function (instruction) {
        res.status(200).send(instruction);
      })
      .catch(function (err) {
        res.status(500).send(err);
      });
  }

  getAllInstructions(req,res){
    firstDAO.getAllInstructions()
      .then(function (data) {
        res.status(200).send(data);
      })
      .catch(function (err) {
        res.status(500).send(err);
      })
  }

  /*
  getOneInstruction(req,res){
    let category = req.params.category;
    firstDAO.getInstructionByName(category)
      .then(function (data) {
        res.status(200).send(data);
      })
      .catch(function (err) {
        res.status(500).send(err);
      })
  }
  */

  getInstructionById(req, res){
    let id_ = req.params.id_;
    firstDAO.getInstructionById(id_)
      .then(function(data){
        res.status(200).send(data);
      })
      .catch(function(err){
        res.status(404).send(err);
      })
  }

  clear(req, res){
    firstDAO.clear()
      .then(function(data){
        res.status(200).send(data);
      })
      .catch(function(err){
        res.status(404).send(err);
      })
  }
}

module.exports = firstAidInstructionsController;