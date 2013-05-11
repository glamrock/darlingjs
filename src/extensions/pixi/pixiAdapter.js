/**
 * Project: GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 */

(function(darlingjs, darlingutil) {

    'use strict';
    var m = darlingjs.module('ngPixijsAdapter');

    /**
     * Tiled marker
     */
    m.$c('ngTiledSprite', {});

    /**
     * @TODO !!!
     */
    m.$s('ngPixijsTiledSprite', {
        $require: ['ng2D', 'ngSprite', 'ngSimpleSprite'],

        $addEntity: []
    });

    m.$c('ngPixijsSprite', {
        sprite: null
    });

    m.$c('ngBindLifeToAlpha', {
        min: 0.0,
        max: 1.0
    });

    m.$s('ngBindLifeToAlpha', {
        $require: ['ngBindLifeToAlpha', 'ngLife', 'ngPixijsSprite'],

        $update: ['$entity', function($entity) {
            var sprite = $entity.ngPixijsSprite.sprite;
            sprite.alpha = $entity.ngBindLifeToAlpha.min + $entity.ngLife.life * ($entity.ngBindLifeToAlpha.max - $entity.ngBindLifeToAlpha.min);
        }]
    });

    m.$s('ngLayer', {
        layerName: null
    });

    m.$s('ngPixijsStaticZ', {
        $require: ['ngLayer', 'ngPixijsSprite'],

        //layers with fixed distance. Use for applying z-depth
        layers: null,
        _layers: {},

        $added: ['ngPixijsStage', function(ngPixijsStage) {
            if (this.layers) {
                for (var i = 0, count = this.layers.length; i < count; i++) {
                    var layerName = this.layers[i];
                    var layer = new PIXI.DisplayObjectContainer();
                    ngPixijsStage._stage.addChild(layer);
                    this._layers[layerName] = layer;
                }
            }
        }],

        $addEntity: ['$entity', function($entity) {
            this.addChildAt($entity.ngLayer.layerName, $entity.ngPixijsSprite.sprite);
        }],

        $removeEntity: ['$entity', 'ngPixijsStage', function($entity, ngPixijsStage) {
            if ($entity.ngPixijsSprite.sprite) {
                ngPixijsStage._stage.addChild($entity.ngPixijsSprite.sprite);
            }
        }],

        addChildAt: function(layerName, sprite) {
            var layer = this._layers[layerName];
            layer.addChild(sprite);
        }
    });

    m.$c('ngSprite', {
        name: null,
        spriteSheetUrl: null,
        fitToSize: false,
        anchor: {
            x: 0.5,
            y: 0.5
        },
        layerName: null
    });

    m.$s('ngPixijsUpdateCycle_FullCycleInOne', {
        $require: ['ngSprite'],

        $addEntity: ['ngPixijsStage', 'ngPixijsStaticZ', '$entity', function(ngPixijsStage, ngPixijsStaticZ, $entity) {
            var state = $entity.ngSprite;
            if (state.spriteSheetUrl) {
                if (isLoaded(state.spriteSheetUrl)) {
                    handler();
                } else {
                    loadAtlas(state.spriteSheetUrl)
                        .then(handler);
                }
            }

            function handler() {
                buildSprite(state);
                fitToSize(state, $entity.ng2DSize);
                //hide sprite before update phase
                state._sprite.position.x = -1048576;
                state._sprite.position.y = -1048576;
                if (state.layerName) {
                    ngPixijsStaticZ.addChildAt(state.layerName, state._sprite);
                } else {
                    ngPixijsStage.addChild(state._sprite);
                }
                $entity.$add('ngPixijsSprite', {
                    sprite: state._sprite
                });
            }
        }],

        $removeEntity: ['ngPixijsStage', '$entity', function(ngPixijsStage, $entity) {
            var state = $entity.ngSprite;
            ngPixijsStage.removeChild(state._sprite);
            state._texture = null;
            state._sprite = null;
        }]
    });

    /**
     * TODO: integrate with ngPixijsUpdateCycle_FullCycleInOne
     */
    m.$s('ngPixijsMovieClip', {
        $require: ['ng2D', 'ngMovieClip'],

        _frames: null,

        $addEntity: function($entity) {
            var spriteAtlas = $entity.ngMovieClip;
            var self = this;
            loadAtlas(spriteAtlas.url)
                .then(function() {
                    var frameNames = spriteAtlas.frames;

                    var frames = [];
                    if (self._frames !== null) {
                        frames = self._frames;
                    } else {
                        for (var i = 0, l = frameNames.length; i < l; i++) {
                            frames.push(PIXI.Texture.fromFrame(frameNames[i]));
                        }
                        self._frames = frames;
                    }

                    var movieClip = new PIXI.MovieClip(frames);
                    movieClip.gotoAndPlay(1);

                    if (spriteAtlas.anchor) {
                        movieClip.anchor.x = spriteAtlas.anchor.x || 0.5;
                        movieClip.anchor.y = spriteAtlas.anchor.y || 0.5;
                    } else {
                        movieClip.anchor.x = 0.5;
                        movieClip.anchor.y = 0.5;
                    }

                    var ng2DSize = $entity.ng2DSize;

                    if (ng2DSize && spriteAtlas.fitToSize) {
                        movieClip.width = ng2DSize.width;
                        movieClip.height = ng2DSize.height;
                    }

                    $entity.$add('ngPixijsSprite', {
                        sprite: movieClip,
                        fitToSize: spriteAtlas.fitToSize
                    });
                });
        }
    });

    m.$s('ngPixijsUpdateCycle', {
        $require: ['ng2D', 'ngPixijsSprite'],

//        $addEntity: ['ngPixijsStage', '$entity', function(ngPixijsStage, $entity) {
//            if (!$entity.ngPixijsSprite.sprite.parent) {
//                ngPixijsStage.addChild($entity.ngPixijsSprite.sprite);
//            }
//        }],

        $removeEntity: ['ngPixijsStage', '$entity', function(ngPixijsStage, $entity) {
//            ngPixijsStage.removeChild($entity.ngPixijsSprite.sprite);
            $entity.ngPixijsSprite.sprite = null;
        }],

        $update: ['$entity', 'ng2DViewPort', 'ngPixijsStage', function($entity, ng2DViewPort, ngPixijsStage) {
            var state = $entity.ngPixijsSprite;

            var ng2D = $entity.ng2D;

            state.sprite.position.x = ng2D.x + ngPixijsStage._center.x;
            state.sprite.position.y = ng2D.y + ngPixijsStage._center.y;

            state.sprite.position.x -= ng2DViewPort.lookAt.x;
            state.sprite.position.y -= ng2DViewPort.lookAt.y;
        }]
    });

    m.$s('ngPixijsViewPortUpdateCycle', {
        $require: ['ngPixijsSprite', 'ngLockViewPort'],

        $update: ['$entity', 'ng2DViewPort', function($entity, ng2DViewPort) {
            var state = $entity.ngPixijsSprite;
            if ($entity.ngLockViewPort.lockX) {
                state.sprite.position.x += ng2DViewPort.lookAt.x;
            }

            if ($entity.ngLockViewPort.lockY) {
                state.sprite.position.y += ng2DViewPort.lookAt.y;
            }
        }]
    });

    /**
     * System perform rotation of sprite
     */
    m.$s('ngPixijsRotationUpdateCycle', {
        $require: ['ngPixijsSprite', 'ng2DRotation'],

        $update: ['$entity', function($entity) {
            $entity.ngPixijsSprite.sprite.rotation = $entity.ng2DRotation.rotation;
        }]
    });

    m.$c('ngFitToSize');

    /**
     * System perform rescale to 2d size of entity
     */
    m.$s('ngPixijsScaleUpdateCycle', {
        $require: ['ngPixijsSprite', 'ng2DSize', 'ngFitToSize'],

        $update: ['$entity', function($entity) {
            var state = $entity.ngPixijsSprite;
            var ng2DSize = $entity.ng2DSize;

            state.sprite.scale.x = ng2DSize.width / state.sprite.width;
            state.sprite.scale.y = ng2DSize.height / state.sprite.height;
        }]
    });

    m.$s('ngPixijsStage', {
        //$require: ['ng2D', 'ngPixijsSprite'],

        width: 640,
        height: 480,

        shiftX: 0.0,
        shiftY: 0.0,

        domId: '',

        useWebGL: true,

        _stage: null,
        _center: {x:0.0, y:0.0},

        $added: function() {
            // create an new instance of a pixi stage
            this._stage = new PIXI.Stage(0x0);

            // create a renderer instance.
            var width, height;
            var view;
            if (this.domId !== null && this.domId !== '') {
                view = darlingutil.placeCanvasInStack(this.domId, this.width, this.height);
                width = view.width;
                height = view.height;
            } else {
                width = this.width;
                height = this.height;
            }

            this._center.x = 0.5 * this.width;
            this._center.y = 0.5 * this.height;

            if (this.useWebGL) {
                this._renderer = PIXI.autoDetectRenderer(width, height, view);
            } else {
                this._renderer = new PIXI.CanvasRenderer(width, height, view);
            }

            // add the renderer view element to the DOM
            if (!darlingutil.isDefined(view)) {
                document.body.appendChild(this._renderer.view);
            }
        },

        $removed: function() {
            document.removeChild(this._renderer.view);
        },

        addChild: function(child) {
            this._stage.addChild(child);
        },

        removeChild: function(child) {
            if (!child) {
                return;
            }
            var parent = child.parent;
            if (!parent) {
                return;
            }

            parent.removeChild(child);
        },

        $afterUpdate: function() {
            //$entities.forEach(this.$updateNode);
            // render the stage
            this._renderer.render(this._stage);
        }
    });


    var _loaders = [];
    var _loadersPromises = {};
    var _loaded = {};

    function isLoaded(url) {
        return _loaded[url];
    }

    function loadAtlas(url) {
        var promise = _loadersPromises[url];

        if (promise) {
            return promise;
        }

        var deferred = Q.defer();
        if (_loaded[url]) {
            setTimeout(function() {
                deferred.resolve();
            }, 0);
            return;
        }

        var loader = new PIXI.AssetLoader([url]);
        _loaders.push(loader);
        loader.onComplete = function() {
            var index = _loaders.indexOf(loader);
            _loaders.splice(index, 1);
            _loaded[url] = true;
            deferred.resolve(loader);
        };
        loader.load();
        _loadersPromises[url] = deferred.promise;
        return deferred.promise;
    }

    function buildSprite(state) {
        // create a texture from an image path
        state._texture = PIXI.Texture.fromImage(state.name);

        // create a new Sprite using the texture
        var sprite = state._sprite = new PIXI.Sprite(state._texture);

        // center the sprites anchor point
        sprite.anchor.x = state.anchor.x;
        sprite.anchor.y = state.anchor.y;

        return sprite;
    }

    function fitToSize(state, ng2DSize) {
        var sprite = state._sprite;
        if(ng2DSize && state.fitToSize) {
            if (state._texture.baseTexture.hasLoaded) {
                sprite.width = ng2DSize.width;
                sprite.height = ng2DSize.height;
            } else {
                state._texture.addEventListener( 'update', function() {
                    sprite.width = ng2DSize.width;
                    sprite.height = ng2DSize.height;
                });
            }
        }
    }

})(darlingjs, darlingutil);