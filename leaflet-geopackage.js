const { GeoPackageAPI, setSqljsWasmLocateFile } = require('@ngageoint/geopackage');

const geoPackageCache = {};

function maybeDrawTile(gridLayer, tilePoint, canvas, done) {
  const geoPackage = gridLayer.geoPackage;
  const layerName = gridLayer.options.layerName;
  const map = gridLayer._map;
  if (!geoPackage) {
    // not loaded yet, just wait
    setTimeout(maybeDrawTile, 250, gridLayer, tilePoint, canvas, done);
    return;
  }
  setTimeout(function() {
    if (map.options.crs === L.CRS.EPSG4326) {
      const tileSize = gridLayer.getTileSize(),
        nwPoint = tilePoint.scaleBy(tileSize),
        sePoint = nwPoint.add(tileSize),
        nw = map.unproject(nwPoint, tilePoint.z),
        se = map.unproject(sePoint, tilePoint.z);
      geoPackage
        .projectedTile(
          layerName,
          se.lat,
          nw.lng,
          nw.lat,
          se.lng,
          tilePoint.z,
          'EPSG:4326',
          canvas.width,
          canvas.height,
          canvas,
        )
        .then(function() {
          done(null, canvas);
        });
    } else {
      geoPackage
        .xyzTile(layerName, tilePoint.x, tilePoint.y, tilePoint.z, canvas.width, canvas.height, canvas)
        .then(function() {
          done(null, canvas);
        });
    }
  }, 0);
}

L.GeoPackageTileLayer = L.GridLayer.extend({
  options: {
    layerName: '',
    geoPackageUrl: '',
    geoPackage: undefined,
    noCache: false,
    sqlJsWasmLocateFile: filename => 'https://unpkg.com/@ngageoint/geopackage@4.1.0/dist/' + filename,
  },
  initialize: function initialize(options) {
    L.GridLayer.prototype.initialize.call(this, L.setOptions(this, options));
    setSqljsWasmLocateFile(options.sqlJsWasmLocateFile || (filename => 'https://unpkg.com/@ngageoint/geopackage@4.1.0/dist/' + filename));
  },
  onAdd: function onAdd(map) {
    L.GridLayer.prototype.onAdd.call(this, map);
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const layer = this;

    if (layer.options.geoPackage) {
      layer.geoPackage = layer.options.geoPackage;
      layer.geoPackageLoaded = true;
      return;
    }

    if (!layer.options.noCache && geoPackageCache[layer.options.geoPackageUrl]) {
      console.log('GeoPackage was %s loaded, pulling from cache', layer.options.geoPackageUrl);
      layer.geoPackageLoaded = true;
      layer.geoPackage = geoPackageCache[layer.options.geoPackageUrl];
      return;
    }

    layer.geoPackageLoaded = false;
    const xhr = new XMLHttpRequest();
    xhr.open('GET', this.options.geoPackageUrl, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function(e) {
      const uInt8Array = new Uint8Array(this.response);
      GeoPackageAPI.open(uInt8Array).then(function(gp) {
        console.timeEnd('Loading GeoPackage ' + layer.options.geoPackageUrl);
        layer.geoPackageLoaded = true;
        layer.geoPackage = gp;
        geoPackageCache[layer.options.geoPackageUrl] = layer.options.noCache || gp;
      });
    };
    console.time('Loading GeoPackage ' + layer.options.geoPackageUrl);
    xhr.send();
  },
  onRemove: function onRemove(map) {
    L.GridLayer.prototype.onRemove.call(this, map);
  },
  createTile: function(tilePoint, done) {
    const canvas = L.DomUtil.create('canvas', 'leaflet-tile');
    const size = this.getTileSize();
    canvas.width = size.x;
    canvas.height = size.y;
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    maybeDrawTile(this, tilePoint, canvas, done);
    return canvas;
  },
});

L.geoPackageTileLayer = function(opts) {
  return new L.GeoPackageTileLayer(opts);
};

L.GeoPackageFeatureLayer = L.GeoJSON.extend({
  options: {
    layerName: '',
    geoPackageUrl: '',
    geoPackage: undefined,
    noCache: false,
    style: function() {
      return {
        color: '#00F',
        weight: 2,
        opacity: 1,
      };
    },
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng, {
        radius: 2,
      });
    },
    sqlJsWasmLocateFile: filename => 'https://unpkg.com/@ngageoint/geopackage@4.1.0/dist/' + filename,
  },
  initialize: function initialize(data, options) {
    L.GeoJSON.prototype.initialize.call(this, data, L.setOptions(this, options));
    setSqljsWasmLocateFile(options.sqlJsWasmLocateFile || (filename => 'https://unpkg.com/@ngageoint/geopackage@4.1.0/dist/' + filename));

  },
  onAdd: function onAdd(map) {
    L.GeoJSON.prototype.onAdd.call(this, map);
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const layer = this;

    if (layer.options.geoPackage) {
      layer.geoPackage = layer.options.geoPackage;
      layer.geoPackageLoaded = true;
      const results = layer.geoPackage.iterateGeoJSONFeatures(layer.options.layerName);
      for (let geoJson of results) {
        geoJson = {
          type: 'Feature',
          geometry: geoJson.geometry,
          id: geoJson.id,
          properties: geoJson.properties,
        };
        layer.addData(geoJson);
      }
      return;
    }

    if (!layer.options.noCache && geoPackageCache[layer.options.geoPackageUrl]) {
      console.log('GeoPackage was %s loaded, pulling from cache', layer.options.geoPackageUrl);
      layer.geoPackageLoaded = true;
      layer.geoPackage = geoPackageCache[layer.options.geoPackageUrl];
      const results = layer.geoPackage.iterateGeoJSONFeatures(layer.options.layerName);
      for (let geoJson of results) {
        geoJson = {
          type: 'Feature',
          geometry: geoJson.geometry,
          id: geoJson.id,
          properties: geoJson.properties,
        };
        layer.addData(geoJson);
      }
      return;
    }
    layer.geoPackageLoaded = false;
    const xhr = new XMLHttpRequest();
    xhr.open('GET', this.options.geoPackageUrl, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function() {
      GeoPackageAPI.open(new Uint8Array(this.response)).then(function(gp) {
        console.timeEnd('Loading GeoPackage ' + layer.options.geoPackageUrl);
        layer.geoPackageLoaded = true;
        layer.geoPackage = gp;
        geoPackageCache[layer.options.geoPackageUrl] = layer.options.noCache || gp;
        const results = layer.geoPackage.iterateGeoJSONFeatures(layer.options.layerName);
        for (let geoJson of results) {
          geoJson = {
            type: 'Feature',
            geometry: geoJson.geometry,
            id: geoJson.id,
            properties: geoJson.properties,
          };
          layer.addData(geoJson);
        }
      });
    };
    console.time('Loading GeoPackage ' + layer.options.geoPackageUrl);
    xhr.send();
  },
});

L.geoPackageFeatureLayer = function(data, opts) {
  return new L.GeoPackageFeatureLayer(data, opts);
};
