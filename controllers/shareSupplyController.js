var SupplyDAO = require('../util/dao/supplyDAO').SupplyDAO;
var searcher = require('../util/searcher');

/* Class ChatPubliclyController */
module.exports =
    class ShareSupplyController {

        /* Post a new message */
        postNewSupply(req, res) {
            SupplyDAO.addSupply(req.body)
                .then(function (supply) {
                    res.sendStatus(200);
                    global.io.emit("new supply", JSON.stringify(supply));
                })
                .catch(function (err) {
                    res.status(404).send(err);
                });
        };

        /* Retrieve all supplies in MongoDB */
        getSupply(req, res) {
            var condition = {};
            if (req.query.keywords) {
                condition.content = searcher.getRegexForSearch(req.query.keywords);
            }
            if (condition.content === null) {
                res.status(200).send();
                return;
            }

            SupplyDAO.getSupply(condition,
                {timestamp: -1},
                function (err, supply) {
                    if (err)
                        res.send(err);
                    else
                        res.status(200).json(searcher.pagination(supply, req.query.start));
                }
            );
        };

        /* Retrieve supply by id in MongoDB */
        getSupplyById(req, res) {
            var supplyId = req.params.supplyId;
            SupplyDAO.findSupplyById(supplyId).then(
                function (err, supply) {
                    if (err) {
                        res.send(err);
                    } else {
                        if (!supply) {
                            res.sendStatus(404);
                        } else {
                            res.status(200).json(supply);
                        }
                    }
                }
            );
        };

        requestSupply(req, res) {
            SupplyDAO.findSupplyById(req.body.supplyId).then(function(supply) {
                if (!supply) {
                    res.sendStatus(404);     // supply not exist
                } else {
                    if (supply.requesterId && supply.requesterId !== "") {
                        res.sendStatus(400); // no longer available
                    } else {
                        if (req.body.requesterId === supply.ownerId) {
                            // should not request own supply
                            res.sendStatus(401);
                        }
                        let condition = {_id: req.body.supplyId};
                        let update = {requesterId: req.body.requesterId};
                        SupplyDAO.updateSupply(condition, update);
                        res.sendStatus(200);
                        global.io.emit("reload supply");
                    }
                }
            });
        }

        deleteSupply(req, res) {
            SupplyDAO.findSupplyById(req.body.supplyId).then(function(supply) {
                if (!supply) {
                    res.sendStatus(404);     // supply not exist
                } else {
                    if (req.body.ownerId !== supply.ownerId) {
                        // should not delete others' supply
                        res.sendStatus(401);
                    } else {
                        let condition = {_id: req.body.supplyId,
                            ownerId: req.body.ownerId};
                        SupplyDAO.deleteSupplyById(condition);
                        res.sendStatus(200);
                        global.io.emit("reload supply");
                    }
                }
            });
        }
    };
