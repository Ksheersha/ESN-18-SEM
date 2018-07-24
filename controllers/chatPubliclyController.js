'use strict';

var MessageDAO = require('../util/dao/messageDAO').MessageDAO;
var searcher = require('../util/searcher');

/* Class ChatPubliclyController */
module.exports =
    class ChatPubliclyController {

        /* Post a new message */
        postNewMessage(req, res) {
            MessageDAO.addMessage(req.body)
                .then(function (msg) {
                    res.sendStatus(200);
                    global.io.emit("new message", JSON.stringify(msg));
                    global.io.emit("reload map");
                }, function (err) {
                    res.status(404).send(err);
                });
        };

        /* Retrieve all chat messages in MongoDB */
        getPublicWall(req, res) {
            var condition = {to: ""};
            if (req.query.keywords) {
                condition.content = searcher.getRegexForSearch(req.query.keywords);
            }
            if (condition.content === null) {
                res.status(200).send();
                return;
            }

            MessageDAO.getMessages(condition,
                {uid: 1, username: 1, content: 1, status: 1, timestamp: 1}, {timestamp: -1},
                function (err, messages) {
                    if (err)
                        res.send(err);
                    else
                        res.status(200).json(searcher.pagination(messages, req.query.start));
                });
        };

        /* Retrieve all chat messages of specific user in MongoDB */
        getUserMessage(req, res) {
            MessageDAO.getMessages({username: req.params.userName},
                {username: 1, content: 1, status: 1, timestamp: 1}, {timestamp: 1},
                function (err, messages) {
                    if (err)
                        res.send(err);
                    else
                        res.status(200).json(messages);
                });
        };

    };
