var ImageDAO = require('../util/dao/imageDAO');

class imageController{
    getImageById(req,res){
        let imageId = req.params.imageId;
        ImageDAO.getImageById(imageId)
            .then(function (image) {
            res.status(200).json(image);
        }).catch(function (err) {
            res.status(404).send(err);
        })
    }
}

module.exports = imageController;