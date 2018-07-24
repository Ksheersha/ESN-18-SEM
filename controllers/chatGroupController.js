let MessageDAO = require('../util/dao/messageDAO').MessageDAO;
let GroupDAO = require('../util/dao/groupDAO');
let ImageDAO = require('../util/dao/imageDAO');
let searcher = require('../util/searcher');
let privateMsgUtil = require('../util/privateMsgUtil')


function sendNotification(groupId, sourceId, msg) {
  GroupDAO.getGroup(groupId)
    .then(function(groupData) {
      let participantGroup = groupData.participants;
      let owner = groupData.owner;
      let group = Array();
      for (let i = 0;i < participantGroup.length; i++) {
        group.push(''+participantGroup[i]);
      }
      group.push(''+owner);

      for (let n in clients_list) {

        if (clients_list[n].id === sourceId) {
          let sourceSocket = clients_list[n].Socket;
          sourceSocket.emit("Message group send", msg);
          sourceSocket.emit("Message send", msg);

        } else if (group.includes(clients_list[n].id)) {
          let targetSocket = clients_list[n].Socket;
          targetSocket.emit("Message group receive",msg);
          targetSocket.emit("Message receive",msg);

          // remove send participants
          var index = group.indexOf(clients_list[n].id);
          if (index > -1) {
            group.splice(index, 1);
          }
        }
      }
    });
}

module.exports = class ChatPrivatelyController {
  constructor() {
    this.sendGroupMessage = this.sendGroupMessage.bind(this);
    this.sendGroupImageMessage = this.sendGroupImageMessage.bind(this);
  }

  sendGroupMessage(req, res) {
    let targetId = req.body.uid;
    let sourceId = req.body.sendUid;

    let message = privateMsgUtil.structMsg(req);
    MessageDAO.addPrivateMessage(targetId, message, function(err, msg) {
      if (err) {
        res.status(500).send(err);
      } else {
        sendNotification(targetId, sourceId, msg);
        res.sendStatus(201);
      }
    });
  };

  /* Retrieve all private chat messages between user1 and user2 */
  getGroupMessage(req, res) {
    var groupID = req.params.groupID;
    var condition = {
      "to": groupID
    };
    if (req.query.keywords) {
      var regex = searcher.getRegexForSearch(req.query.keywords);
      if (regex === null) {
        res.status(200).send();
        return;
      }
      condition.push({
          "content": regex
        });
    }
    MessageDAO.getPrivateMessage(condition, {
      timestamp: -1
    }, function(err, messages) {
      if (err) res.status(404).send(err);
      else res.status(200).json(searcher.pagination(messages, req.query.start));
    });
  };

  sendGroupImageMessage(req,res){
    let content = req.body.content;
    ImageDAO.saveImage(content,(err,image) => {
        if(err) res.status(404).send(err);
        else{
          req.body.content = "Image: " + image._id;
          this.sendGroupMessage(req,res);
        }
    })
  }
};
