/**
 * jQuery Mapify v1.1
 * http://github.com/castlegateit/jquery-mapify
 *
 * Copyright (c) 2016 Castlegate IT
 * http://www.castlegateit.co.uk/
 *
 * Released under the MIT License
 * http://www.opensource.org/licenses/MIT
 */
;(function($, window, document, undefined) {
    'use strict';

    // Name and default settings
    var pluginName = 'mapify';
    var defaults = {
        points: [],
        type: 'roadmap',
        center: false,
        zoom: false,
        responsive: false,
        callback: false
    };

    // Map public commands to methods
    var commands = {
        redraw: 'drawMap',
        remove: 'removeMap',
        destroy: 'destroyMap'
    };

    // Has the window finished resizing?
    var resizeDone = false;

    // Constructor
    var Plugin = function(element, options) {
        this.element = element;
        this.settings = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;

        // Initialization
        this.init();
    };

    // Static property used to store whether the API has been loaded
    Plugin.googleLoaded = false;

    // Static method to check if the Google Maps API is ready
    Plugin.googleReady = function() {
        return typeof google !== 'undefined';
    };

    // Static method to wait for a condition to be met before doing something
    Plugin.until = function(condition, callback, time, stop) {
        if (condition()) {
            return callback();
        }

        time = time || 100;
        stop = stop || false;

        var interval = setInterval(function() {
            if (condition()) {
                callback();
                clearInterval(interval);
            }
        }, time);

        if (stop) {
            var timeout = setTimeout(function() {
                clearInterval(interval);
            }, stop);
        }
    };

    // Static method to load Google Maps API
    Plugin.getGoogleMaps = function(callback) {
        if (this.googleReady()) {
            return callback();
        }

        if (!this.googleLoaded) {
            $.getScript('//maps.google.com/maps/api/js');
            this.googleLoaded = true;
        }

        this.until(this.googleReady, callback, 50, 4000);
    };

    // Initialization
    Plugin.prototype.init = function() {

        // Save original styles so they can be restored later
        this._style = $(this.element).attr('style');

        // Draw map
        this.drawMap();
    };

    // Return a valid map type based on a string or a map type ID. If an invalid
    // map type is supplied, return the default ROADMAP type.
    Plugin.prototype.mapType = function() {
        var key = this.settings.type;
        var types = google.maps.MapTypeId;

        // If string is an array key, check for key in array of types
        if (types.hasOwnProperty(key)) {
            return types[key];
        }

        // If string is an array value, check for value in array of types
        for (var type in types) {
            if (types[type] === key) {
                return key;
            }
        }

        // Return default type
        return types.ROADMAP;
    };

    // Add point to map
    Plugin.prototype.addPoint = function(point) {
        var _this = this;
        var position;
        var marker;
        var infoWindow;

        // Each point must have a latitude and longitude.
        if (!point.lat || !point.lng) {
            return false;
        }

        // Set position
        position = new google.maps.LatLng({
            lat: point.lat,
            lng: point.lng
        });

        // Extend bounds
        _this.bounds.extend(position);

        // If there is no marker, there is nothing more to do here
        if (!point.marker) {
            return;
        }

        // Add marker
        marker = new google.maps.Marker({
            map: _this.map,
            position: position
        });

        // If the marker option is a string, assume it is a custom image
        if ($.type(marker) === 'string') {
            marker.setIcon(point.marker);
        }

        // Add title
        if (point.title) {
            marker.setTitle(point.title);
        }

        // Add information window
        if (point.infoWindow) {
            infoWindow = new google.maps.InfoWindow({
                content: point.infoWindow
            });

            marker.addListener('click', function() {
                infoWindow.open(_this.map, marker);
            });
        }
    };

    // Set map position and zoom
    Plugin.prototype.resetBounds = function() {
        var _this = this;
        var center = this.settings.center;
        var zoom = this.settings.zoom;

        // Fit bounds
        _this.map.fitBounds(_this.bounds);

        // Set center
        if (center.lat && center.lng) {
            _this.map.addListener('bounds_changed', function() {
                _this.map.setCenter(center);
            });
        }

        // Set zoom. The bounds_changed event is also triggered by the user
        // manually changing the zoom level, so this should only run once.
        if (zoom) {
            _this.map.addListener('bounds_changed', function() {
                if (_this._zoomSet) {
                    return;
                }

                _this.map.setZoom(zoom);
                _this._zoomSet = true;
            });
        }
    };

    // Draw map
    Plugin.prototype.drawMap = function() {
        var _this = this;

        // Create map and bounds
        _this.map = new google.maps.Map(_this.element, {
            mapTypeId: _this.mapType()
        });
        _this.bounds = new google.maps.LatLngBounds();

        // Add points to map
        $.each(_this.settings.points, function(i, point) {
            _this.addPoint(point);
        });

        // Set map position and zoom based on points and settings
        _this.resetBounds();

        // Reset position and zoom for responsive maps
        if (_this.settings.responsive) {
            $(window).on('resizeDone', function() {
                _this._zoomSet = false;
                _this.resetBounds();
            });
        }

        // Run callback
        if (_this.settings.callback) {
            _this.settings.callback(_this.map, _this.bounds, _this.settings);
        }
    };

    // Remove map, keeping the instance for future use
    Plugin.prototype.removeMap = function() {
        $(this.element).empty().attr('style', this._style);
    };

    // Destroy map, removing the instance completely
    Plugin.prototype.destroyMap = function() {
        this.removeMap();
        $.removeData(this.element, pluginName);
    };

    // Add method to jQuery
    $.fn[pluginName] = function(options) {
        var _this = this;
        var instances = [];

        // Provide direct access to mapify instances
        if (options === 'instance') {
            _this.each(function() {
                instances.push($.data(this, pluginName));
            });

            // Only return an array if there is more than one instance
            if (instances.length === 1) {
                return instances[0];
            }

            return instances;
        }

        // Make sure Google Maps API is available before doing anything
        Plugin.getGoogleMaps(function() {
            _this.each(function() {
                var instance = $.data(this, pluginName);

                // Identify named command, check for an existing instance of the
                // class, and check the command exists.
                if ($.type(options) === 'string') {
                    if (
                        typeof instance === 'undefined' ||
                        typeof commands[options] === 'undefined'
                    ) {
                        return false;
                    }

                    // Run named command
                    return instance[commands[options]]();
                }

                // Make sure there is only one instance per element
                if (!$.data(this, pluginName)) {
                    $.data(this, pluginName, new Plugin(this, options));
                }
            });
        });

        return _this;
    };

    // Trigger resizeDone event when window resize complete
    $(window).on('resize', function() {
        clearTimeout(resizeDone);

        resizeDone = setTimeout(function() {
            $(window).trigger('resizeDone');
        }, 100);
    });
})(jQuery, window, document);
