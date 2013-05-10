/**
 * Project: darlingjs / GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 */

(function(darlingjs, darlingutil) {
    'use strict';

    var m = darlingjs.m('ngCyclic');

    m.$c('ngCyclic', {
        patternWidth: 0.0,
        patternHeight: 0.0
    });

    m.$s('ngCyclic3DLayer', {
        $require: ['ngCyclic', 'ng3D'],

        $addEntity: ['$entity', function($entity) {
            if ($entity.ngCyclic.patternWidth) {
                insideConfigHorizontal.minWidth = $entity.ngCyclic.patternWidth;
                $entity.$add('ngMarkIfInsideOfTheViewPortHorizontal3D', insideConfigHorizontal);
                outsideConfigHorizontal.minWidth = $entity.ngCyclic.patternWidth;
                $entity.$add('ngMarkIfOutsideOfTheViewPortHorizontal3D', outsideConfigHorizontal);
            }
            if ($entity.ngCyclic.patternHeight) {
                insideConfigVertical.minHeight = $entity.ngCyclic.patternHeight;
                $entity.$add('ngMarkIfInsideOfTheViewPortVertical3D', insideConfigVertical);
                outsideConfigVertical.minHeight = $entity.ngCyclic.patternHeight;
                $entity.$add('ngMarkIfOutsideOfTheViewPortVertical3D', outsideConfigVertical);
            }
        }]
    });

    var outsideConfigHorizontal = {
        handler: function($entity, lowerEdge, higherEdge) {
            if (lowerEdge) {
                $entity.ng3D.x += $entity.ngCyclic.patternWidth;
            } else if (higherEdge) {
                $entity.ng3D.x -= $entity.ngCyclic.patternWidth;
            }

            if (!$entity.ngMarkIfInsideOfTheViewPortHorizontal3D) {
                $entity.$add('ngMarkIfInsideOfTheViewPortHorizontal3D', insideConfigHorizontal);
            }

            $entity.$remove('ngMarkIfOutsideOfTheViewPortHorizontal3D');
        }
    };

    var outsideConfigVertical = {
        handler: function($entity, lowerEdge, higherEdge) {
            if (lowerEdge) {
                $entity.ng3D.y += $entity.ngCyclic.patternHeight;
            } else if (higherEdge) {
                $entity.ng3D.y -= $entity.ngCyclic.patternHeight;
            }

            if (!$entity.ngMarkIfInsideOfTheViewPortVertical3D) {
                $entity.$add('ngMarkIfInsideOfTheViewPortVertical3D', insideConfigVertical);
            }

            $entity.$remove('ngMarkIfOutsideOfTheViewPortVertical3D');
        }
    };

    var insideConfigHorizontal = {
        marker: {
            ngMarkIfOutsideOfTheViewPortHorizontal3D: outsideConfigHorizontal
        }
    };

    var insideConfigVertical = {
        marker: {
            ngMarkIfOutsideOfTheViewPortVertical3D: outsideConfigVertical
        }
    };

    /**
     * Mark entity by marker if it outside the ViewPort
     */
    m.$c('ngMarkIfOutsideOfTheViewPortVertical2D', {
        shift: 0.0,
        handler: null,
        marker: null,
        autoRemove: true
    });

    /**
     * Mark entity by marker if it outside the ViewPort
     */
    m.$c('ngMarkIfOutsideOfTheViewPortHorizontal2D', {
        shift: 0.0,
        handler: null,
        marker: null,
        autoRemove: true
    });

    /**
     * Mark entity by marker if it outside the ViewPort
     */
    m.$c('ngMarkIfInsideOfTheViewPortVertical2D', {
        shift: 0.0,
        handler: null,
        marker: null,
        autoRemove: true
    });

    /**
     * Mark entity by marker if it outside the ViewPort
     */
    m.$c('ngMarkIfInsideOfTheViewPortHorizontal2D', {
        shift: 0.0,
        handler: null,
        marker: null,
        autoRemove: true
    });


    /**
     * Mark entity by marker if it outside the ViewPort
     */
    m.$c('ngMarkIfOutsideOfTheViewPortVertical3D', {
        shift: 0.0,
        handler: null,
        marker: null,
        autoRemove: true
    });

    /**
     * Mark entity by marker if it outside the ViewPort
     */
    m.$c('ngMarkIfOutsideOfTheViewPortHorizontal3D', {
        shift: 0.0,
        handler: null,
        marker: null,
        autoRemove: true
    });

    /**
     * Mark entity by marker if it outside the ViewPort
     */
    m.$c('ngMarkIfInsideOfTheViewPortVertical3D', {
        shift: 0.0,
        handler: null,
        marker: null,
        autoRemove: true
    });

    /**
     * Mark entity by marker if it outside the ViewPort
     */
    m.$c('ngMarkIfInsideOfTheViewPortHorizontal3D', {
        shift: 0.0,
        handler: null,
        marker: null,
        autoRemove: true
    });

    m.$s('ngMarkIfOutsideOfTheViewPortVertical3D', {
        $require: ['ng2D', 'ngMarkIfOutsideOfTheViewPortVertical3D'],

        $update: ['$entity', 'ng2DViewPort', function($entity, ng2DViewPort) {
            var component = $entity.ngMarkIfOutsideOfTheViewPortVertical3D;
            var viewPortHeight = component.viewPortHeight || 0.5 * Math.max(ng2DViewPort.height, component.minHeight);
            component.viewPortHeight = viewPortHeight;

            outsideOf($entity,
                'ngMarkIfOutsideOfTheViewPortVertical3D',
                component,
                $entity.ng3D.y + component.shift,

                ng2DViewPort.lookAt.y,
                viewPortHeight
            );
        }]
    });

    m.$s('ngMarkIfOutsideOfTheViewPortHorizontal3D', {
        $require: ['ng2D', 'ngMarkIfOutsideOfTheViewPortHorizontal3D'],

        $update: ['$entity', 'ng2DViewPort', function($entity, ng2DViewPort) {
            var component = $entity.ngMarkIfOutsideOfTheViewPortHorizontal3D;
            var viewPortWidth = component.viewPortWidth || 0.5 * Math.max(ng2DViewPort.width, component.minWidth);
            component.viewPortWidth = viewPortWidth;

            outsideOf($entity,
                'ngMarkIfOutsideOfTheViewPortVertical3D',
                component,
                $entity.ng3D.x + component.shift,

                ng2DViewPort.lookAt.x,
                viewPortWidth
            );
        }]
    });

    m.$s('ngMarkIfInsideOfTheViewPortVertical3D', {
        $require: ['ng2D', 'ngMarkIfInsideOfTheViewPortVertical3D'],

        $update: ['$entity', 'ng2DViewPort', function($entity, ng2DViewPort) {
            var component = $entity.ngMarkIfInsideOfTheViewPortVertical3D;
            var viewPortHeight = component.viewPortHeight || 0.5 * Math.max(ng2DViewPort.height, component.minHeight);
            component.viewPortHeight = viewPortHeight;

            insideOf($entity,
                'ngMarkIfOutsideOfTheViewPortVertical',
                component,
                $entity.ng3D.y + component.shift,

                ng2DViewPort.lookAt.y,
                viewPortHeight
            );
        }]
    });

    m.$s('ngMarkIfInsideOfTheViewPortHorizontal3D', {
        $require: ['ng2D', 'ngMarkIfInsideOfTheViewPortHorizontal3D'],

        $update: ['$entity', 'ng2DViewPort', function($entity, ng2DViewPort) {
            var component = $entity.ngMarkIfInsideOfTheViewPortHorizontal3D;
            var viewPortWidth = component.viewPortWidth || 0.5 * Math.max(ng2DViewPort.width, component.minWidth);
            component.viewPortWidth = viewPortWidth;

            insideOf($entity,
                'ngMarkIfInsideOfTheViewPortHorizontal3D',
                component,
                $entity.ng3D.x + component.shift,

                ng2DViewPort.lookAt.x,
                viewPortWidth
            );
        }]
    });

    /**
     * check is $entity is outside of viewPort
     *
     * @private
     * @ignore
     *
     * @param $entity
     * @param componentName
     * @param component
     * @param componentPosition
     * @param viewPortPosition
     * @param viewPortSize
     */
    function outsideOf($entity, componentName, component, componentPosition, viewPortPosition, viewPortSize) {
        componentPosition += component.shift;

        var crossBottom = viewPortPosition + viewPortSize < componentPosition,
            crossTop = componentPosition < viewPortPosition - viewPortSize;

        if (crossTop || crossBottom) {
            var handler = component.handler;
            applyMarker($entity, component.marker);
            if (component.autoRemove) {
                $entity.$remove(componentName);
            }
            callIfHasHandler(handler, $entity, crossTop, crossBottom);
        }
    }

    /**
     * check is $entity is inside of viewPort
     *
     * @ignore
     *
     * @private
     *
     * @param $entity
     * @param componentName
     * @param component
     * @param componentPosition
     * @param viewPortPosition
     * @param viewPortSize
     */
    function insideOf($entity, componentName, component, componentPosition, viewPortPosition, viewPortSize) {
        componentPosition += component.shift;

        var crossBottom = viewPortPosition + viewPortSize >= componentPosition,
            crossTop = componentPosition >= viewPortPosition - viewPortSize;

        if (crossTop && crossBottom) {
            var handler = component.handler;
            applyMarker($entity, component.marker);
            if (component.autoRemove) {
                $entity.$remove(componentName);
            }
            callIfHasHandler(handler, $entity, crossTop, crossBottom);
        }
    }

    function callIfHasHandler(handler, $entity, lowerEdge, higherEdge) {
        if (handler) {
            handler($entity, lowerEdge, higherEdge);
        }
    }

    /**
     * apply markers from component
     *
     * @ignore
     *
     * @private
     *
     * @param $entity
     * @param marker
     */
    function applyMarker($entity, marker) {
        if (darlingutil.isString(marker)) {
            if (!$entity[marker]) {
                $entity.$add(marker);
            }
        } else if (darlingutil.isObject(marker)) {
            for (var key in marker) {
                if (!$entity[key]) {
                    $entity.$add(key, marker[key]);
                }
            }
        }
    }
})(darlingjs, darlingutil);