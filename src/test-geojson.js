const kecamatan = require('geojson-indonesia/kecamatan.json')
console.log(Object.keys(kecamatan.features[0].properties))
console.log(JSON.stringify(kecamatan.features[0], null, 2))
