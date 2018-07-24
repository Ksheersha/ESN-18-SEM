'use strict';
let GroupDAO = require('../util/dao/groupDAO');
let UserDAO = require('../util/dao/userDAO').UserDAO;

/* Class GroupController */
module.exports =
  class GroupController {

    /*Create or update a group*/
    createGroup(req, res) {

      let groupData = JSON.parse(JSON.stringify(req.body));
      if(typeof groupData.participants === 'string') {
        groupData.participants = JSON.parse(groupData.participants);
      }

      groupData['owner'] = req.params.userId;
      GroupDAO.addGroup(groupData)
      .then(function(group) {
        res.status(201).send(group._id);
      })
      .catch(function(err) {
        res.status(400).send(err);

      });
    }

    getAllGroups(req, res) {

      GroupDAO.getAllGroupsByUserId(req.params.userId)
      .then(function(groupInfo) {
        res.status(200).send(groupInfo);
      })
      .catch(function (err) {
        res.status(500).send(err);
      });

    }

    checkExistingGroupName(req, res){
      GroupDAO.checkExistingGroupName(req.body.name)
      .then(function(existing){
        res.status(200).send({'existing': existing})
      })
      .catch(function (err) {
        res.status(500).send(err);
      });
    }

    deleteGroup(req, res){
      GroupDAO.deleteGroup(req.params.groupId)
      .then(function(data) {
        res.status(202).send(data);
      })
      .catch(function(err) {
        res.status(500).send(err);
      });
    }

    quitGroup(req, res){
      GroupDAO.quitGroup(req.params.userId, req.params.groupId)
      .then(function(data) {
        res.status(202).send(data);
      })
      .catch(function(err) {
        res.status(500).send(err);
      });      
    }

    updateGroup(req, res){
      if(req.body['participants[]']){
        req.body.participants = req.body['participants[]'];
      }
      GroupDAO.updateGroup(req.params.groupId, req.body)
      .then(function(data) {
        res.status(202).send(data);
      })
      .catch(function(err) {
        res.status(500).send(err);
      });
    }

    checkGroupNaming(req, res){
      GroupDAO.checkGroupNaming(req.body._id, req.body.name).then(function(allowed){
        res.status(200).send({allowed: allowed})
      }).catch(function(err){
        res.status(500).send(err);
      });
    }

    getOneGroupInfo(req,res){
      GroupDAO.getGroup(req.params.groupId)
      .then (function(groupData) {
        res.status(200).send(groupData);
      })
      .catch(function(err) {
        res.status(500).send(err);
      });
    }

    getGroupName(req, res) {
      GroupDAO.getGroupName(req.params.groupId)
        .then(function (groupName) {
          res.status(200).send(groupName)
        })
        .catch(function (err) {
          res.status(500).send(err);
        });
    }

  };
