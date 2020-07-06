# Google Maps

A jQuery plugin for quickly adding maps via the Google Maps API. To add a map to an element, use the `googleMaps()` method:

~~~ javascript
$('.foo').googleMaps({
    points: [
        {
            lat: 53.3171819,
            lng: -3.4955914
        }
    ]
});
~~~

By default, the plugin will automatically load the required JavaScript API and will centre and zoom the map to show all the points. The default map type is `google.maps.mapTypeId.ROADMAP`. You can add as many points to the map as you like.

## Install

Install with npm:

    npm install --save-dev @castlegate/jquery-google-maps

## Options

`points` is an array of coordinates to display on the map. You can add multiple points and each point can have a marker, title, and information window:

~~~ javascript
$('.foo').googleMaps({
    points: [
        {
            lat: 53.3171819,
            lng: -3.4955914,
            marker: true, // show default marker
            title: 'Marker title',
            infoWindow: 'Info window content'
        },
        {
            lat: 53.9586419,
            lng: -1.1156968,
            marker: '/custom/marker/image.png' // show custom marker
        }
    ]
});
~~~

`center` sets the centre of the map to a custom location. This is optional. By default, the map will use `fitBounds()` to find the center of the map based on the points:

~~~ javascript
$('.foo').googleMaps({
    points: [], // array of points
    center: {
        lat: 53.3171819,
        lng: -3.4955914
    }
});
~~~

`zoom` sets the zoom level of the map. By default, the map will use `fitBounds()` so that all points will be visible on the map:

~~~ javascript
$('.foo').googleMaps({
    points: [], // array of points
    zoom: 12
});
~~~

`responsive` forces the map to reset its centre and zoom level when the browser window is resized. By default, this is set to `false`.

~~~ javascript
$('.foo').googleMaps({
    points: [], // array of points
    responsive: true
});
~~~

`callback` lets you do something else with the map and its data. It is a function that takes the map, the bounds, and the settings as its arguments:

~~~ javascript
$('.foo').googleMaps({
    points: [], // array of points
    callback: function(map, bounds, settings) {
        console.log(map);
    }
});
~~~

`key` sets the Google Maps API key:

~~~ javascript
$('.foo').googleMaps({
    points: [], // array of points
    key: 'unique_api_key'
});
~~~

`options` can be used to pass additional [options](https://developers.google.com/maps/documentation/javascript/reference#MapOptions) to the Google Maps object:

~~~ javascript
$('.foo').googleMaps({
    points: [], // array of points
    options: {
        fullscreenControl: true,
        scrollwheel: false
    }
});
~~~

## Commands

`$('.foo').googleMaps('redraw')` will redraw a map that has already been added to the selected element with its original settings.

`$('.foo').googleMaps('remove')` will remove a map, leaving the plugin and its settings attached to the selected element. The map can then be restored with the `redraw` command above.

`$('.foo').googleMaps('destroy')` will completely remove a map, including its settings, so that it cannot be recovered.

`$('.foo').googleMaps('instance')` will return a single instance or an array of instances for the selected element(s). This lets you manipulate the map, the bounds, or the object instance itself. For example, you can change the centre of the map via the object settings:

~~~ javascript
var instance = map.googleMaps('instance');

instance.settings.center = {
    lat: 53.9585914,
    lng: -1.1156109
};

instance.drawMap();
~~~

Alternatively, you could manipulate the Google Map itself:

~~~ javascript
var instance = map.googleMaps('instance');

instance.map.setCenter({
    lat: 53.9585914,
    lng: -1.1156109
});
~~~

## License

Copyright (c) 2019 Castlegate IT. All rights reserved.

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
