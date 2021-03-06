/*! @asymmetrik/ngx-leaflet - 4.0.0 - Copyright Asymmetrik, Ltd. 2007-2018 - All Rights Reserved. + */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('leaflet')) :
    typeof define === 'function' && define.amd ? define(['exports', '@angular/core', 'leaflet'], factory) :
    (factory((global.ngxLeaflet = {}),global.ng.core,global.L));
}(this, (function (exports,core,leaflet) { 'use strict';

    var LeafletUtil = /** @class */ (function () {
        function LeafletUtil() {
        }
        LeafletUtil.mapToArray = function (map) {
            var toReturn = [];
            for (var k in map) {
                if (map.hasOwnProperty(k)) {
                    toReturn.push(map[k]);
                }
            }
            return toReturn;
        };
        LeafletUtil.handleEvent = function (zone, eventEmitter, event) {
            // Don't want to emit if there are no observers
            if (0 < eventEmitter.observers.length) {
                zone.run(function () {
                    eventEmitter.emit(event);
                });
            }
        };
        return LeafletUtil;
    }());

    var LeafletDirective = /** @class */ (function () {
        function LeafletDirective(element, zone) {
            this.element = element;
            this.zone = zone;
            this.DEFAULT_ZOOM = 1;
            this.DEFAULT_CENTER = leaflet.latLng(38.907192, -77.036871);
            this.DEFAULT_FPZ_OPTIONS = {};
            this.fitBoundsOptions = this.DEFAULT_FPZ_OPTIONS;
            this.panOptions = this.DEFAULT_FPZ_OPTIONS;
            this.zoomOptions = this.DEFAULT_FPZ_OPTIONS;
            this.zoomPanOptions = this.DEFAULT_FPZ_OPTIONS;
            // Default configuration
            this.options = {};
            // Configure callback function for the map
            this.mapReady = new core.EventEmitter();
            this.zoomChange = new core.EventEmitter();
            this.centerChange = new core.EventEmitter();
            // Mouse Map Events
            this.onClick = new core.EventEmitter();
            this.onDoubleClick = new core.EventEmitter();
            this.onMouseDown = new core.EventEmitter();
            this.onMouseUp = new core.EventEmitter();
            this.onMouseMove = new core.EventEmitter();
            this.onMouseOver = new core.EventEmitter();
            // Map Move Events
            this.onMapMove = new core.EventEmitter();
            this.onMapMoveStart = new core.EventEmitter();
            this.onMapMoveEnd = new core.EventEmitter();
            // Map Zoom Events
            this.onMapZoom = new core.EventEmitter();
            this.onMapZoomStart = new core.EventEmitter();
            this.onMapZoomEnd = new core.EventEmitter();
            // Nothing here
        }
        LeafletDirective.prototype.ngOnInit = function () {
            var _this = this;
            // Create the map outside of angular so the various map events don't trigger change detection
            this.zone.runOutsideAngular(function () {
                // Create the map with some reasonable defaults
                _this.map = leaflet.map(_this.element.nativeElement, _this.options);
                _this.addMapEventListeners();
            });
            // Only setView if there is a center/zoom
            if (null != this.center && null != this.zoom) {
                this.setView(this.center, this.zoom);
            }
            // Set up all the initial settings
            if (null != this.fitBounds) {
                this.setFitBounds(this.fitBounds);
            }
            if (null != this.maxBounds) {
                this.setMaxBounds(this.maxBounds);
            }
            if (null != this.minZoom) {
                this.setMinZoom(this.minZoom);
            }
            if (null != this.maxZoom) {
                this.setMaxZoom(this.maxZoom);
            }
            this.doResize();
            // Fire map ready event
            this.mapReady.emit(this.map);
        };
        LeafletDirective.prototype.ngOnChanges = function (changes) {
            /*
             * The following code is to address an issue with our (basic) implementation of
             * zooming and panning. From our testing, it seems that a pan operation followed
             * by a zoom operation in the same thread will interfere with eachother. The zoom
             * operation interrupts/cancels the pan, resulting in a final center point that is
             * inaccurate. The solution seems to be to either separate them with a timeout or
              * to collapse them into a setView call.
             */
            // Zooming and Panning
            if (changes['zoom'] && changes['center'] && null != this.zoom && null != this.center) {
                this.setView(changes['center'].currentValue, changes['zoom'].currentValue);
            }
            else if (changes['zoom']) {
                this.setZoom(changes['zoom'].currentValue);
            }
            else if (changes['center']) {
                this.setCenter(changes['center'].currentValue);
            }
            // Other options
            if (changes['fitBounds']) {
                this.setFitBounds(changes['fitBounds'].currentValue);
            }
            if (changes['maxBounds']) {
                this.setMaxBounds(changes['maxBounds'].currentValue);
            }
            if (changes['minZoom']) {
                this.setMinZoom(changes['minZoom'].currentValue);
            }
            if (changes['maxZoom']) {
                this.setMaxZoom(changes['maxZoom'].currentValue);
            }
        };
        LeafletDirective.prototype.getMap = function () {
            return this.map;
        };
        LeafletDirective.prototype.onResize = function () {
            this.delayResize();
        };
        LeafletDirective.prototype.addMapEventListeners = function () {
            var _this = this;
            // Add all the pass-through mouse event handlers
            this.map.on('click', function (e) { return LeafletUtil.handleEvent(_this.zone, _this.onClick, e); });
            this.map.on('dblclick', function (e) { return LeafletUtil.handleEvent(_this.zone, _this.onDoubleClick, e); });
            this.map.on('mousedown', function (e) { return LeafletUtil.handleEvent(_this.zone, _this.onMouseDown, e); });
            this.map.on('mouseup', function (e) { return LeafletUtil.handleEvent(_this.zone, _this.onMouseUp, e); });
            this.map.on('mouseover', function (e) { return LeafletUtil.handleEvent(_this.zone, _this.onMouseOver, e); });
            this.map.on('mousemove', function (e) { return LeafletUtil.handleEvent(_this.zone, _this.onMouseMove, e); });
            this.map.on('zoomstart', function (e) { return LeafletUtil.handleEvent(_this.zone, _this.onMapZoomStart, e); });
            this.map.on('zoom', function (e) { return LeafletUtil.handleEvent(_this.zone, _this.onMapZoom, e); });
            this.map.on('zoomend', function (e) { return LeafletUtil.handleEvent(_this.zone, _this.onMapZoomEnd, e); });
            this.map.on('movestart', function (e) { return LeafletUtil.handleEvent(_this.zone, _this.onMapMoveStart, e); });
            this.map.on('move', function (e) { return LeafletUtil.handleEvent(_this.zone, _this.onMapMove, e); });
            this.map.on('moveend', function (e) { return LeafletUtil.handleEvent(_this.zone, _this.onMapMoveEnd, e); });
            // Update any things for which we provide output bindings
            this.map.on('zoomend moveend', function () {
                var zoom = _this.map.getZoom();
                if (zoom !== _this.zoom) {
                    _this.zoom = zoom;
                    LeafletUtil.handleEvent(_this.zone, _this.zoomChange, zoom);
                }
                var center = _this.map.getCenter();
                if (null != center || null != _this.center) {
                    if (((null == center || null == _this.center) && center !== _this.center)
                        || (center.lat !== _this.center.lat || center.lng !== _this.center.lng)) {
                        _this.center = center;
                        LeafletUtil.handleEvent(_this.zone, _this.centerChange, center);
                    }
                }
            });
        };
        /**
         * Resize the map to fit it's parent container
         */
        LeafletDirective.prototype.doResize = function () {
            var _this = this;
            // Run this outside of angular so the map events stay outside of angular
            this.zone.runOutsideAngular(function () {
                // Invalidate the map size to trigger it to update itself
                _this.map.invalidateSize({});
            });
        };
        /**
         * Manage a delayed resize of the component
         */
        LeafletDirective.prototype.delayResize = function () {
            if (null != this.resizeTimer) {
                clearTimeout(this.resizeTimer);
            }
            this.resizeTimer = setTimeout(this.doResize.bind(this), 200);
        };
        /**
         * Set the view (center/zoom) all at once
         * @param center The new center
         * @param zoom The new zoom level
         */
        LeafletDirective.prototype.setView = function (center, zoom) {
            if (this.map && null != center && null != zoom) {
                this.map.setView(center, zoom, this.zoomPanOptions);
            }
        };
        /**
         * Set the map zoom level
         * @param zoom the new zoom level for the map
         */
        LeafletDirective.prototype.setZoom = function (zoom) {
            if (this.map && null != zoom) {
                this.map.setZoom(zoom, this.zoomOptions);
            }
        };
        /**
         * Set the center of the map
         * @param center the center point
         */
        LeafletDirective.prototype.setCenter = function (center) {
            if (this.map && null != center) {
                this.map.panTo(center, this.panOptions);
            }
        };
        /**
         * Fit the map to the bounds
         * @param latLngBounds the boundary to set
         */
        LeafletDirective.prototype.setFitBounds = function (latLngBounds) {
            if (this.map && null != latLngBounds) {
                this.map.fitBounds(latLngBounds, this.fitBoundsOptions);
            }
        };
        /**
         * Set the map's max bounds
         * @param latLngBounds the boundary to set
         */
        LeafletDirective.prototype.setMaxBounds = function (latLngBounds) {
            if (this.map && null != latLngBounds) {
                this.map.setMaxBounds(latLngBounds);
            }
        };
        /**
         * Set the map's min zoom
         * @param number the new min zoom
         */
        LeafletDirective.prototype.setMinZoom = function (zoom) {
            if (this.map && null != zoom) {
                this.map.setMinZoom(zoom);
            }
        };
        /**
         * Set the map's min zoom
         * @param number the new min zoom
         */
        LeafletDirective.prototype.setMaxZoom = function (zoom) {
            if (this.map && null != zoom) {
                this.map.setMaxZoom(zoom);
            }
        };
        LeafletDirective.decorators = [
            { type: core.Directive, args: [{
                        selector: '[leaflet]'
                    },] },
        ];
        /** @nocollapse */
        LeafletDirective.ctorParameters = function () { return [
            { type: core.ElementRef },
            { type: core.NgZone }
        ]; };
        LeafletDirective.propDecorators = {
            fitBoundsOptions: [{ type: core.Input, args: ['leafletFitBoundsOptions',] }],
            panOptions: [{ type: core.Input, args: ['leafletPanOptions',] }],
            zoomOptions: [{ type: core.Input, args: ['leafletZoomOptions',] }],
            zoomPanOptions: [{ type: core.Input, args: ['leafletZoomPanOptions',] }],
            options: [{ type: core.Input, args: ['leafletOptions',] }],
            mapReady: [{ type: core.Output, args: ['leafletMapReady',] }],
            zoom: [{ type: core.Input, args: ['leafletZoom',] }],
            zoomChange: [{ type: core.Output, args: ['leafletZoomChange',] }],
            center: [{ type: core.Input, args: ['leafletCenter',] }],
            centerChange: [{ type: core.Output, args: ['leafletCenterChange',] }],
            fitBounds: [{ type: core.Input, args: ['leafletFitBounds',] }],
            maxBounds: [{ type: core.Input, args: ['leafletMaxBounds',] }],
            minZoom: [{ type: core.Input, args: ['leafletMinZoom',] }],
            maxZoom: [{ type: core.Input, args: ['leafletMaxZoom',] }],
            onClick: [{ type: core.Output, args: ['leafletClick',] }],
            onDoubleClick: [{ type: core.Output, args: ['leafletDoubleClick',] }],
            onMouseDown: [{ type: core.Output, args: ['leafletMouseDown',] }],
            onMouseUp: [{ type: core.Output, args: ['leafletMouseUp',] }],
            onMouseMove: [{ type: core.Output, args: ['leafletMouseMove',] }],
            onMouseOver: [{ type: core.Output, args: ['leafletMouseOver',] }],
            onMapMove: [{ type: core.Output, args: ['leafletMapMove',] }],
            onMapMoveStart: [{ type: core.Output, args: ['leafletMapMoveStart',] }],
            onMapMoveEnd: [{ type: core.Output, args: ['leafletMapMoveEnd',] }],
            onMapZoom: [{ type: core.Output, args: ['leafletMapZoom',] }],
            onMapZoomStart: [{ type: core.Output, args: ['leafletMapZoomStart',] }],
            onMapZoomEnd: [{ type: core.Output, args: ['leafletMapZoomEnd',] }],
            onResize: [{ type: core.HostListener, args: ['window:resize', [],] }]
        };
        return LeafletDirective;
    }());

    var LeafletDirectiveWrapper = /** @class */ (function () {
        function LeafletDirectiveWrapper(leafletDirective) {
            this.leafletDirective = leafletDirective;
        }
        LeafletDirectiveWrapper.prototype.init = function () {
            // Nothing for now
        };
        LeafletDirectiveWrapper.prototype.getMap = function () {
            return this.leafletDirective.getMap();
        };
        return LeafletDirectiveWrapper;
    }());

    /**
     * Layer directive
     *
     * This directive is used to directly control a single map layer. The purpose of this directive is to
     * be used as part of a child structural directive of the map element.
     *
     */
    var LeafletLayerDirective = /** @class */ (function () {
        function LeafletLayerDirective(leafletDirective, zone) {
            this.zone = zone;
            // Layer Events
            this.onAdd = new core.EventEmitter();
            this.onRemove = new core.EventEmitter();
            this.leafletDirective = new LeafletDirectiveWrapper(leafletDirective);
        }
        LeafletLayerDirective.prototype.ngOnInit = function () {
            // Init the map
            this.leafletDirective.init();
        };
        LeafletLayerDirective.prototype.ngOnDestroy = function () {
            this.layer.remove();
        };
        LeafletLayerDirective.prototype.ngOnChanges = function (changes) {
            var _this = this;
            if (changes['layer']) {
                // Update the layer
                var p_1 = changes['layer'].previousValue;
                var n_1 = changes['layer'].currentValue;
                this.zone.runOutsideAngular(function () {
                    if (null != p_1) {
                        p_1.remove();
                    }
                    if (null != n_1) {
                        _this.addLayerEventListeners(n_1);
                        _this.leafletDirective.getMap().addLayer(n_1);
                    }
                });
            }
        };
        LeafletLayerDirective.prototype.addLayerEventListeners = function (l) {
            var _this = this;
            l.on('add', function (e) { return LeafletUtil.handleEvent(_this.zone, _this.onAdd, e); });
            l.on('remove', function (e) { return LeafletUtil.handleEvent(_this.zone, _this.onRemove, e); });
        };
        LeafletLayerDirective.decorators = [
            { type: core.Directive, args: [{
                        selector: '[leafletLayer]'
                    },] },
        ];
        /** @nocollapse */
        LeafletLayerDirective.ctorParameters = function () { return [
            { type: LeafletDirective },
            { type: core.NgZone }
        ]; };
        LeafletLayerDirective.propDecorators = {
            layer: [{ type: core.Input, args: ['leafletLayer',] }],
            onAdd: [{ type: core.Output, args: ['leafletLayerAdd',] }],
            onRemove: [{ type: core.Output, args: ['leafletLayerRemove',] }]
        };
        return LeafletLayerDirective;
    }());

    /**
     * Layers directive
     *
     * This directive is used to directly control map layers. As changes are made to the input array of
     * layers, the map is synched to the array. As layers are added or removed from the input array, they
     * are also added or removed from the map. The input array is treated as immutable. To detect changes,
     * you must change the array instance.
     *
     * Important Note: The input layers array is assumed to be immutable. This means you need to use an
     * immutable array implementation or create a new copy of your array when you make changes, otherwise
     * this directive won't detect the change. This is by design. It's for performance reasons. Change
     * detection of mutable arrays requires diffing the state of the array on every DoCheck cycle, which
     * is extremely expensive from a time complexity perspective.
     *
     */
    var LeafletLayersDirective = /** @class */ (function () {
        function LeafletLayersDirective(leafletDirective, differs, zone) {
            this.differs = differs;
            this.zone = zone;
            this.leafletDirective = new LeafletDirectiveWrapper(leafletDirective);
            this.layersDiffer = this.differs.find([]).create();
        }
        Object.defineProperty(LeafletLayersDirective.prototype, "layers", {
            get: function () {
                return this.layersValue;
            },
            // Set/get the layers
            set: function (v) {
                this.layersValue = v;
                // Now that we have a differ, do an immediate layer update
                this.updateLayers();
            },
            enumerable: true,
            configurable: true
        });
        LeafletLayersDirective.prototype.ngDoCheck = function () {
            this.updateLayers();
        };
        LeafletLayersDirective.prototype.ngOnInit = function () {
            // Init the map
            this.leafletDirective.init();
            // Update layers once the map is ready
            this.updateLayers();
        };
        LeafletLayersDirective.prototype.ngOnDestroy = function () {
            this.layers = [];
        };
        /**
         * Update the state of the layers.
         * We use an iterable differ to synchronize the map layers with the state of the bound layers array.
         * This is important because it allows us to react to changes to the contents of the array as well
         * as changes to the actual array instance.
         */
        LeafletLayersDirective.prototype.updateLayers = function () {
            var map = this.leafletDirective.getMap();
            if (null != map && null != this.layersDiffer) {
                var changes_1 = this.layersDiffer.diff(this.layersValue);
                if (null != changes_1) {
                    // Run outside angular to ensure layer events don't trigger change detection
                    this.zone.runOutsideAngular(function () {
                        changes_1.forEachRemovedItem(function (c) {
                            map.removeLayer(c.item);
                        });
                        changes_1.forEachAddedItem(function (c) {
                            map.addLayer(c.item);
                        });
                    });
                }
            }
        };
        LeafletLayersDirective.decorators = [
            { type: core.Directive, args: [{
                        selector: '[leafletLayers]'
                    },] },
        ];
        /** @nocollapse */
        LeafletLayersDirective.ctorParameters = function () { return [
            { type: LeafletDirective },
            { type: core.IterableDiffers },
            { type: core.NgZone }
        ]; };
        LeafletLayersDirective.propDecorators = {
            layers: [{ type: core.Input, args: ['leafletLayers',] }]
        };
        return LeafletLayersDirective;
    }());

    var LeafletControlLayersChanges = /** @class */ (function () {
        function LeafletControlLayersChanges() {
            this.layersRemoved = 0;
            this.layersChanged = 0;
            this.layersAdded = 0;
        }
        LeafletControlLayersChanges.prototype.changed = function () {
            return !(this.layersRemoved === 0 && this.layersChanged === 0 && this.layersAdded === 0);
        };
        return LeafletControlLayersChanges;
    }());

    var LeafletControlLayersWrapper = /** @class */ (function () {
        function LeafletControlLayersWrapper(zone, layersControlReady) {
            this.zone = zone;
            this.layersControlReady = layersControlReady;
        }
        LeafletControlLayersWrapper.prototype.getLayersControl = function () {
            return this.layersControl;
        };
        LeafletControlLayersWrapper.prototype.init = function (controlConfig, controlOptions) {
            var _this = this;
            var baseLayers = controlConfig.baseLayers || {};
            var overlays = controlConfig.overlays || {};
            // Create the control outside of angular to ensure events don't trigger change detection
            this.zone.runOutsideAngular(function () {
                _this.layersControl = leaflet.control.layers(baseLayers, overlays, controlOptions);
            });
            this.layersControlReady.emit(this.layersControl);
            return this.layersControl;
        };
        LeafletControlLayersWrapper.prototype.applyBaseLayerChanges = function (changes) {
            var results = new LeafletControlLayersChanges();
            if (null != this.layersControl) {
                results = this.applyChanges(changes, this.layersControl.addBaseLayer);
            }
            return results;
        };
        LeafletControlLayersWrapper.prototype.applyOverlayChanges = function (changes) {
            var results = new LeafletControlLayersChanges();
            if (null != this.layersControl) {
                results = this.applyChanges(changes, this.layersControl.addOverlay);
            }
            return results;
        };
        LeafletControlLayersWrapper.prototype.applyChanges = function (changes, addFn) {
            var _this = this;
            var results = new LeafletControlLayersChanges();
            if (null != changes) {
                // All layer management is outside angular to avoid layer events from triggering change detection
                this.zone.runOutsideAngular(function () {
                    changes.forEachChangedItem(function (c) {
                        _this.layersControl.removeLayer(c.previousValue);
                        addFn.call(_this.layersControl, c.currentValue, c.key);
                        results.layersChanged++;
                    });
                    changes.forEachRemovedItem(function (c) {
                        _this.layersControl.removeLayer(c.previousValue);
                        results.layersRemoved++;
                    });
                    changes.forEachAddedItem(function (c) {
                        addFn.call(_this.layersControl, c.currentValue, c.key);
                        results.layersAdded++;
                    });
                });
            }
            return results;
        };
        return LeafletControlLayersWrapper;
    }());

    var LeafletControlLayersConfig = /** @class */ (function () {
        function LeafletControlLayersConfig() {
            this.baseLayers = {};
            this.overlays = {};
        }
        return LeafletControlLayersConfig;
    }());

    /**
     * Layers Control
     *
     * This directive is used to configure the layers control. The input accepts an object with two
     * key-value maps of layer name -> layer. Mutable changes are detected. On changes, a differ is
     * used to determine what changed so that layers are appropriately added or removed.
     *
     * To specify which layer to show as the 'active' baselayer, you will want to add it to the map
     * using the layers directive. Otherwise, the last one it sees will be used.
     */
    var LeafletLayersControlDirective = /** @class */ (function () {
        function LeafletLayersControlDirective(leafletDirective, differs, zone) {
            this.differs = differs;
            this.zone = zone;
            this.layersControlReady = new core.EventEmitter();
            this.leafletDirective = new LeafletDirectiveWrapper(leafletDirective);
            this.controlLayers = new LeafletControlLayersWrapper(this.zone, this.layersControlReady);
            // Generate differs
            this.baseLayersDiffer = this.differs.find({}).create();
            this.overlaysDiffer = this.differs.find({}).create();
        }
        Object.defineProperty(LeafletLayersControlDirective.prototype, "layersControlConfig", {
            get: function () {
                return this.layersControlConfigValue;
            },
            set: function (v) {
                // Validation/init stuff
                if (null == v) {
                    v = new LeafletControlLayersConfig();
                }
                if (null == v.baseLayers) {
                    v.baseLayers = {};
                }
                if (null == v.overlays) {
                    v.overlays = {};
                }
                // Store the value
                this.layersControlConfigValue = v;
                // Update the map
                this.updateLayers();
            },
            enumerable: true,
            configurable: true
        });
        LeafletLayersControlDirective.prototype.ngOnInit = function () {
            var _this = this;
            // Init the map
            this.leafletDirective.init();
            // Set up control outside of angular to avoid change detection when using the control
            this.zone.runOutsideAngular(function () {
                // Set up all the initial settings
                _this.controlLayers
                    .init({}, _this.layersControlOptions)
                    .addTo(_this.leafletDirective.getMap());
            });
            this.updateLayers();
        };
        LeafletLayersControlDirective.prototype.ngOnDestroy = function () {
            this.layersControlConfig = { baseLayers: {}, overlays: {} };
            this.controlLayers.getLayersControl().remove();
        };
        LeafletLayersControlDirective.prototype.ngDoCheck = function () {
            this.updateLayers();
        };
        LeafletLayersControlDirective.prototype.updateLayers = function () {
            var map = this.leafletDirective.getMap();
            var layersControl = this.controlLayers.getLayersControl();
            if (null != map && null != layersControl) {
                // Run the baselayers differ
                if (null != this.baseLayersDiffer && null != this.layersControlConfigValue.baseLayers) {
                    var changes = this.baseLayersDiffer.diff(this.layersControlConfigValue.baseLayers);
                    this.controlLayers.applyBaseLayerChanges(changes);
                }
                // Run the overlays differ
                if (null != this.overlaysDiffer && null != this.layersControlConfigValue.overlays) {
                    var changes = this.overlaysDiffer.diff(this.layersControlConfigValue.overlays);
                    this.controlLayers.applyOverlayChanges(changes);
                }
            }
        };
        LeafletLayersControlDirective.decorators = [
            { type: core.Directive, args: [{
                        selector: '[leafletLayersControl]'
                    },] },
        ];
        /** @nocollapse */
        LeafletLayersControlDirective.ctorParameters = function () { return [
            { type: LeafletDirective },
            { type: core.KeyValueDiffers },
            { type: core.NgZone }
        ]; };
        LeafletLayersControlDirective.propDecorators = {
            layersControlConfig: [{ type: core.Input, args: ['leafletLayersControl',] }],
            layersControlOptions: [{ type: core.Input, args: ['leafletLayersControlOptions',] }],
            layersControlReady: [{ type: core.Output, args: ['leafletLayersControlReady',] }]
        };
        return LeafletLayersControlDirective;
    }());

    /**
     * Baselayers directive
     *
     * This directive is provided as a convenient way to add baselayers to the map. The input accepts
     * a key-value map of layer name -> layer. Mutable changed are detected. On changes, a differ is
     * used to determine what changed so that layers are appropriately added or removed. This directive
     * will also add the layers control so users can switch between available base layers.
     *
     * To specify which layer to show as the 'active' baselayer, you will want to add it to the map
     * using the layers directive. Otherwise, the plugin will use the last one it sees.
     */
    var LeafletBaseLayersDirective = /** @class */ (function () {
        function LeafletBaseLayersDirective(leafletDirective, differs, zone) {
            this.differs = differs;
            this.zone = zone;
            // Output for once the layers control is ready
            this.layersControlReady = new core.EventEmitter();
            this.leafletDirective = new LeafletDirectiveWrapper(leafletDirective);
            this.controlLayers = new LeafletControlLayersWrapper(this.zone, this.layersControlReady);
            this.baseLayersDiffer = this.differs.find({}).create();
        }
        Object.defineProperty(LeafletBaseLayersDirective.prototype, "baseLayers", {
            get: function () {
                return this.baseLayersValue;
            },
            // Set/get baseLayers
            set: function (v) {
                this.baseLayersValue = v;
                this.updateBaseLayers();
            },
            enumerable: true,
            configurable: true
        });
        LeafletBaseLayersDirective.prototype.ngOnDestroy = function () {
            this.baseLayers = {};
            this.controlLayers.getLayersControl().remove();
        };
        LeafletBaseLayersDirective.prototype.ngOnInit = function () {
            var _this = this;
            // Init the map
            this.leafletDirective.init();
            // Create the control outside angular to prevent events from triggering chnage detection
            this.zone.runOutsideAngular(function () {
                // Initially configure the controlLayers
                _this.controlLayers
                    .init({}, _this.layersControlOptions)
                    .addTo(_this.leafletDirective.getMap());
            });
            this.updateBaseLayers();
        };
        LeafletBaseLayersDirective.prototype.ngDoCheck = function () {
            this.updateBaseLayers();
        };
        LeafletBaseLayersDirective.prototype.updateBaseLayers = function () {
            var map = this.leafletDirective.getMap();
            var layersControl = this.controlLayers.getLayersControl();
            if (null != map && null != layersControl && null != this.baseLayersDiffer) {
                var changes = this.baseLayersDiffer.diff(this.baseLayersValue);
                var results = this.controlLayers.applyBaseLayerChanges(changes);
                if (results.changed()) {
                    this.syncBaseLayer();
                }
            }
        };
        /**
         * Check the current base layer and change it to the new one if necessary
         */
        LeafletBaseLayersDirective.prototype.syncBaseLayer = function () {
            var _this = this;
            var map = this.leafletDirective.getMap();
            var layers = LeafletUtil.mapToArray(this.baseLayers);
            var foundLayer;
            // Search all the layers in the map to see if we can find them in the baselayer array
            map.eachLayer(function (l) {
                foundLayer = layers.find(function (bl) { return (l === bl); });
            });
            // Did we find the layer?
            if (null != foundLayer) {
                // Yes - set the baselayer to the one we found
                this.baseLayer = foundLayer;
            }
            else {
                // No - set the baselayer to the first in the array and add it to the map
                if (layers.length > 0) {
                    this.baseLayer = layers[0];
                    // Add layers outside of angular to prevent events from triggering change detection
                    this.zone.runOutsideAngular(function () {
                        _this.baseLayer.addTo(map);
                    });
                }
            }
        };
        LeafletBaseLayersDirective.decorators = [
            { type: core.Directive, args: [{
                        selector: '[leafletBaseLayers]'
                    },] },
        ];
        /** @nocollapse */
        LeafletBaseLayersDirective.ctorParameters = function () { return [
            { type: LeafletDirective },
            { type: core.KeyValueDiffers },
            { type: core.NgZone }
        ]; };
        LeafletBaseLayersDirective.propDecorators = {
            baseLayers: [{ type: core.Input, args: ['leafletBaseLayers',] }],
            layersControlOptions: [{ type: core.Input, args: ['leafletLayersControlOptions',] }],
            layersControlReady: [{ type: core.Output, args: ['leafletLayersControlReady',] }]
        };
        return LeafletBaseLayersDirective;
    }());

    var LeafletModule = /** @class */ (function () {
        function LeafletModule() {
        }
        LeafletModule.forRoot = function () {
            return { ngModule: LeafletModule, providers: [] };
        };
        LeafletModule.decorators = [
            { type: core.NgModule, args: [{
                        exports: [
                            LeafletDirective,
                            LeafletLayerDirective,
                            LeafletLayersDirective,
                            LeafletLayersControlDirective,
                            LeafletBaseLayersDirective
                        ],
                        declarations: [
                            LeafletDirective,
                            LeafletLayerDirective,
                            LeafletLayersDirective,
                            LeafletLayersControlDirective,
                            LeafletBaseLayersDirective
                        ]
                    },] },
        ];
        return LeafletModule;
    }());

    var LeafletTileLayerDefinition = /** @class */ (function () {
        function LeafletTileLayerDefinition(type, url, options) {
            this.type = type;
            this.url = url;
            this.options = options;
        }
        /**
         * Creates a TileLayer from the provided definition. This is a convenience function
         * to help with generating layers from objects.
         *
         * @param layerDef The layer to create
         * @returns {TileLayer} The TileLayer that has been created
         */
        LeafletTileLayerDefinition.createTileLayer = function (layerDef) {
            var layer;
            switch (layerDef.type) {
                case 'xyz':
                    layer = leaflet.tileLayer(layerDef.url, layerDef.options);
                    break;
                case 'wms':
                default:
                    layer = leaflet.tileLayer.wms(layerDef.url, layerDef.options);
                    break;
            }
            return layer;
        };
        /**
         * Creates a TileLayer for each key in the incoming map. This is a convenience function
         * for generating an associative array of layers from an associative array of objects
         *
         * @param layerDefs A map of key to tile layer definition
         * @returns {{[p: string]: TileLayer}} A new map of key to TileLayer
         */
        LeafletTileLayerDefinition.createTileLayers = function (layerDefs) {
            var layers = {};
            for (var k in layerDefs) {
                if (layerDefs.hasOwnProperty(k)) {
                    layers[k] = (LeafletTileLayerDefinition.createTileLayer(layerDefs[k]));
                }
            }
            return layers;
        };
        /**
         * Create a Tile Layer from the current state of this object
         *
         * @returns {TileLayer} A new TileLayer
         */
        LeafletTileLayerDefinition.prototype.createTileLayer = function () {
            return LeafletTileLayerDefinition.createTileLayer(this);
        };
        return LeafletTileLayerDefinition;
    }());

    exports.LeafletModule = LeafletModule;
    exports.LeafletDirective = LeafletDirective;
    exports.LeafletDirectiveWrapper = LeafletDirectiveWrapper;
    exports.LeafletTileLayerDefinition = LeafletTileLayerDefinition;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=ngx-leaflet.js.map
