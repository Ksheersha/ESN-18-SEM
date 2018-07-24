let dbUtil = require('../dbUtil');
let Image = dbUtil.getModel('Image');

class ImageDAO{
    static saveImage(ImageContent,callback){
        new Image({
            content:ImageContent
        }).save(callback);
    }

    static getImageById(imageId){
        return new Promise(function(resolve, reject) {
            Image.findOne({'_id': imageId})
                .then(function(image) {
                    resolve(image);
                })
                .catch(function (err) {
                    reject(err);
                });
        });
    }
}

module.exports = ImageDAO;
