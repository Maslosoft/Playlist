(function() {
  var objectKeys;

  if (!this.Maslosoft) {
    this.Maslosoft = {};
  }

  if (!this.Maslosoft.Sugar) {
    this.Maslosoft.Sugar = {};
  }

  if (Object.keys) {
    objectKeys = Object.keys;
  } else {
    objectKeys = (function() {
      'use strict';
      var dontEnums, dontEnumsLength, hasDontEnumBug, hasOwnProperty;
      hasOwnProperty = Object.prototype.hasOwnProperty;
      hasDontEnumBug = !{
        toString: null
      }.propertyIsEnumerable('toString');
      dontEnums = ['toString', 'toLocaleString', 'valueOf', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'constructor'];
      dontEnumsLength = dontEnums.length;
      return function(obj) {
        var i, prop, result;
        if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
          throw new TypeError('Object.keys called on non-object');
        }
        result = [];
        prop = void 0;
        i = void 0;
        for (prop in obj) {
          prop = prop;
          if (hasOwnProperty.call(obj, prop)) {
            result.push(prop);
          }
        }
        if (hasDontEnumBug) {
          i = 0;
          while (i < dontEnumsLength) {
            if (hasOwnProperty.call(obj, dontEnums[i])) {
              result.push(dontEnums[i]);
            }
            i++;
          }
        }
        return result;
      };
    })();
  }

  this.Maslosoft.Sugar.abstract = function() {
    throw new Error('This method is abstract');
  };

  this.Maslosoft.Sugar.implement = function(parent, interfaceClass) {
    var check;
    check = function() {
      var index, name, ref, results;
      ref = objectKeys(interfaceClass.prototype);
      results = [];
      for (index in ref) {
        name = ref[index];
        if (typeof interfaceClass.prototype[name] === 'function') {
          if (typeof parent.prototype[name] !== 'function') {
            throw new Error("Class " + parent.name + " implementing " + interfaceClass.name + " must have " + name + " method");
          } else {
            results.push(void 0);
          }
        } else {
          results.push(void 0);
        }
      }
      return results;
    };
    return setTimeout(check, 0);
  };

  this.Maslosoft.Sugar.mixin = function(parent, trait) {
    var index, name, parentName, ref, results;
    parentName = parent.name;
    ref = objectKeys(trait.prototype);
    results = [];
    for (index in ref) {
      name = ref[index];
      results.push(parent.prototype[name] = trait.prototype[name]);
    }
    return results;
  };

}).call(this);

//# sourceMappingURL=sugar.js.map

