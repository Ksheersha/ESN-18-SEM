class ControllerUtil {
  static validateGeoJSON(geoJson) {
    if (geoJson && geoJson.coordinates && geoJson.coordinates.length === 2) {
      if (geoJson.coordinates[0] && geoJson.coordinates[1]) {
        return true;
      }
    }
    return false;
  }
}

module.exports = ControllerUtil;