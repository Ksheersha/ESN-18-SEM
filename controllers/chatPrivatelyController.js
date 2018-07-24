'use strict';

let MessageDAO = require('../util/dao/messageDAO').MessageDAO;
let ImageDAO = require('../util/dao/imageDAO');
let searcher = require('../util/searcher');
let privateMsgUtil = require('../util/privateMsgUtil');

module.exports=
    class ChatPrivatelyController {
        constructor() {
            this.sendPrivateMessage = this.sendPrivateMessage.bind(this);
            this.sendPrivateImageMessage = this.sendPrivateImageMessage.bind(this);
        }

        sendPrivateMessage(req, res) {
            var targetId = req.body.uid;
            var sourceId = req.body.sendUid;

            var message = privateMsgUtil.structMsg(req);

            MessageDAO.addPrivateMessage(targetId, message, function (err, msg) {
                if (err) {
                    res.status(500).send(err);
                } else {
                    var Received = false;

                    for (let n in clients_list) {
                        if (clients_list[n].id === targetId) {
                            var targetSocket = clients_list[n].Socket;
                            targetSocket.emit("ReceivedPrivateMessage", sourceId, msg);
                            targetSocket.emit("Message receive", msg);
                            Received = true;
                        }
                        if (clients_list[n].id === sourceId) {
                            var sourceSocket = clients_list[n].Socket;
                            sourceSocket.emit("PrivateMessageSent", targetId, msg);
                            sourceSocket.emit("Message send", msg);
                        }
                    }

                    if (!Received) {
                      privateMsgUtil.sendOffline(unread_list, targetId, sourceId);
                    }

                    res.sendStatus(201);
                }
            });
        };

        /* Retrieve all private chat messages between user1 and user2 */
        getPrivateMessage(req, res) {
            var fromID = req.params.fromID;
            var toID = req.params.toID;
            var condition = {
                "$or": [
                    {"$and":[{"uid": fromID},{"to": toID}]},
                    {"$and":[{"uid": toID},{"to": fromID}]}
                ]
            };
            if (req.query.keywords) {
                var regex = searcher.getRegexForSearch(req.query.keywords);
                if (regex === null) {
                    res.status(200).send();
                    return;
                }
                condition["$or"].forEach(function (andObj) {
                    andObj["$and"].push({"content": regex});
                })
            }
            MessageDAO.getPrivateMessage(condition, {timestamp:-1}, function(err,messages){
                if(err) res.status(404).send(err);
                else res.status(200).json(searcher.pagination(messages, req.query.start));
            });
        };

        sendPrivateImageMessage(req,res){
            var content = req.body.content;
            ImageDAO.saveImage(content, (err,image) => {
                if(err != null ) res.status(404).send(err);
                else{
                    req.body.content = "Image: " + image._id;
                    this.sendPrivateMessage(req,res);
                }
            })
        }
    };
