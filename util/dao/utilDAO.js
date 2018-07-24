const dbUtil = require('../dbUtil');
const Util = dbUtil.getModel('Util');

function throwOnInvalidId (utilPromise, id) {
  return utilPromise.then(util => {
    if (!util) {
      throw new Error(`Invalid util ID: ${id}`);
    }
    return util;
  });
}

class UtilDAO {
  static create (attrs) {
    let util = new Util(attrs);
    return util.save();
  }

  static getById (id) {
    return throwOnInvalidId(Util.findById(id).exec(), id);
  }

  static getByTypes (types) {
    return Util.find({type: {$in: types}}).exec();
  }

  static getByType (type) {
    return this.getByTypes([type]);
  }

  static update (id, attrs) {
    return throwOnInvalidId(Util.findByIdAndUpdate(id, attrs, {new: true}).exec(), id);
  }

  static remove (id) {
    return throwOnInvalidId(Util.findByIdAndRemove(id).exec());
  }
}

module.exports = UtilDAO;