(function() {
  var abstract, implement, isArray, isFunction, mixin, parseQueryString,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  mixin = Maslosoft.Sugar.mixin;

  implement = Maslosoft.Sugar.implement;

  abstract = Maslosoft.Sugar.abstract;

  parseQueryString = function(queryString) {
    var i, part, query, result;
    query = queryString.split('&');
    result = {};
    i = 0;
    while (i < query.length) {
      part = query[i].split('=', 2);
      if (part.length === 1) {
        result[part[0]] = '';
      } else {
        result[part[0]] = decodeURIComponent(part[1].replace(/\+/g, ' '));
      }
      ++i;
    }
    return result;
  };

  isFunction = function(obj) {
    return !!(obj && obj.constructor && obj.call && obj.apply);
  };

  isArray = function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  if (!this.Maslosoft) {
    this.Maslosoft = {};
  }

  this.Maslosoft.Playlist = (function() {
    var frameTemplate;

    Playlist.idCounter = 0;

    frameTemplate = '<iframe src="" frameborder="" webkitAllowFullScreen mozallowfullscreen allowFullScreen scrolling="no" allowtransparency="true"></iframe>';

    Playlist.prototype.id = '';

    Playlist.prototype.frameId = '';

    Playlist.prototype.element = null;

    Playlist.prototype.links = null;

    Playlist.prototype.adapters = [];

    Playlist.prototype.extractor = null;

    function Playlist(element, options) {
      if (options == null) {
        options = null;
      }
      this.options = new Maslosoft.Playlist.Options(options);
      this.adapters = this.options.adapters;
      this.extractor = new this.options.extractor;
      this.element = jQuery(element);
      if (this.element.id) {
        this.id = this.element.id;
      } else {
        this.id = 'maslosoftPlaylist' + Playlist.idCounter++;
        this.element.prop('id', this.id);
      }
      this.frameId = this.id + "Frame";
      this.build();
    }

    Playlist.prototype.build = function() {
      var ad, adapter, currentLink, first, initScroller, j, k, len, len1, link, linkElement, links, playlistHolder, playlistWrapper, ref, src;
      links = this.extractor.getData(this.element);
      this.element.html("<div class='maslosoft-video-embed-wrapper'> <div class='maslosoft-video-embed-container'> " + frameTemplate + " </div> </div>");
      this.playlist = jQuery('<div class="maslosoft-video-playlist" />');
      this.frame = this.element.find('iframe');
      this.frame.prop('id', this.frameId);
      first = true;
      for (j = 0, len = links.length; j < len; j++) {
        link = links[j];
        ref = this.adapters;
        for (k = 0, len1 = ref.length; k < len1; k++) {
          adapter = ref[k];
          if (adapter.match(link.url)) {
            ad = new adapter;
            ad.setUrl(link.url);
            ad.setTitle(link.title);
            linkElement = this.createLink(ad);
            if (first) {
              currentLink = linkElement;
              this.current = ad;
              src = ad.getSrc(this.frame);
              if (src) {
                this.frame.prop('src', src);
              }
              this.frame.one('load', (function(_this) {
                return function(e) {
                  return ad.onEnd(_this.frame, function() {
                    return _this.next(currentLink);
                  });
                };
              })(this));
              linkElement.addClass('active');
              first = false;
            }
          }
        }
      }
      playlistWrapper = jQuery('<div class="maslosoft-video-playlist-wrapper"></div>');
      playlistHolder = jQuery('<div class="maslosoft-video-playlist-holder"></div>');
      playlistHolder.append(this.playlist);
      playlistWrapper.append(playlistHolder);
      this.element.append(playlistWrapper);
      this.links = this.playlist.find('a');
      if (this.links.length === 1) {
        this.element.find('.maslosoft-video-playlist-wrapper').remove();
        this.element.find('.maslosoft-video-embed-wrapper').css('width', '100%');
      }
      if (typeof jQuery.fn.tooltip === 'function') {
        jQuery("#" + this.id).tooltip({
          selector: 'a',
          placement: 'left',
          container: 'body'
        });
      }
      initScroller = (function(_this) {
        return function(e) {
          return new Maslosoft.Playlist.Helpers.Scroller(_this.element, _this.playlist);
        };
      })(this);
      this.frame.on('load', initScroller);
      jQuery(window).on('resize', initScroller);
      initScroller();
      return true;
    };

    Playlist.prototype.makeFrame = function() {
      this.frame = this.frame.replaceWith(frameTemplate);
      return this.frame.prop('id', this.frameId);
    };

    Playlist.prototype.next = function(link) {
      var index, j, l, len, ref;
      link = link[0];
      ref = this.links;
      for (index = j = 0, len = ref.length; j < len; index = ++j) {
        l = ref[index];
        if (link.id === l.id) {
          break;
        }
      }
      index++;
      if (!this.links[index]) {
        console.log('No more videos');
        this.links.removeClass('active playing');
        if (this.links.get(0)) {
          jQuery(this.links.get(0)).addClass('active');
        }
        return;
      }
      link = this.links[index];
      return link.click();
    };

    Playlist.prototype.createLink = function(adapter) {
      var caption, link, thumbCallback;
      caption = jQuery('<div class="caption"/>');
      caption.html(adapter.getTitle());
      link = jQuery('<a />');
      link.attr('id', adapter.linkId);
      link.attr('title', adapter.getTitle());
      link.attr('href', adapter.getUrl());
      link.attr('rel', 'tooltip');
      link.attr('data-placement', 'left');
      link.attr('data-html', true);
      thumbCallback = function(src) {
        link.css('background-image', "url('" + src + "')");
        return link.attr('title', adapter.getTitle());
      };
      adapter.setThumb(thumbCallback);
      link.html('<i></i>');
      link.on('mouseout', (function(_this) {
        return function(e) {
          if (typeof jQuery.fn.tooltip === 'function') {
            return link.tooltip('hide');
          }
        };
      })(this));
      link.on('click', (function(_this) {
        return function(e) {
          var endCb, loaded, src;
          e.preventDefault();
          console.log('Playing next link...');
          if (typeof jQuery.fn.tooltip === 'function') {
            link.tooltip('hide');
          }
          loaded = true;
          if (adapter !== _this.current) {
            _this.current = adapter;
            loaded = false;
            src = adapter.getSrc(_this.frame);
            if (src) {
              _this.frame.prop('src', src);
            }
          }
          _this.links.removeClass('active playing');
          endCb = function() {
            return _this.next(link);
          };
          if (!loaded) {
            _this.frame.one('load', function(e) {
              adapter.play(_this.frame);
              adapter.onEnd(_this.frame, endCb);
              if (adapter.isPlaying()) {
                return link.addClass('active playing');
              }
            });
          }
          adapter.setOnEndCallback(_this.frame, endCb);
          if (loaded) {
            if (adapter.isPlaying()) {
              link.addClass('active');
              adapter.pause(_this.frame);
            } else {
              link.addClass('active playing');
              adapter.play(_this.frame);
              adapter.onEnd(_this.frame, function() {
                return _this.next(link);
              });
            }
          }
          link.addClass('active');
          if (adapter.isPlaying()) {
            return link.addClass('playing');
          } else {
            return link.removeClass('playing');
          }
        };
      })(this));
      this.playlist.append(link);
      return link;
    };

    return Playlist;

  })();

  this.Maslosoft.Playlist.Options = (function() {
    Options.prototype.adapters = [];

    Options.prototype.extractor = null;

    function Options(options) {
      var j, len, name, option;
      if (options == null) {
        options = [];
      }
      this.adapters = new Array;
      for (name = j = 0, len = options.length; j < len; name = ++j) {
        option = options[name];
        this[name] = option;
      }
      if (!this.adapters.length) {
        this.adapters = [Maslosoft.Playlist.Adapters.YouTube, Maslosoft.Playlist.Adapters.Vimeo, Maslosoft.Playlist.Adapters.Dailymotion2];
      }
      if (!this.extractor) {
        this.extractor = Maslosoft.Playlist.Extractors.LinkExtractor;
      }
    }

    return Options;

  })();

  if (!this.Maslosoft.Playlist.Adapters) {
    this.Maslosoft.Playlist.Adapters = {};
  }

  this.Maslosoft.Playlist.Adapters.Abstract = (function() {
    var title;

    Abstract.idCounter = 0;

    Abstract.initialized = {};

    Abstract.prototype.id = '';

    Abstract.prototype.linkId = '';

    Abstract.prototype.url = '';

    Abstract.prototype.frame = null;

    Abstract.prototype.playing = false;

    title = '';

    function Abstract() {
      var id;
      Abstract.idCounter++;
      this.linkId = "maslosoft-playlist-link-" + Abstract.idCounter;
      id = this.constructor.name;
      if (!Abstract.initialized[id]) {
        Maslosoft.Playlist.Adapters[id].once();
        Abstract.initialized[id] = true;
      }
    }

    Abstract.match = function(url) {};

    Abstract.parseEventData = function(rawData) {
      return rawData;
    };

    Abstract.once = function(playlist) {};

    Abstract.prototype.setUrl = function(url1) {
      this.url = url1;
    };

    Abstract.prototype.getUrl = function() {
      return this.url;
    };

    Abstract.prototype.setTitle = function(title) {
      return this.title = title;
    };

    Abstract.prototype.getTitle = function() {
      return this.title;
    };

    Abstract.prototype.setThumb = function(thumbCallback) {};

    Abstract.prototype.getSrc = function(frame1) {
      this.frame = frame1;
    };

    Abstract.prototype.isPlaying = function() {
      return this.playing;
    };

    Abstract.prototype.onEnd = function(frame1, event) {
      this.frame = frame1;
    };

    Abstract.prototype.setOnEndCallback = function(frame1, callback) {
      this.frame = frame1;
    };

    Abstract.prototype.play = function(frame1) {
      this.frame = frame1;
    };

    Abstract.prototype.stop = function(frame1) {
      this.frame = frame1;
    };

    Abstract.prototype.pause = function(frame1) {
      this.frame = frame1;
    };

    return Abstract;

  })();

  if (!this.Maslosoft.Playlist.Adapters) {
    this.Maslosoft.Playlist.Adapters = {};
  }

  this.Maslosoft.Playlist.AdaptersDailymotion = (function(superClass) {
    var apiready, init, ready;

    extend(AdaptersDailymotion, superClass);

    function AdaptersDailymotion() {
      this.setOnEndCallback = bind(this.setOnEndCallback, this);
      this.getSrc = bind(this.getSrc, this);
      return AdaptersDailymotion.__super__.constructor.apply(this, arguments);
    }

    ready = false;

    apiready = false;

    init = jQuery.noop;

    AdaptersDailymotion.prototype.endCallback = null;

    AdaptersDailymotion.match = function(url) {
      return url.match('dailymotion');
    };

    AdaptersDailymotion.once = function() {
      var script, tag;
      script = document.createElement('script');
      script.async = true;
      script.src = 'https://api.dmcdn.net/all.js';
      tag = document.getElementsByTagName('script')[0];
      tag.parentNode.insertBefore(script, tag);
      return window.dmAsyncInit = function() {
        DM.init();
        init();
        return ready = true;
      };
    };

    AdaptersDailymotion.prototype.setUrl = function(url1) {
      var part;
      this.url = url1;
      part = this.url.replace(/.+?\//g, '');
      return this.id = part.replace(/_.+/g, '');
    };

    AdaptersDailymotion.prototype.getSrc = function(frame1) {
      var frameId, params, src;
      this.frame = frame1;
      frameId = this.frame.get(0).id;
      init = (function(_this) {
        return function() {
          var config, player;
          config = {
            video: _this.id,
            params: {
              api: 'postMessage',
              autoplay: ready,
              origin: document.location.protocol + "//" + document.location.hostname,
              id: frameId,
              'endscreen-enable': 0,
              'webkit-playsinline': 1,
              html: 1
            }
          };
          player = DM.player(_this.frame.get(0), config);
          player.addEventListener('apiready', function() {
            console.log('DM API ready');
            apiready = true;
            return _this.playing = ready;
          });
          return player.addEventListener('end', function() {
            console.log('On video end...');
            console.log(_this.endCallback);
            return _this.endCallback();
          });
        };
      })(this);
      if (ready) {
        init();
        return false;
      } else {
        params = ['endscreen-enable=0', 'api=postMessage', 'autoplay=1', "id=" + frameId, "origin=" + document.location.protocol + "//" + document.location.hostname];
        src = ("https://www.dailymotion.com/embed/video/" + this.id + "?") + params.join('&');
        return src;
      }
    };

    AdaptersDailymotion.prototype.setThumb = function(thumbCallback) {
      var url;
      url = "//www.dailymotion.com/thumbnail/video/" + this.id;
      return thumbCallback(url);
    };

    AdaptersDailymotion.prototype.play = function(frame1) {
      this.frame = frame1;
      this.call('play');
      return this.playing = true;
    };

    AdaptersDailymotion.prototype.stop = function(frame1) {
      this.frame = frame1;
      this.call('pause');
      return this.playing = false;
    };

    AdaptersDailymotion.prototype.pause = function(frame1) {
      this.frame = frame1;
      this.call('pause');
      return this.playing = false;
    };

    AdaptersDailymotion.prototype.setOnEndCallback = function(frame1, callback) {
      var e;
      this.frame = frame1;
      try {
        this.endCallback = callback;
        return console.log("Setting callback...");
      } catch (_error) {
        e = _error;
        console.log("Could not set callback...");
        return console.log(e);
      }
    };

    AdaptersDailymotion.prototype.call = function(func, args) {
      var toCall;
      if (args == null) {
        args = [];
      }
      toCall = (function(_this) {
        return function() {
          var data, frameId, iframe, result;
          if (!ready) {
            console.log('Not loaded');
            return;
          }
          if (!apiready) {
            console.log('api not ready, skipping');
            return;
          }
          console.log("Call DM " + func);
          frameId = _this.frame.get(0).id;
          iframe = document.getElementById(frameId);
          data = {
            command: func,
            parameters: args
          };
          return result = iframe.contentWindow.postMessage(JSON.stringify(data), "*");
        };
      })(this);
      return toCall();
    };

    return AdaptersDailymotion;

  })(this.Maslosoft.Playlist.Adapters.Abstract);

  if (!this.Maslosoft.Playlist.Adapters) {
    this.Maslosoft.Playlist.Adapters = {};
  }

  this.Maslosoft.Playlist.Adapters.Dailymotion2 = (function(superClass) {
    var apiready, init, ready;

    extend(Dailymotion2, superClass);

    function Dailymotion2() {
      this.onEnd = bind(this.onEnd, this);
      this.getSrc = bind(this.getSrc, this);
      return Dailymotion2.__super__.constructor.apply(this, arguments);
    }

    ready = false;

    apiready = false;

    init = jQuery.noop;

    Dailymotion2.prototype.endCallback = null;

    Dailymotion2.match = function(url) {
      return url.match('dailymotion');
    };

    Dailymotion2.parseEventData = function(rawData) {
      return parseQueryString(rawData);
    };

    Dailymotion2.once = function() {};

    Dailymotion2.prototype.setUrl = function(url1) {
      var part;
      this.url = url1;
      part = this.url.replace(/.+?\//g, '');
      return this.id = part.replace(/_.+/g, '');
    };

    Dailymotion2.prototype.getSrc = function(frame1) {
      var frameId, params, src;
      this.frame = frame1;
      frameId = this.frame.get(0).id;
      params = ['endscreen-enable=0', 'api=postMessage', 'autoplay=0', "id=" + frameId, "origin=" + document.location.protocol + "//" + document.location.hostname];
      src = ("https://www.dailymotion.com/embed/video/" + this.id + "?") + params.join('&');
      return src;
    };

    Dailymotion2.prototype.setThumb = function(thumbCallback) {
      var url;
      url = "//www.dailymotion.com/thumbnail/video/" + this.id;
      return thumbCallback(url);
    };

    Dailymotion2.prototype.play = function(frame1) {
      this.frame = frame1;
      this.call('play');
      return this.playing = true;
    };

    Dailymotion2.prototype.stop = function(frame1) {
      this.frame = frame1;
      this.call('pause');
      return this.playing = false;
    };

    Dailymotion2.prototype.pause = function(frame1) {
      this.frame = frame1;
      this.call('pause');
      return this.playing = false;
    };

    Dailymotion2.prototype.onEnd = function(frame1, callback) {
      var cb, msg, name, onMsg;
      this.frame = frame1;
      console.log("Preparing DM on end...");
      cb = function() {
        return console.log('Messenger event on end...');
      };
      ready = function() {
        return console.log('Api ready...');
      };
      msg = new Maslosoft.Playlist.Helpers.Messenger(this.frame, this);
      onMsg = function(e, data) {
        console.log(data.event);
        if (data.event === 'end') {
          console.log("Should load next...");
          return callback();
        }
      };
      name = "message.maslosoft.playlist.Dailymotion2";
      return jQuery(document).on(name, onMsg);
    };

    Dailymotion2.prototype.call = function(func, args) {
      var toCall;
      if (args == null) {
        args = [];
      }
      toCall = (function(_this) {
        return function() {
          var data, frameId, iframe, result;
          console.log("Call DM " + func);
          frameId = _this.frame.get(0).id;
          iframe = document.getElementById(frameId);
          data = {
            command: func,
            parameters: args
          };
          return result = iframe.contentWindow.postMessage(JSON.stringify(data), "*");
        };
      })(this);
      return toCall();
    };

    return Dailymotion2;

  })(this.Maslosoft.Playlist.Adapters.Abstract);

  if (!this.Maslosoft.Playlist.Adapters) {
    this.Maslosoft.Playlist.Adapters = {};
  }

  this.Maslosoft.Playlist.Adapters.Vimeo = (function(superClass) {
    extend(Vimeo, superClass);

    function Vimeo() {
      return Vimeo.__super__.constructor.apply(this, arguments);
    }

    Vimeo.match = function(url) {
      return url.match('vimeo');
    };

    Vimeo.once = function() {
      var script;
      if (typeof Froogaloop !== 'undefined') {
        return;
      }
      script = document.createElement("script");
      script.type = "text/javascript";
      script.src = "//f.vimeocdn.com/js/froogaloop2.min.js";
      return jQuery('head').append(script);
    };

    Vimeo.prototype.setUrl = function(url1) {
      this.url = url1;
      this.id = this.url.replace(/.+\//, '');
      return this.id = this.id.replace(/\?.+/, '');
    };

    Vimeo.prototype.getSrc = function(frame1) {
      var frameId, params, src;
      this.frame = frame1;
      frameId = this.frame.get(0).id;
      params = ['api=1', "player_id=" + frameId];
      src = ("//player.vimeo.com/video/" + this.id + "?") + params.join('&');
      return src;
    };

    Vimeo.prototype.setThumb = function(thumbCallback) {
      return $.ajax({
        type: 'GET',
        url: '//vimeo.com/api/v2/video/' + this.id + '.json',
        jsonp: 'callback',
        dataType: 'jsonp',
        success: (function(_this) {
          return function(data) {
            if (!_this.title) {
              _this.setTitle(data[0].title);
            }
            return thumbCallback(data[0].thumbnail_large);
          };
        })(this)
      });
    };

    Vimeo.prototype.play = function(frame1) {
      this.frame = frame1;
      this.call('play');
      return this.playing = true;
    };

    Vimeo.prototype.stop = function(frame1) {
      this.frame = frame1;
      this.call('unload');
      return this.playing = false;
    };

    Vimeo.prototype.pause = function(frame1) {
      this.frame = frame1;
      this.call('pause');
      return this.playing = false;
    };

    Vimeo.prototype.onEnd = function(frame1, callback) {
      var e, player;
      this.frame = frame1;
      try {
        player = Froogaloop(this.frame.get(0));
        try {
          player.addEvent('ready', (function(_this) {
            return function() {
              return player.addEvent('finish', callback);
            };
          })(this));
        } catch (_error) {
          e = _error;
        }
        try {
          return player.addEvent('finish', callback);
        } catch (_error) {
          e = _error;
        }
      } catch (_error) {
        e = _error;
      }
    };

    Vimeo.prototype.call = function(func, args) {
      var toCall;
      if (args == null) {
        args = [];
      }
      toCall = (function(_this) {
        return function() {
          var data, frameId, iframe, result;
          console.log("Call " + func);
          frameId = _this.frame.get(0).id;
          iframe = document.getElementById(frameId);
          data = {
            "method": func,
            "value": args
          };
          return result = iframe.contentWindow.postMessage(JSON.stringify(data), "*");
        };
      })(this);
      setTimeout(toCall, 0);
      return setTimeout(toCall, 500);
    };

    return Vimeo;

  })(this.Maslosoft.Playlist.Adapters.Abstract);

  if (!this.Maslosoft.Playlist.Adapters) {
    this.Maslosoft.Playlist.Adapters = {};
  }

  this.Maslosoft.Playlist.Adapters.YouTube = (function(superClass) {
    extend(YouTube, superClass);

    function YouTube() {
      this.onEnd = bind(this.onEnd, this);
      return YouTube.__super__.constructor.apply(this, arguments);
    }

    YouTube.match = function(url) {
      return url.match('youtube');
    };

    YouTube.once = function() {
      var script;
      if (typeof YT !== 'undefined') {
        return;
      }
      script = document.createElement("script");
      script.type = "text/javascript";
      script.src = "https://www.youtube.com/player_api";
      return jQuery('head').append(script);
    };

    YouTube.prototype.setUrl = function(url1) {
      this.url = url1;
      return this.id = this.url.replace(/.+?v=/, '');
    };

    YouTube.prototype.setThumb = function(thumbCallback) {
      return thumbCallback("//img.youtube.com/vi/" + this.id + "/0.jpg");
    };

    YouTube.prototype.getSrc = function(frame1) {
      var params, src;
      this.frame = frame1;
      params = ['enablejsapi=1', 'rel=0', 'controls=2', 'modestbranding=1', "origin=" + document.location.protocol + "//" + document.location.hostname];
      src = ("//www.youtube.com/embed/" + this.id + "?") + params.join('&');
      console.log(src);
      return src;
    };

    YouTube.prototype.play = function(frame1) {
      this.frame = frame1;
      this.call('playVideo');
      return this.playing = true;
    };

    YouTube.prototype.stop = function(frame1) {
      this.frame = frame1;
      this.call('stopVideo');
      return this.playing = false;
    };

    YouTube.prototype.pause = function(frame1) {
      this.frame = frame1;
      this.call('pauseVideo');
      return this.playing = false;
    };

    YouTube.prototype.onEnd = function(frame1, callback) {
      var onStateChange, player;
      this.frame = frame1;
      onStateChange = function(e) {
        if (e.data === 0) {
          return callback();
        }
      };
      return player = new YT.Player(this.frame.get(0).id, {
        height: '390',
        width: '640',
        videoId: this.id,
        events: {
          'onStateChange': onStateChange
        }
      });
    };

    YouTube.prototype.call = function(func, args) {
      var toCall;
      if (args == null) {
        args = [];
      }
      toCall = (function(_this) {
        return function() {
          var data, frameId, iframe, result;
          frameId = _this.frame.get(0).id;
          iframe = document.getElementById(frameId);
          data = {
            "event": "command",
            "func": func,
            "args": args,
            "id": frameId
          };
          return result = iframe.contentWindow.postMessage(JSON.stringify(data), "*");
        };
      })(this);
      setTimeout(toCall, 0);
      return setTimeout(toCall, 500);
    };

    return YouTube;

  })(this.Maslosoft.Playlist.Adapters.Abstract);

  if (!this.Maslosoft.Playlist.Data) {
    this.Maslosoft.Playlist.Data = {};
  }

  this.Maslosoft.Playlist.Data.Video = (function() {
    function Video(options) {
      var j, len, name, option;
      if (options == null) {
        options = [];
      }
      for (name = j = 0, len = options.length; j < len; name = ++j) {
        option = options[name];
        this[name] = option;
      }
    }

    Video.prototype.title = '';

    Video.prototype.url = '';

    return Video;

  })();

  if (!this.Maslosoft.Playlist.Extractors) {
    this.Maslosoft.Playlist.Extractors = {};
  }

  this.Maslosoft.Playlist.Extractors.Abstract = (function() {
    function Abstract() {}

    Abstract.prototype.getData = function(element) {};

    return Abstract;

  })();

  if (!this.Maslosoft.Playlist.Extractors) {
    this.Maslosoft.Playlist.Extractors = {};
  }

  this.Maslosoft.Playlist.Extractors.LinkExtractor = (function() {
    function LinkExtractor() {}

    LinkExtractor.prototype.getData = function(element) {
      var d, data, j, len, link, ref;
      data = [];
      ref = element.find('a');
      for (j = 0, len = ref.length; j < len; j++) {
        link = ref[j];
        d = new Maslosoft.Playlist.Data.Video;
        d.url = link.href;
        d.title = link.innerHTML;
        data.push(d);
      }
      return data;
    };

    return LinkExtractor;

  })();

  if (!this.Maslosoft.Playlist.Helpers) {
    this.Maslosoft.Playlist.Helpers = {};
  }

  Maslosoft.Playlist.Helpers.Messenger = (function() {
    var eventCallbacks, hasWindowEvent, isReady, playerOrigin, slice;

    isReady = false;

    eventCallbacks = {};

    hasWindowEvent = false;

    slice = Array.prototype.slice;

    playerOrigin = '*';

    Messenger.iframe = null;

    Messenger.element = null;

    Messenger.adapter = null;

    function Messenger(iframe1, adapter1) {
      this.iframe = iframe1;
      this.adapter = adapter1;
      this.onMessageReceived = bind(this.onMessageReceived, this);
      this.postMessage = bind(this.postMessage, this);
      this.removeEvent = bind(this.removeEvent, this);
      this.addEvent = bind(this.addEvent, this);
      this.api = bind(this.api, this);
      this.element = this.iframe.get(0);
      if (window.addEventListener) {
        window.addEventListener('message', this.onMessageReceived, false);
      } else {
        window.attachEvent('onmessage', this.onMessageReceived);
      }
    }

    Messenger.prototype.api = function(method, valueOrCallback) {
      var callback, params, target_id;
      if (!this.element || !method) {
        return false;
      }
      target_id = this.element.id !== '' ? this.element.id : null;
      params = !isFunction(valueOrCallback) ? valueOrCallback : null;
      callback = isFunction(valueOrCallback) ? valueOrCallback : null;
      if (callback) {
        this.storeCallback(method, callback, target_id);
      }
      this.postMessage(method, params, this.element);
      return this;
    };

    Messenger.prototype.addEvent = function(eventName, callback) {
      var target_id;
      if (!this.element) {
        return false;
      }
      target_id = this.element.id !== '' ? this.element.id : null;
      this.storeCallback(eventName, callback, target_id);
      if (eventName.match('ready')) {
        console.log('On ready...');
        this.postMessage('addEventListener', eventName, this.element);
      } else if (eventName.match('ready' && isReady)) {
        callback.call(null, target_id);
      }
      return this;
    };

    Messenger.prototype.removeEvent = function(eventName) {
      var removed, target_id;
      if (!this.element) {
        return false;
      }
      target_id = this.element.id !== '' ? this.element.id : null;
      removed = this.removeCallback(eventName, target_id);
      if (eventName.match('ready' && removed)) {
        this.postMessage('removeEventListener', eventName, this.element);
      }
    };


    /**
    	 * Handles posting a message to the parent window.
    	 *
    	 * @param method (String): name of the method to call inside the player. For api calls
    	 * this is the name of the api method (api_play or api_pause) while for events this method
    	 * is api_addEventListener.
    	 * @param params (Object or Array): List of parameters to submit to the method. Can be either
    	 * a single param or an array list of parameters.
    	 * @param target (HTMLElement): Target iframe to post the message to.
     */

    Messenger.prototype.postMessage = function(method, params, target) {
      var data;
      if (!target.contentWindow.postMessage) {
        return false;
      }
      data = JSON.stringify({
        method: method,
        value: params
      });
      target.contentWindow.postMessage(data, playerOrigin);
    };

    Messenger.prototype.onMessageReceived = function(event) {
      var adapter, callback, data, e, eventData, method, name, ns, params, parsedData, ref, target_id, value;
      ref = Maslosoft.Playlist.Adapters;
      for (name in ref) {
        adapter = ref[name];
        if (adapter.match(event.origin)) {
          parsedData = adapter.parseEventData(event.data);
          data = [parsedData];
          ns = "message.maslosoft.playlist." + name;
          jQuery(document).trigger(ns, data);
          return;
        }
      }
      return;
      console.log("Got message...");
      console.log(event);
      data = void 0;
      method = void 0;
      try {
        data = JSON.parse(event.data);
        method = data.event || data.method;
      } catch (_error) {
        e = _error;
      }
      if (!method) {
        method = jQuery.noop;
      }
      if (method.match('ready' && !isReady)) {
        isReady = true;
      }
      console.log(event.origin);
      if (playerOrigin === '*') {
        playerOrigin = event.origin;
      }
      value = data.value;
      eventData = data.data;
      target_id = target_id === '' ? null : data.player_id;
      callback = this.getCallback(method, target_id);
      params = [];
      if (!callback) {
        return false;
      }
      if (value !== void 0) {
        params.push(value);
      }
      if (eventData) {
        params.push(eventData);
      }
      if (target_id) {
        params.push(target_id);
      }
      if (params.length > 0) {
        return callback.apply(null, params);
      } else {
        return callback.call();
      }
    };


    /*
    	 * Stores submitted callbacks for each iframe being tracked and each
    	 * event for that iframe for each adapter type.
    	 *
    	 * @param eventName (String): Name of the event. Eg. api_onPlay
    	 * @param callback (Function): Function that should get executed when the
    	 * event is fired.
    	 * @param target_id (String) [Optional]: If handling more than one iframe then
    	 * it stores the different callbacks for different iframes based on the iframe's
    	 * id.
     */

    Messenger.prototype.storeCallback = function(eventName, callback, target_id) {
      target_id = target_id + this.adapter.constructor.name;
      if (target_id) {
        if (!eventCallbacks[target_id]) {
          eventCallbacks[target_id] = {};
        }
        eventCallbacks[target_id][eventName] = callback;
      } else {
        eventCallbacks[eventName] = callback;
      }
    };


    /*
    	 * Retrieves stored callbacks.
     */

    Messenger.prototype.getCallback = function(eventName, target_id) {
      target_id = target_id + this.adapter.constructor.name;
      if (target_id) {
        return eventCallbacks[target_id][eventName];
      } else {
        return eventCallbacks[eventName];
      }
    };

    Messenger.prototype.removeCallback = function(eventName, target_id) {
      target_id = target_id + this.adapter.constructor.name;
      if (target_id && eventCallbacks[target_id]) {
        if (!eventCallbacks[target_id][eventName]) {
          return false;
        }
        eventCallbacks[target_id][eventName] = null;
      } else {
        if (!eventCallbacks[eventName]) {
          return false;
        }
        eventCallbacks[eventName] = null;
      }
      return true;
    };

    return Messenger;

  })();

  if (!this.Maslosoft.Playlist.Helpers) {
    this.Maslosoft.Playlist.Helpers = {};
  }

  this.Maslosoft.Playlist.Helpers.Scroller = (function() {
    Scroller.holder = null;

    Scroller.playlist = null;

    function Scroller(element, playlist1) {
      var applyHeight;
      this.playlist = playlist1;
      applyHeight = (function(_this) {
        return function() {
          var container, frame, height, list;
          frame = element.find('.maslosoft-video-embed-container iframe');
          _this.holder = _this.playlist.parent();
          _this.holder.height(frame.height());
          list = element.find('.maslosoft-video-playlist');
          height = list.height();
          list.css({
            'height': height + "px"
          });
          container = element.find('.maslosoft-video-playlist-holder');
          return Maslosoft.Ps.initialize(container.get(0));
        };
      })(this);
      setTimeout(applyHeight, 0);
    }

    return Scroller;

  })();

}).call(this);

//# sourceMappingURL=playlist-standalone.js.map

/* perfect-scrollbar v0.6.14 */
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var ps = require('../main');

if (typeof define === 'function' && define.amd) {
  // AMD
  define(ps);
} else {
  // Add to a global object.
  Maslosoft.PerfectScrollbar = ps;
  if (typeof Maslosoft.Ps === 'undefined') {
    Maslosoft.Ps = ps;
  }
}

},{"../main":7}],2:[function(require,module,exports){
'use strict';

function oldAdd(element, className) {
  var classes = element.className.split(' ');
  if (classes.indexOf(className) < 0) {
    classes.push(className);
  }
  element.className = classes.join(' ');
}

function oldRemove(element, className) {
  var classes = element.className.split(' ');
  var idx = classes.indexOf(className);
  if (idx >= 0) {
    classes.splice(idx, 1);
  }
  element.className = classes.join(' ');
}

exports.add = function (element, className) {
  if (element.classList) {
    element.classList.add(className);
  } else {
    oldAdd(element, className);
  }
};

exports.remove = function (element, className) {
  if (element.classList) {
    element.classList.remove(className);
  } else {
    oldRemove(element, className);
  }
};

exports.list = function (element) {
  if (element.classList) {
    return Array.prototype.slice.apply(element.classList);
  } else {
    return element.className.split(' ');
  }
};

},{}],3:[function(require,module,exports){
'use strict';

var DOM = {};

DOM.e = function (tagName, className) {
  var element = document.createElement(tagName);
  element.className = className;
  return element;
};

DOM.appendTo = function (child, parent) {
  parent.appendChild(child);
  return child;
};

function cssGet(element, styleName) {
  return window.getComputedStyle(element)[styleName];
}

function cssSet(element, styleName, styleValue) {
  if (typeof styleValue === 'number') {
    styleValue = styleValue.toString() + 'px';
  }
  element.style[styleName] = styleValue;
  return element;
}

function cssMultiSet(element, obj) {
  for (var key in obj) {
    var val = obj[key];
    if (typeof val === 'number') {
      val = val.toString() + 'px';
    }
    element.style[key] = val;
  }
  return element;
}

DOM.css = function (element, styleNameOrObject, styleValue) {
  if (typeof styleNameOrObject === 'object') {
    // multiple set with object
    return cssMultiSet(element, styleNameOrObject);
  } else {
    if (typeof styleValue === 'undefined') {
      return cssGet(element, styleNameOrObject);
    } else {
      return cssSet(element, styleNameOrObject, styleValue);
    }
  }
};

DOM.matches = function (element, query) {
  if (typeof element.matches !== 'undefined') {
    return element.matches(query);
  } else {
    if (typeof element.matchesSelector !== 'undefined') {
      return element.matchesSelector(query);
    } else if (typeof element.webkitMatchesSelector !== 'undefined') {
      return element.webkitMatchesSelector(query);
    } else if (typeof element.mozMatchesSelector !== 'undefined') {
      return element.mozMatchesSelector(query);
    } else if (typeof element.msMatchesSelector !== 'undefined') {
      return element.msMatchesSelector(query);
    }
  }
};

DOM.remove = function (element) {
  if (typeof element.remove !== 'undefined') {
    element.remove();
  } else {
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
  }
};

DOM.queryChildren = function (element, selector) {
  return Array.prototype.filter.call(element.childNodes, function (child) {
    return DOM.matches(child, selector);
  });
};

module.exports = DOM;

},{}],4:[function(require,module,exports){
'use strict';

var EventElement = function (element) {
  this.element = element;
  this.events = {};
};

EventElement.prototype.bind = function (eventName, handler) {
  if (typeof this.events[eventName] === 'undefined') {
    this.events[eventName] = [];
  }
  this.events[eventName].push(handler);
  this.element.addEventListener(eventName, handler, false);
};

EventElement.prototype.unbind = function (eventName, handler) {
  var isHandlerProvided = (typeof handler !== 'undefined');
  this.events[eventName] = this.events[eventName].filter(function (hdlr) {
    if (isHandlerProvided && hdlr !== handler) {
      return true;
    }
    this.element.removeEventListener(eventName, hdlr, false);
    return false;
  }, this);
};

EventElement.prototype.unbindAll = function () {
  for (var name in this.events) {
    this.unbind(name);
  }
};

var EventManager = function () {
  this.eventElements = [];
};

EventManager.prototype.eventElement = function (element) {
  var ee = this.eventElements.filter(function (eventElement) {
    return eventElement.element === element;
  })[0];
  if (typeof ee === 'undefined') {
    ee = new EventElement(element);
    this.eventElements.push(ee);
  }
  return ee;
};

EventManager.prototype.bind = function (element, eventName, handler) {
  this.eventElement(element).bind(eventName, handler);
};

EventManager.prototype.unbind = function (element, eventName, handler) {
  this.eventElement(element).unbind(eventName, handler);
};

EventManager.prototype.unbindAll = function () {
  for (var i = 0; i < this.eventElements.length; i++) {
    this.eventElements[i].unbindAll();
  }
};

EventManager.prototype.once = function (element, eventName, handler) {
  var ee = this.eventElement(element);
  var onceHandler = function (e) {
    ee.unbind(eventName, onceHandler);
    handler(e);
  };
  ee.bind(eventName, onceHandler);
};

module.exports = EventManager;

},{}],5:[function(require,module,exports){
'use strict';

module.exports = (function () {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
               .toString(16)
               .substring(1);
  }
  return function () {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
           s4() + '-' + s4() + s4() + s4();
  };
})();

},{}],6:[function(require,module,exports){
'use strict';

var cls = require('./class');
var dom = require('./dom');

var toInt = exports.toInt = function (x) {
  return parseInt(x, 10) || 0;
};

var clone = exports.clone = function (obj) {
  if (!obj) {
    return null;
  } else if (obj.constructor === Array) {
    return obj.map(clone);
  } else if (typeof obj === 'object') {
    var result = {};
    for (var key in obj) {
      result[key] = clone(obj[key]);
    }
    return result;
  } else {
    return obj;
  }
};

exports.extend = function (original, source) {
  var result = clone(original);
  for (var key in source) {
    result[key] = clone(source[key]);
  }
  return result;
};

exports.isEditable = function (el) {
  return dom.matches(el, "input,[contenteditable]") ||
         dom.matches(el, "select,[contenteditable]") ||
         dom.matches(el, "textarea,[contenteditable]") ||
         dom.matches(el, "button,[contenteditable]");
};

exports.removePsClasses = function (element) {
  var clsList = cls.list(element);
  for (var i = 0; i < clsList.length; i++) {
    var className = clsList[i];
    if (className.indexOf('ps-') === 0) {
      cls.remove(element, className);
    }
  }
};

exports.outerWidth = function (element) {
  return toInt(dom.css(element, 'width')) +
         toInt(dom.css(element, 'paddingLeft')) +
         toInt(dom.css(element, 'paddingRight')) +
         toInt(dom.css(element, 'borderLeftWidth')) +
         toInt(dom.css(element, 'borderRightWidth'));
};

exports.startScrolling = function (element, axis) {
  cls.add(element, 'ps-in-scrolling');
  if (typeof axis !== 'undefined') {
    cls.add(element, 'ps-' + axis);
  } else {
    cls.add(element, 'ps-x');
    cls.add(element, 'ps-y');
  }
};

exports.stopScrolling = function (element, axis) {
  cls.remove(element, 'ps-in-scrolling');
  if (typeof axis !== 'undefined') {
    cls.remove(element, 'ps-' + axis);
  } else {
    cls.remove(element, 'ps-x');
    cls.remove(element, 'ps-y');
  }
};

exports.env = {
  isWebKit: 'WebkitAppearance' in document.documentElement.style,
  supportsTouch: (('ontouchstart' in window) || window.DocumentTouch && document instanceof window.DocumentTouch),
  supportsIePointer: window.navigator.msMaxTouchPoints !== null
};

},{"./class":2,"./dom":3}],7:[function(require,module,exports){
'use strict';

var destroy = require('./plugin/destroy');
var initialize = require('./plugin/initialize');
var update = require('./plugin/update');

module.exports = {
  initialize: initialize,
  update: update,
  destroy: destroy
};

},{"./plugin/destroy":9,"./plugin/initialize":17,"./plugin/update":21}],8:[function(require,module,exports){
'use strict';

module.exports = {
  handlers: ['click-rail', 'drag-scrollbar', 'keyboard', 'wheel', 'touch'],
  maxScrollbarLength: null,
  minScrollbarLength: null,
  scrollXMarginOffset: 0,
  scrollYMarginOffset: 0,
  suppressScrollX: false,
  suppressScrollY: false,
  swipePropagation: true,
  useBothWheelAxes: false,
  wheelPropagation: false,
  wheelSpeed: 1,
  theme: 'default'
};

},{}],9:[function(require,module,exports){
'use strict';

var _ = require('../lib/helper');
var dom = require('../lib/dom');
var instances = require('./instances');

module.exports = function (element) {
  var i = instances.get(element);

  if (!i) {
    return;
  }

  i.event.unbindAll();
  dom.remove(i.scrollbarX);
  dom.remove(i.scrollbarY);
  dom.remove(i.scrollbarXRail);
  dom.remove(i.scrollbarYRail);
  _.removePsClasses(element);

  instances.remove(element);
};

},{"../lib/dom":3,"../lib/helper":6,"./instances":18}],10:[function(require,module,exports){
'use strict';

var instances = require('../instances');
var updateGeometry = require('../update-geometry');
var updateScroll = require('../update-scroll');

function bindClickRailHandler(element, i) {
  function pageOffset(el) {
    return el.getBoundingClientRect();
  }
  var stopPropagation = function (e) { e.stopPropagation(); };

  i.event.bind(i.scrollbarY, 'click', stopPropagation);
  i.event.bind(i.scrollbarYRail, 'click', function (e) {
    var positionTop = e.pageY - window.pageYOffset - pageOffset(i.scrollbarYRail).top;
    var direction = positionTop > i.scrollbarYTop ? 1 : -1;

    updateScroll(element, 'top', element.scrollTop + direction * i.containerHeight);
    updateGeometry(element);

    e.stopPropagation();
  });

  i.event.bind(i.scrollbarX, 'click', stopPropagation);
  i.event.bind(i.scrollbarXRail, 'click', function (e) {
    var positionLeft = e.pageX - window.pageXOffset - pageOffset(i.scrollbarXRail).left;
    var direction = positionLeft > i.scrollbarXLeft ? 1 : -1;

    updateScroll(element, 'left', element.scrollLeft + direction * i.containerWidth);
    updateGeometry(element);

    e.stopPropagation();
  });
}

module.exports = function (element) {
  var i = instances.get(element);
  bindClickRailHandler(element, i);
};

},{"../instances":18,"../update-geometry":19,"../update-scroll":20}],11:[function(require,module,exports){
'use strict';

var _ = require('../../lib/helper');
var dom = require('../../lib/dom');
var instances = require('../instances');
var updateGeometry = require('../update-geometry');
var updateScroll = require('../update-scroll');

function bindMouseScrollXHandler(element, i) {
  var currentLeft = null;
  var currentPageX = null;

  function updateScrollLeft(deltaX) {
    var newLeft = currentLeft + (deltaX * i.railXRatio);
    var maxLeft = Math.max(0, i.scrollbarXRail.getBoundingClientRect().left) + (i.railXRatio * (i.railXWidth - i.scrollbarXWidth));

    if (newLeft < 0) {
      i.scrollbarXLeft = 0;
    } else if (newLeft > maxLeft) {
      i.scrollbarXLeft = maxLeft;
    } else {
      i.scrollbarXLeft = newLeft;
    }

    var scrollLeft = _.toInt(i.scrollbarXLeft * (i.contentWidth - i.containerWidth) / (i.containerWidth - (i.railXRatio * i.scrollbarXWidth))) - i.negativeScrollAdjustment;
    updateScroll(element, 'left', scrollLeft);
  }

  var mouseMoveHandler = function (e) {
    updateScrollLeft(e.pageX - currentPageX);
    updateGeometry(element);
    e.stopPropagation();
    e.preventDefault();
  };

  var mouseUpHandler = function () {
    _.stopScrolling(element, 'x');
    i.event.unbind(i.ownerDocument, 'mousemove', mouseMoveHandler);
  };

  i.event.bind(i.scrollbarX, 'mousedown', function (e) {
    currentPageX = e.pageX;
    currentLeft = _.toInt(dom.css(i.scrollbarX, 'left')) * i.railXRatio;
    _.startScrolling(element, 'x');

    i.event.bind(i.ownerDocument, 'mousemove', mouseMoveHandler);
    i.event.once(i.ownerDocument, 'mouseup', mouseUpHandler);

    e.stopPropagation();
    e.preventDefault();
  });
}

function bindMouseScrollYHandler(element, i) {
  var currentTop = null;
  var currentPageY = null;

  function updateScrollTop(deltaY) {
    var newTop = currentTop + (deltaY * i.railYRatio);
    var maxTop = Math.max(0, i.scrollbarYRail.getBoundingClientRect().top) + (i.railYRatio * (i.railYHeight - i.scrollbarYHeight));

    if (newTop < 0) {
      i.scrollbarYTop = 0;
    } else if (newTop > maxTop) {
      i.scrollbarYTop = maxTop;
    } else {
      i.scrollbarYTop = newTop;
    }

    var scrollTop = _.toInt(i.scrollbarYTop * (i.contentHeight - i.containerHeight) / (i.containerHeight - (i.railYRatio * i.scrollbarYHeight)));
    updateScroll(element, 'top', scrollTop);
  }

  var mouseMoveHandler = function (e) {
    updateScrollTop(e.pageY - currentPageY);
    updateGeometry(element);
    e.stopPropagation();
    e.preventDefault();
  };

  var mouseUpHandler = function () {
    _.stopScrolling(element, 'y');
    i.event.unbind(i.ownerDocument, 'mousemove', mouseMoveHandler);
  };

  i.event.bind(i.scrollbarY, 'mousedown', function (e) {
    currentPageY = e.pageY;
    currentTop = _.toInt(dom.css(i.scrollbarY, 'top')) * i.railYRatio;
    _.startScrolling(element, 'y');

    i.event.bind(i.ownerDocument, 'mousemove', mouseMoveHandler);
    i.event.once(i.ownerDocument, 'mouseup', mouseUpHandler);

    e.stopPropagation();
    e.preventDefault();
  });
}

module.exports = function (element) {
  var i = instances.get(element);
  bindMouseScrollXHandler(element, i);
  bindMouseScrollYHandler(element, i);
};

},{"../../lib/dom":3,"../../lib/helper":6,"../instances":18,"../update-geometry":19,"../update-scroll":20}],12:[function(require,module,exports){
'use strict';

var _ = require('../../lib/helper');
var dom = require('../../lib/dom');
var instances = require('../instances');
var updateGeometry = require('../update-geometry');
var updateScroll = require('../update-scroll');

function bindKeyboardHandler(element, i) {
  var hovered = false;
  i.event.bind(element, 'mouseenter', function () {
    hovered = true;
  });
  i.event.bind(element, 'mouseleave', function () {
    hovered = false;
  });

  var shouldPrevent = false;
  function shouldPreventDefault(deltaX, deltaY) {
    var scrollTop = element.scrollTop;
    if (deltaX === 0) {
      if (!i.scrollbarYActive) {
        return false;
      }
      if ((scrollTop === 0 && deltaY > 0) || (scrollTop >= i.contentHeight - i.containerHeight && deltaY < 0)) {
        return !i.settings.wheelPropagation;
      }
    }

    var scrollLeft = element.scrollLeft;
    if (deltaY === 0) {
      if (!i.scrollbarXActive) {
        return false;
      }
      if ((scrollLeft === 0 && deltaX < 0) || (scrollLeft >= i.contentWidth - i.containerWidth && deltaX > 0)) {
        return !i.settings.wheelPropagation;
      }
    }
    return true;
  }

  i.event.bind(i.ownerDocument, 'keydown', function (e) {
    if ((e.isDefaultPrevented && e.isDefaultPrevented()) || e.defaultPrevented) {
      return;
    }

    var focused = dom.matches(i.scrollbarX, ':focus') ||
                  dom.matches(i.scrollbarY, ':focus');

    if (!hovered && !focused) {
      return;
    }

    var activeElement = document.activeElement ? document.activeElement : i.ownerDocument.activeElement;
    if (activeElement) {
      if (activeElement.tagName === 'IFRAME') {
        activeElement = activeElement.contentDocument.activeElement;
      } else {
        // go deeper if element is a webcomponent
        while (activeElement.shadowRoot) {
          activeElement = activeElement.shadowRoot.activeElement;
        }
      }
      if (_.isEditable(activeElement)) {
        return;
      }
    }

    var deltaX = 0;
    var deltaY = 0;

    switch (e.which) {
    case 37: // left
      if (e.metaKey) {
        deltaX = -i.contentWidth;
      } else if (e.altKey) {
        deltaX = -i.containerWidth;
      } else {
        deltaX = -30;
      }
      break;
    case 38: // up
      if (e.metaKey) {
        deltaY = i.contentHeight;
      } else if (e.altKey) {
        deltaY = i.containerHeight;
      } else {
        deltaY = 30;
      }
      break;
    case 39: // right
      if (e.metaKey) {
        deltaX = i.contentWidth;
      } else if (e.altKey) {
        deltaX = i.containerWidth;
      } else {
        deltaX = 30;
      }
      break;
    case 40: // down
      if (e.metaKey) {
        deltaY = -i.contentHeight;
      } else if (e.altKey) {
        deltaY = -i.containerHeight;
      } else {
        deltaY = -30;
      }
      break;
    case 33: // page up
      deltaY = 90;
      break;
    case 32: // space bar
      if (e.shiftKey) {
        deltaY = 90;
      } else {
        deltaY = -90;
      }
      break;
    case 34: // page down
      deltaY = -90;
      break;
    case 35: // end
      if (e.ctrlKey) {
        deltaY = -i.contentHeight;
      } else {
        deltaY = -i.containerHeight;
      }
      break;
    case 36: // home
      if (e.ctrlKey) {
        deltaY = element.scrollTop;
      } else {
        deltaY = i.containerHeight;
      }
      break;
    default:
      return;
    }

    updateScroll(element, 'top', element.scrollTop - deltaY);
    updateScroll(element, 'left', element.scrollLeft + deltaX);
    updateGeometry(element);

    shouldPrevent = shouldPreventDefault(deltaX, deltaY);
    if (shouldPrevent) {
      e.preventDefault();
    }
  });
}

module.exports = function (element) {
  var i = instances.get(element);
  bindKeyboardHandler(element, i);
};

},{"../../lib/dom":3,"../../lib/helper":6,"../instances":18,"../update-geometry":19,"../update-scroll":20}],13:[function(require,module,exports){
'use strict';

var instances = require('../instances');
var updateGeometry = require('../update-geometry');
var updateScroll = require('../update-scroll');

function bindMouseWheelHandler(element, i) {
  var shouldPrevent = false;

  function shouldPreventDefault(deltaX, deltaY) {
    var scrollTop = element.scrollTop;
    if (deltaX === 0) {
      if (!i.scrollbarYActive) {
        return false;
      }
      if ((scrollTop === 0 && deltaY > 0) || (scrollTop >= i.contentHeight - i.containerHeight && deltaY < 0)) {
        return !i.settings.wheelPropagation;
      }
    }

    var scrollLeft = element.scrollLeft;
    if (deltaY === 0) {
      if (!i.scrollbarXActive) {
        return false;
      }
      if ((scrollLeft === 0 && deltaX < 0) || (scrollLeft >= i.contentWidth - i.containerWidth && deltaX > 0)) {
        return !i.settings.wheelPropagation;
      }
    }
    return true;
  }

  function getDeltaFromEvent(e) {
    var deltaX = e.deltaX;
    var deltaY = -1 * e.deltaY;

    if (typeof deltaX === "undefined" || typeof deltaY === "undefined") {
      // OS X Safari
      deltaX = -1 * e.wheelDeltaX / 6;
      deltaY = e.wheelDeltaY / 6;
    }

    if (e.deltaMode && e.deltaMode === 1) {
      // Firefox in deltaMode 1: Line scrolling
      deltaX *= 10;
      deltaY *= 10;
    }

    if (deltaX !== deltaX && deltaY !== deltaY/* NaN checks */) {
      // IE in some mouse drivers
      deltaX = 0;
      deltaY = e.wheelDelta;
    }

    if (e.shiftKey) {
      // reverse axis with shift key
      return [-deltaY, -deltaX];
    }
    return [deltaX, deltaY];
  }

  function shouldBeConsumedByChild(deltaX, deltaY) {
    var child = element.querySelector('textarea:hover, select[multiple]:hover, .ps-child:hover');
    if (child) {
      if (!window.getComputedStyle(child).overflow.match(/(scroll|auto)/)) {
        // if not scrollable
        return false;
      }

      var maxScrollTop = child.scrollHeight - child.clientHeight;
      if (maxScrollTop > 0) {
        if (!(child.scrollTop === 0 && deltaY > 0) && !(child.scrollTop === maxScrollTop && deltaY < 0)) {
          return true;
        }
      }
      var maxScrollLeft = child.scrollLeft - child.clientWidth;
      if (maxScrollLeft > 0) {
        if (!(child.scrollLeft === 0 && deltaX < 0) && !(child.scrollLeft === maxScrollLeft && deltaX > 0)) {
          return true;
        }
      }
    }
    return false;
  }

  function mousewheelHandler(e) {
    var delta = getDeltaFromEvent(e);

    var deltaX = delta[0];
    var deltaY = delta[1];

    if (shouldBeConsumedByChild(deltaX, deltaY)) {
      return;
    }

    shouldPrevent = false;
    if (!i.settings.useBothWheelAxes) {
      // deltaX will only be used for horizontal scrolling and deltaY will
      // only be used for vertical scrolling - this is the default
      updateScroll(element, 'top', element.scrollTop - (deltaY * i.settings.wheelSpeed));
      updateScroll(element, 'left', element.scrollLeft + (deltaX * i.settings.wheelSpeed));
    } else if (i.scrollbarYActive && !i.scrollbarXActive) {
      // only vertical scrollbar is active and useBothWheelAxes option is
      // active, so let's scroll vertical bar using both mouse wheel axes
      if (deltaY) {
        updateScroll(element, 'top', element.scrollTop - (deltaY * i.settings.wheelSpeed));
      } else {
        updateScroll(element, 'top', element.scrollTop + (deltaX * i.settings.wheelSpeed));
      }
      shouldPrevent = true;
    } else if (i.scrollbarXActive && !i.scrollbarYActive) {
      // useBothWheelAxes and only horizontal bar is active, so use both
      // wheel axes for horizontal bar
      if (deltaX) {
        updateScroll(element, 'left', element.scrollLeft + (deltaX * i.settings.wheelSpeed));
      } else {
        updateScroll(element, 'left', element.scrollLeft - (deltaY * i.settings.wheelSpeed));
      }
      shouldPrevent = true;
    }

    updateGeometry(element);

    shouldPrevent = (shouldPrevent || shouldPreventDefault(deltaX, deltaY));
    if (shouldPrevent) {
      e.stopPropagation();
      e.preventDefault();
    }
  }

  if (typeof window.onwheel !== "undefined") {
    i.event.bind(element, 'wheel', mousewheelHandler);
  } else if (typeof window.onmousewheel !== "undefined") {
    i.event.bind(element, 'mousewheel', mousewheelHandler);
  }
}

module.exports = function (element) {
  var i = instances.get(element);
  bindMouseWheelHandler(element, i);
};

},{"../instances":18,"../update-geometry":19,"../update-scroll":20}],14:[function(require,module,exports){
'use strict';

var instances = require('../instances');
var updateGeometry = require('../update-geometry');

function bindNativeScrollHandler(element, i) {
  i.event.bind(element, 'scroll', function () {
    updateGeometry(element);
  });
}

module.exports = function (element) {
  var i = instances.get(element);
  bindNativeScrollHandler(element, i);
};

},{"../instances":18,"../update-geometry":19}],15:[function(require,module,exports){
'use strict';

var _ = require('../../lib/helper');
var instances = require('../instances');
var updateGeometry = require('../update-geometry');
var updateScroll = require('../update-scroll');

function bindSelectionHandler(element, i) {
  function getRangeNode() {
    var selection = window.getSelection ? window.getSelection() :
                    document.getSelection ? document.getSelection() : '';
    if (selection.toString().length === 0) {
      return null;
    } else {
      return selection.getRangeAt(0).commonAncestorContainer;
    }
  }

  var scrollingLoop = null;
  var scrollDiff = {top: 0, left: 0};
  function startScrolling() {
    if (!scrollingLoop) {
      scrollingLoop = setInterval(function () {
        if (!instances.get(element)) {
          clearInterval(scrollingLoop);
          return;
        }

        updateScroll(element, 'top', element.scrollTop + scrollDiff.top);
        updateScroll(element, 'left', element.scrollLeft + scrollDiff.left);
        updateGeometry(element);
      }, 50); // every .1 sec
    }
  }
  function stopScrolling() {
    if (scrollingLoop) {
      clearInterval(scrollingLoop);
      scrollingLoop = null;
    }
    _.stopScrolling(element);
  }

  var isSelected = false;
  i.event.bind(i.ownerDocument, 'selectionchange', function () {
    if (element.contains(getRangeNode())) {
      isSelected = true;
    } else {
      isSelected = false;
      stopScrolling();
    }
  });
  i.event.bind(window, 'mouseup', function () {
    if (isSelected) {
      isSelected = false;
      stopScrolling();
    }
  });
  i.event.bind(window, 'keyup', function () {
    if (isSelected) {
      isSelected = false;
      stopScrolling();
    }
  });

  i.event.bind(window, 'mousemove', function (e) {
    if (isSelected) {
      var mousePosition = {x: e.pageX, y: e.pageY};
      var containerGeometry = {
        left: element.offsetLeft,
        right: element.offsetLeft + element.offsetWidth,
        top: element.offsetTop,
        bottom: element.offsetTop + element.offsetHeight
      };

      if (mousePosition.x < containerGeometry.left + 3) {
        scrollDiff.left = -5;
        _.startScrolling(element, 'x');
      } else if (mousePosition.x > containerGeometry.right - 3) {
        scrollDiff.left = 5;
        _.startScrolling(element, 'x');
      } else {
        scrollDiff.left = 0;
      }

      if (mousePosition.y < containerGeometry.top + 3) {
        if (containerGeometry.top + 3 - mousePosition.y < 5) {
          scrollDiff.top = -5;
        } else {
          scrollDiff.top = -20;
        }
        _.startScrolling(element, 'y');
      } else if (mousePosition.y > containerGeometry.bottom - 3) {
        if (mousePosition.y - containerGeometry.bottom + 3 < 5) {
          scrollDiff.top = 5;
        } else {
          scrollDiff.top = 20;
        }
        _.startScrolling(element, 'y');
      } else {
        scrollDiff.top = 0;
      }

      if (scrollDiff.top === 0 && scrollDiff.left === 0) {
        stopScrolling();
      } else {
        startScrolling();
      }
    }
  });
}

module.exports = function (element) {
  var i = instances.get(element);
  bindSelectionHandler(element, i);
};

},{"../../lib/helper":6,"../instances":18,"../update-geometry":19,"../update-scroll":20}],16:[function(require,module,exports){
'use strict';

var _ = require('../../lib/helper');
var instances = require('../instances');
var updateGeometry = require('../update-geometry');
var updateScroll = require('../update-scroll');

function bindTouchHandler(element, i, supportsTouch, supportsIePointer) {
  function shouldPreventDefault(deltaX, deltaY) {
    var scrollTop = element.scrollTop;
    var scrollLeft = element.scrollLeft;
    var magnitudeX = Math.abs(deltaX);
    var magnitudeY = Math.abs(deltaY);

    if (magnitudeY > magnitudeX) {
      // user is perhaps trying to swipe up/down the page

      if (((deltaY < 0) && (scrollTop === i.contentHeight - i.containerHeight)) ||
          ((deltaY > 0) && (scrollTop === 0))) {
        return !i.settings.swipePropagation;
      }
    } else if (magnitudeX > magnitudeY) {
      // user is perhaps trying to swipe left/right across the page

      if (((deltaX < 0) && (scrollLeft === i.contentWidth - i.containerWidth)) ||
          ((deltaX > 0) && (scrollLeft === 0))) {
        return !i.settings.swipePropagation;
      }
    }

    return true;
  }

  function applyTouchMove(differenceX, differenceY) {
    updateScroll(element, 'top', element.scrollTop - differenceY);
    updateScroll(element, 'left', element.scrollLeft - differenceX);

    updateGeometry(element);
  }

  var startOffset = {};
  var startTime = 0;
  var speed = {};
  var easingLoop = null;
  var inGlobalTouch = false;
  var inLocalTouch = false;

  function globalTouchStart() {
    inGlobalTouch = true;
  }
  function globalTouchEnd() {
    inGlobalTouch = false;
  }

  function getTouch(e) {
    if (e.targetTouches) {
      return e.targetTouches[0];
    } else {
      // Maybe IE pointer
      return e;
    }
  }
  function shouldHandle(e) {
    if (e.targetTouches && e.targetTouches.length === 1) {
      return true;
    }
    if (e.pointerType && e.pointerType !== 'mouse' && e.pointerType !== e.MSPOINTER_TYPE_MOUSE) {
      return true;
    }
    return false;
  }
  function touchStart(e) {
    if (shouldHandle(e)) {
      inLocalTouch = true;

      var touch = getTouch(e);

      startOffset.pageX = touch.pageX;
      startOffset.pageY = touch.pageY;

      startTime = (new Date()).getTime();

      if (easingLoop !== null) {
        clearInterval(easingLoop);
      }

      e.stopPropagation();
    }
  }
  function touchMove(e) {
    if (!inLocalTouch && i.settings.swipePropagation) {
      touchStart(e);
    }
    if (!inGlobalTouch && inLocalTouch && shouldHandle(e)) {
      var touch = getTouch(e);

      var currentOffset = {pageX: touch.pageX, pageY: touch.pageY};

      var differenceX = currentOffset.pageX - startOffset.pageX;
      var differenceY = currentOffset.pageY - startOffset.pageY;

      applyTouchMove(differenceX, differenceY);
      startOffset = currentOffset;

      var currentTime = (new Date()).getTime();

      var timeGap = currentTime - startTime;
      if (timeGap > 0) {
        speed.x = differenceX / timeGap;
        speed.y = differenceY / timeGap;
        startTime = currentTime;
      }

      if (shouldPreventDefault(differenceX, differenceY)) {
        e.stopPropagation();
        e.preventDefault();
      }
    }
  }
  function touchEnd() {
    if (!inGlobalTouch && inLocalTouch) {
      inLocalTouch = false;

      clearInterval(easingLoop);
      easingLoop = setInterval(function () {
        if (!instances.get(element)) {
          clearInterval(easingLoop);
          return;
        }

        if (!speed.x && !speed.y) {
          clearInterval(easingLoop);
          return;
        }

        if (Math.abs(speed.x) < 0.01 && Math.abs(speed.y) < 0.01) {
          clearInterval(easingLoop);
          return;
        }

        applyTouchMove(speed.x * 30, speed.y * 30);

        speed.x *= 0.8;
        speed.y *= 0.8;
      }, 10);
    }
  }

  if (supportsTouch) {
    i.event.bind(window, 'touchstart', globalTouchStart);
    i.event.bind(window, 'touchend', globalTouchEnd);
    i.event.bind(element, 'touchstart', touchStart);
    i.event.bind(element, 'touchmove', touchMove);
    i.event.bind(element, 'touchend', touchEnd);
  }

  if (supportsIePointer) {
    if (window.PointerEvent) {
      i.event.bind(window, 'pointerdown', globalTouchStart);
      i.event.bind(window, 'pointerup', globalTouchEnd);
      i.event.bind(element, 'pointerdown', touchStart);
      i.event.bind(element, 'pointermove', touchMove);
      i.event.bind(element, 'pointerup', touchEnd);
    } else if (window.MSPointerEvent) {
      i.event.bind(window, 'MSPointerDown', globalTouchStart);
      i.event.bind(window, 'MSPointerUp', globalTouchEnd);
      i.event.bind(element, 'MSPointerDown', touchStart);
      i.event.bind(element, 'MSPointerMove', touchMove);
      i.event.bind(element, 'MSPointerUp', touchEnd);
    }
  }
}

module.exports = function (element) {
  if (!_.env.supportsTouch && !_.env.supportsIePointer) {
    return;
  }

  var i = instances.get(element);
  bindTouchHandler(element, i, _.env.supportsTouch, _.env.supportsIePointer);
};

},{"../../lib/helper":6,"../instances":18,"../update-geometry":19,"../update-scroll":20}],17:[function(require,module,exports){
'use strict';

var _ = require('../lib/helper');
var cls = require('../lib/class');
var instances = require('./instances');
var updateGeometry = require('./update-geometry');

// Handlers
var handlers = {
  'click-rail': require('./handler/click-rail'),
  'drag-scrollbar': require('./handler/drag-scrollbar'),
  'keyboard': require('./handler/keyboard'),
  'wheel': require('./handler/mouse-wheel'),
  'touch': require('./handler/touch'),
  'selection': require('./handler/selection')
};
var nativeScrollHandler = require('./handler/native-scroll');

module.exports = function (element, userSettings) {
  userSettings = typeof userSettings === 'object' ? userSettings : {};

  cls.add(element, 'ps-container');

  // Create a plugin instance.
  var i = instances.add(element);

  i.settings = _.extend(i.settings, userSettings);
  cls.add(element, 'ps-theme-' + i.settings.theme);

  i.settings.handlers.forEach(function (handlerName) {
    handlers[handlerName](element);
  });

  nativeScrollHandler(element);

  updateGeometry(element);
};

},{"../lib/class":2,"../lib/helper":6,"./handler/click-rail":10,"./handler/drag-scrollbar":11,"./handler/keyboard":12,"./handler/mouse-wheel":13,"./handler/native-scroll":14,"./handler/selection":15,"./handler/touch":16,"./instances":18,"./update-geometry":19}],18:[function(require,module,exports){
'use strict';

var _ = require('../lib/helper');
var cls = require('../lib/class');
var defaultSettings = require('./default-setting');
var dom = require('../lib/dom');
var EventManager = require('../lib/event-manager');
var guid = require('../lib/guid');

var instances = {};

function Instance(element) {
  var i = this;

  i.settings = _.clone(defaultSettings);
  i.containerWidth = null;
  i.containerHeight = null;
  i.contentWidth = null;
  i.contentHeight = null;

  i.isRtl = dom.css(element, 'direction') === "rtl";
  i.isNegativeScroll = (function () {
    var originalScrollLeft = element.scrollLeft;
    var result = null;
    element.scrollLeft = -1;
    result = element.scrollLeft < 0;
    element.scrollLeft = originalScrollLeft;
    return result;
  })();
  i.negativeScrollAdjustment = i.isNegativeScroll ? element.scrollWidth - element.clientWidth : 0;
  i.event = new EventManager();
  i.ownerDocument = element.ownerDocument || document;

  function focus() {
    cls.add(element, 'ps-focus');
  }

  function blur() {
    cls.remove(element, 'ps-focus');
  }

  i.scrollbarXRail = dom.appendTo(dom.e('div', 'ps-scrollbar-x-rail'), element);
  i.scrollbarX = dom.appendTo(dom.e('div', 'ps-scrollbar-x'), i.scrollbarXRail);
  i.scrollbarX.setAttribute('tabindex', 0);
  i.event.bind(i.scrollbarX, 'focus', focus);
  i.event.bind(i.scrollbarX, 'blur', blur);
  i.scrollbarXActive = null;
  i.scrollbarXWidth = null;
  i.scrollbarXLeft = null;
  i.scrollbarXBottom = _.toInt(dom.css(i.scrollbarXRail, 'bottom'));
  i.isScrollbarXUsingBottom = i.scrollbarXBottom === i.scrollbarXBottom; // !isNaN
  i.scrollbarXTop = i.isScrollbarXUsingBottom ? null : _.toInt(dom.css(i.scrollbarXRail, 'top'));
  i.railBorderXWidth = _.toInt(dom.css(i.scrollbarXRail, 'borderLeftWidth')) + _.toInt(dom.css(i.scrollbarXRail, 'borderRightWidth'));
  // Set rail to display:block to calculate margins
  dom.css(i.scrollbarXRail, 'display', 'block');
  i.railXMarginWidth = _.toInt(dom.css(i.scrollbarXRail, 'marginLeft')) + _.toInt(dom.css(i.scrollbarXRail, 'marginRight'));
  dom.css(i.scrollbarXRail, 'display', '');
  i.railXWidth = null;
  i.railXRatio = null;

  i.scrollbarYRail = dom.appendTo(dom.e('div', 'ps-scrollbar-y-rail'), element);
  i.scrollbarY = dom.appendTo(dom.e('div', 'ps-scrollbar-y'), i.scrollbarYRail);
  i.scrollbarY.setAttribute('tabindex', 0);
  i.event.bind(i.scrollbarY, 'focus', focus);
  i.event.bind(i.scrollbarY, 'blur', blur);
  i.scrollbarYActive = null;
  i.scrollbarYHeight = null;
  i.scrollbarYTop = null;
  i.scrollbarYRight = _.toInt(dom.css(i.scrollbarYRail, 'right'));
  i.isScrollbarYUsingRight = i.scrollbarYRight === i.scrollbarYRight; // !isNaN
  i.scrollbarYLeft = i.isScrollbarYUsingRight ? null : _.toInt(dom.css(i.scrollbarYRail, 'left'));
  i.scrollbarYOuterWidth = i.isRtl ? _.outerWidth(i.scrollbarY) : null;
  i.railBorderYWidth = _.toInt(dom.css(i.scrollbarYRail, 'borderTopWidth')) + _.toInt(dom.css(i.scrollbarYRail, 'borderBottomWidth'));
  dom.css(i.scrollbarYRail, 'display', 'block');
  i.railYMarginHeight = _.toInt(dom.css(i.scrollbarYRail, 'marginTop')) + _.toInt(dom.css(i.scrollbarYRail, 'marginBottom'));
  dom.css(i.scrollbarYRail, 'display', '');
  i.railYHeight = null;
  i.railYRatio = null;
}

function getId(element) {
  return element.getAttribute('data-ps-id');
}

function setId(element, id) {
  element.setAttribute('data-ps-id', id);
}

function removeId(element) {
  element.removeAttribute('data-ps-id');
}

exports.add = function (element) {
  var newId = guid();
  setId(element, newId);
  instances[newId] = new Instance(element);
  return instances[newId];
};

exports.remove = function (element) {
  delete instances[getId(element)];
  removeId(element);
};

exports.get = function (element) {
  return instances[getId(element)];
};

},{"../lib/class":2,"../lib/dom":3,"../lib/event-manager":4,"../lib/guid":5,"../lib/helper":6,"./default-setting":8}],19:[function(require,module,exports){
'use strict';

var _ = require('../lib/helper');
var cls = require('../lib/class');
var dom = require('../lib/dom');
var instances = require('./instances');
var updateScroll = require('./update-scroll');

function getThumbSize(i, thumbSize) {
  if (i.settings.minScrollbarLength) {
    thumbSize = Math.max(thumbSize, i.settings.minScrollbarLength);
  }
  if (i.settings.maxScrollbarLength) {
    thumbSize = Math.min(thumbSize, i.settings.maxScrollbarLength);
  }
  return thumbSize;
}

function updateCss(element, i) {
  var xRailOffset = {width: i.railXWidth};
  if (i.isRtl) {
    xRailOffset.left = i.negativeScrollAdjustment + element.scrollLeft + i.containerWidth - i.contentWidth;
  } else {
    xRailOffset.left = element.scrollLeft;
  }
  if (i.isScrollbarXUsingBottom) {
    xRailOffset.bottom = i.scrollbarXBottom - element.scrollTop;
  } else {
    xRailOffset.top = i.scrollbarXTop + element.scrollTop;
  }
  dom.css(i.scrollbarXRail, xRailOffset);

  var yRailOffset = {top: element.scrollTop, height: i.railYHeight};
  if (i.isScrollbarYUsingRight) {
    if (i.isRtl) {
      yRailOffset.right = i.contentWidth - (i.negativeScrollAdjustment + element.scrollLeft) - i.scrollbarYRight - i.scrollbarYOuterWidth;
    } else {
      yRailOffset.right = i.scrollbarYRight - element.scrollLeft;
    }
  } else {
    if (i.isRtl) {
      yRailOffset.left = i.negativeScrollAdjustment + element.scrollLeft + i.containerWidth * 2 - i.contentWidth - i.scrollbarYLeft - i.scrollbarYOuterWidth;
    } else {
      yRailOffset.left = i.scrollbarYLeft + element.scrollLeft;
    }
  }
  dom.css(i.scrollbarYRail, yRailOffset);

  dom.css(i.scrollbarX, {left: i.scrollbarXLeft, width: i.scrollbarXWidth - i.railBorderXWidth});
  dom.css(i.scrollbarY, {top: i.scrollbarYTop, height: i.scrollbarYHeight - i.railBorderYWidth});
}

module.exports = function (element) {
  var i = instances.get(element);

  i.containerWidth = element.clientWidth;
  i.containerHeight = element.clientHeight;
  i.contentWidth = element.scrollWidth;
  i.contentHeight = element.scrollHeight;

  var existingRails;
  if (!element.contains(i.scrollbarXRail)) {
    existingRails = dom.queryChildren(element, '.ps-scrollbar-x-rail');
    if (existingRails.length > 0) {
      existingRails.forEach(function (rail) {
        dom.remove(rail);
      });
    }
    dom.appendTo(i.scrollbarXRail, element);
  }
  if (!element.contains(i.scrollbarYRail)) {
    existingRails = dom.queryChildren(element, '.ps-scrollbar-y-rail');
    if (existingRails.length > 0) {
      existingRails.forEach(function (rail) {
        dom.remove(rail);
      });
    }
    dom.appendTo(i.scrollbarYRail, element);
  }

  if (!i.settings.suppressScrollX && i.containerWidth + i.settings.scrollXMarginOffset < i.contentWidth) {
    i.scrollbarXActive = true;
    i.railXWidth = i.containerWidth - i.railXMarginWidth;
    i.railXRatio = i.containerWidth / i.railXWidth;
    i.scrollbarXWidth = getThumbSize(i, _.toInt(i.railXWidth * i.containerWidth / i.contentWidth));
    i.scrollbarXLeft = _.toInt((i.negativeScrollAdjustment + element.scrollLeft) * (i.railXWidth - i.scrollbarXWidth) / (i.contentWidth - i.containerWidth));
  } else {
    i.scrollbarXActive = false;
  }

  if (!i.settings.suppressScrollY && i.containerHeight + i.settings.scrollYMarginOffset < i.contentHeight) {
    i.scrollbarYActive = true;
    i.railYHeight = i.containerHeight - i.railYMarginHeight;
    i.railYRatio = i.containerHeight / i.railYHeight;
    i.scrollbarYHeight = getThumbSize(i, _.toInt(i.railYHeight * i.containerHeight / i.contentHeight));
    i.scrollbarYTop = _.toInt(element.scrollTop * (i.railYHeight - i.scrollbarYHeight) / (i.contentHeight - i.containerHeight));
  } else {
    i.scrollbarYActive = false;
  }

  if (i.scrollbarXLeft >= i.railXWidth - i.scrollbarXWidth) {
    i.scrollbarXLeft = i.railXWidth - i.scrollbarXWidth;
  }
  if (i.scrollbarYTop >= i.railYHeight - i.scrollbarYHeight) {
    i.scrollbarYTop = i.railYHeight - i.scrollbarYHeight;
  }

  updateCss(element, i);

  if (i.scrollbarXActive) {
    cls.add(element, 'ps-active-x');
  } else {
    cls.remove(element, 'ps-active-x');
    i.scrollbarXWidth = 0;
    i.scrollbarXLeft = 0;
    updateScroll(element, 'left', 0);
  }
  if (i.scrollbarYActive) {
    cls.add(element, 'ps-active-y');
  } else {
    cls.remove(element, 'ps-active-y');
    i.scrollbarYHeight = 0;
    i.scrollbarYTop = 0;
    updateScroll(element, 'top', 0);
  }
};

},{"../lib/class":2,"../lib/dom":3,"../lib/helper":6,"./instances":18,"./update-scroll":20}],20:[function(require,module,exports){
'use strict';

var instances = require('./instances');

var lastTop;
var lastLeft;

var createDOMEvent = function (name) {
  var event = document.createEvent("Event");
  event.initEvent(name, true, true);
  return event;
};

module.exports = function (element, axis, value) {
  if (typeof element === 'undefined') {
    throw 'You must provide an element to the update-scroll function';
  }

  if (typeof axis === 'undefined') {
    throw 'You must provide an axis to the update-scroll function';
  }

  if (typeof value === 'undefined') {
    throw 'You must provide a value to the update-scroll function';
  }

  if (axis === 'top' && value <= 0) {
    element.scrollTop = value = 0; // don't allow negative scroll
    element.dispatchEvent(createDOMEvent('ps-y-reach-start'));
  }

  if (axis === 'left' && value <= 0) {
    element.scrollLeft = value = 0; // don't allow negative scroll
    element.dispatchEvent(createDOMEvent('ps-x-reach-start'));
  }

  var i = instances.get(element);

  if (axis === 'top' && value >= i.contentHeight - i.containerHeight) {
    // don't allow scroll past container
    value = i.contentHeight - i.containerHeight;
    if (value - element.scrollTop <= 1) {
      // mitigates rounding errors on non-subpixel scroll values
      value = element.scrollTop;
    } else {
      element.scrollTop = value;
    }
    element.dispatchEvent(createDOMEvent('ps-y-reach-end'));
  }

  if (axis === 'left' && value >= i.contentWidth - i.containerWidth) {
    // don't allow scroll past container
    value = i.contentWidth - i.containerWidth;
    if (value - element.scrollLeft <= 1) {
      // mitigates rounding errors on non-subpixel scroll values
      value = element.scrollLeft;
    } else {
      element.scrollLeft = value;
    }
    element.dispatchEvent(createDOMEvent('ps-x-reach-end'));
  }

  if (!lastTop) {
    lastTop = element.scrollTop;
  }

  if (!lastLeft) {
    lastLeft = element.scrollLeft;
  }

  if (axis === 'top' && value < lastTop) {
    element.dispatchEvent(createDOMEvent('ps-scroll-up'));
  }

  if (axis === 'top' && value > lastTop) {
    element.dispatchEvent(createDOMEvent('ps-scroll-down'));
  }

  if (axis === 'left' && value < lastLeft) {
    element.dispatchEvent(createDOMEvent('ps-scroll-left'));
  }

  if (axis === 'left' && value > lastLeft) {
    element.dispatchEvent(createDOMEvent('ps-scroll-right'));
  }

  if (axis === 'top') {
    element.scrollTop = lastTop = value;
    element.dispatchEvent(createDOMEvent('ps-scroll-y'));
  }

  if (axis === 'left') {
    element.scrollLeft = lastLeft = value;
    element.dispatchEvent(createDOMEvent('ps-scroll-x'));
  }

};

},{"./instances":18}],21:[function(require,module,exports){
'use strict';

var _ = require('../lib/helper');
var dom = require('../lib/dom');
var instances = require('./instances');
var updateGeometry = require('./update-geometry');
var updateScroll = require('./update-scroll');

module.exports = function (element) {
  var i = instances.get(element);

  if (!i) {
    return;
  }

  // Recalcuate negative scrollLeft adjustment
  i.negativeScrollAdjustment = i.isNegativeScroll ? element.scrollWidth - element.clientWidth : 0;

  // Recalculate rail margins
  dom.css(i.scrollbarXRail, 'display', 'block');
  dom.css(i.scrollbarYRail, 'display', 'block');
  i.railXMarginWidth = _.toInt(dom.css(i.scrollbarXRail, 'marginLeft')) + _.toInt(dom.css(i.scrollbarXRail, 'marginRight'));
  i.railYMarginHeight = _.toInt(dom.css(i.scrollbarYRail, 'marginTop')) + _.toInt(dom.css(i.scrollbarYRail, 'marginBottom'));

  // Hide scrollbars not to affect scrollWidth and scrollHeight
  dom.css(i.scrollbarXRail, 'display', 'none');
  dom.css(i.scrollbarYRail, 'display', 'none');

  updateGeometry(element);

  // Update top/left scroll to trigger events
  updateScroll(element, 'top', element.scrollTop);
  updateScroll(element, 'left', element.scrollLeft);

  dom.css(i.scrollbarXRail, 'display', '');
  dom.css(i.scrollbarYRail, 'display', '');
};

},{"../lib/dom":3,"../lib/helper":6,"./instances":18,"./update-geometry":19,"./update-scroll":20}]},{},[1]);
