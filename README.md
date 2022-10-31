## leaflet-geopackage &mdash; Load GeoPackage layers in Leaflet

Load GeoPackage tile and feature layers in the browser without a server.  When a layer is added to the map, the GeoPackage will be downloaded and then the specified layer will be loaded on the map.

### Demo

[Sample Page](https://ngageoint.github.io/leaflet-geopackage/demo) which loads a tile layer and a feature layer from the [Natural Earth Rivers GeoPackage](http://ngageoint.github.io/GeoPackage/examples/rivers.gpkg)

Loading a feature layer:  
![](https://github.com/ngageoint/leaflet-geopackage/blob/master/examples/featurelayer.gif?raw=true)

### Installation ###

[![NPM](https://img.shields.io/npm/v/@ngageoint/leaflet-geopackage.svg)](https://www.npmjs.com/package/@ngageoint/leaflet-geopackage)

```sh
$ npm install @ngageoint/leaflet-geopackage
```

### Usage

```js
// Load the Rivers GeoPackage and display the tile layer
L.geoPackageTileLayer({
    geoPackageUrl: 'http://ngageoint.github.io/GeoPackage/examples/rivers.gpkg',
    layerName: 'rivers_tiles'
}).addTo(map);

// Load the Rivers GeoPackage and display the feature layer
L.geoPackageFeatureLayer([], {
    geoPackageUrl: 'http://ngageoint.github.io/GeoPackage/examples/rivers.gpkg',
    layerName: 'rivers'
}).addTo(map);
```

### GeoPackageTileLayer Options

GeoPackageTileLayer extends L.GridLayer and accepts all options for L.GridLayer in addition to the following:

| option           | type     |  |
|------------------|----------| -------------- |
| `geoPackageUrl`  | String   | The URL to the GeoPackage
| `layerName`      | String   | Name of the Tile Layer within the GeoPackage
| `noCache`        | Boolean  | defaults to true set false to re-download the GeoPackage even if a previous layer has already downloaded it
| `sqlJsWasmLocateFile` | Function | defaults to (filename) => 'https://unpkg.com/@ngageoint/geopackage@4.1.0/dist/' + filename. This will grab the necessary file to run GeoPackage in the browser. If you need your application to remain offline, you can set this option to <strong>(filename) => '/public/' + filename</strong> and be sure to copy the sql-wasm.wasm into your public folder.

### GeoPackageFeatureLayer Options

GeoPackageFeatureLayer extends L.GeoJSON and accepts all options for L.GeoJSON in addition to the following:

| option       | type    | |
| ------------ | ------- | -------------- |
| `geoPackageUrl`     | String  | The URL to the GeoPackage
| `layerName`   | String  | Name of the Feature Layer within the GeoPackage
| `noCache`   | Boolean  | defaults to true set false to re-download the GeoPackage even if a previous layer has already downloaded it
| `sqlJsWasmLocateFile` | Function | defaults to (filename) => 'https://unpkg.com/@ngageoint/geopackage@4.1.0/dist/' + filename. This will grab the necessary file to run GeoPackage in the browser. If you need your application to remain offline, you can set this option to <strong>(filename) => '/public/' + filename</strong> and be sure to copy the sql-wasm.wasm into your public folder.

### Browser builds

```bash
npm install
npm run build-dev # development build, used by the debug page
npm run build-min # minified production build
```

#### GeoPackage JS Library ####

The [GeoPackage Libraries](http://ngageoint.github.io/GeoPackage/) were developed at the [National Geospatial-Intelligence Agency (NGA)](http://www.nga.mil/) in collaboration with [BIT Systems](http://www.bit-sys.com/). The government has "unlimited rights" and is releasing this software to increase the impact of government investments by providing developers with the opportunity to take things in new directions. The software use, modification, and distribution rights are stipulated within the [MIT license](http://choosealicense.com/licenses/mit/).

### Pull Requests ###
If you'd like to contribute to this project, please make a pull request. We'll review the pull request and discuss the changes. All pull request contributions to this project will be released under the MIT license.

Software source code previously released under an open source license and then modified by NGA staff is considered a "joint work" (see 17 USC § 101); it is partially copyrighted, partially public domain, and as a whole is protected by the copyrights of the non-government authors and must be released according to the terms of the original open source license.


### Changelog

##### 4.1.0

- Depends on @ngageoint/geopackage v4.1.0

##### 2.0.5

- Depend on @ngageoint/geopackage v1.1.4 for 4326 support

##### 2.0.4

- Depending on @ngageoint/geopackage v1.0.15 for web worker changes

##### 2.0.3

- Fixing README

##### 2.0.2

- First release to npm
- Fix loading GeoPackage from the cache for tile layers

##### 2.0.0

- **Breaking**: Moved TileLayer from L.GridLayer.GeoPackage to L.GeoPackageTileLayer
- Added L.GeoPackageFeatureLayer

##### 1.0.0

- Initial release.
