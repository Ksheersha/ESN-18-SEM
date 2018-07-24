var dbUtil = require('../dbUtil');
var Message = dbUtil.getModel('Message');

class MessageDAO {
  static newMessage(targetID, message) {
      var msg = new Message({
          uid: message.uid,
          username: message.username,
          content: message.content,
          timestamp: new Date(),
          status: message.status,
          to: targetID
      });
      return msg;
  }

  // Add message
  static addMessage(message) {
      var msg = MessageDAO.newMessage("", message);
      //console.log(message);
      return new Promise(function (resol, rej) {
          msg.save(function (err, message) {
              if (err) rej(err);
              else resol(message);
          });
      return msg;
    });
  }

  // Get all messages fulfills condition and sort by sortedItem
  static getMessages(condition, project, sortedItem, callback) {
      Message.find(condition, project).sort(sortedItem).exec(callback);
  }

  // Add message
  static addPrivateMessage(targetId, message, callback) {
      var msg = MessageDAO.newMessage(targetId, message);
      msg.save(callback);
  }

  /* Retrieve all private chat messages between user1 and user2 */
  static getPrivateMessage(condition, sortedItem, callback) {
      Message.find(condition).sort(sortedItem).exec(callback);
  }

  static getLatestMessage(callback) {
      Message.aggregate([
          {"$match": {"to": ""}},
          {"$sort": {"timestamp": 1 } },
          {"$group":{
              "_id": '$uid',
              "timestamp": {'$last': '$timestamp'},
              "content": {'$last': '$content'}
          }}
      ]).exec(callback);
  }

}

exports.MessageDAO = MessageDAO;
