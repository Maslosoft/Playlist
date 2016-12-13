(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

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
      var ad, adapter, currentLink, first, i, initScroller, j, len, len1, link, linkElement, links, playlistHolder, playlistWrapper, ref, src;
      links = this.extractor.getData(this.element);
      this.element.html("<div class='maslosoft-video-embed-wrapper'> <div class='maslosoft-video-embed-container'> " + frameTemplate + " </div> </div>");
      this.playlist = jQuery('<div class="maslosoft-video-playlist" />');
      this.frame = this.element.find('iframe');
      this.frame.prop('id', this.frameId);
      first = true;
      for (i = 0, len = links.length; i < len; i++) {
        link = links[i];
        ref = this.adapters;
        for (j = 0, len1 = ref.length; j < len1; j++) {
          adapter = ref[j];
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
      var i, index, l, len, ref;
      link = link[0];
      ref = this.links;
      for (index = i = 0, len = ref.length; i < len; index = ++i) {
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
      var i, len, name, option;
      if (options == null) {
        options = [];
      }
      this.adapters = new Array;
      for (name = i = 0, len = options.length; i < len; name = ++i) {
        option = options[name];
        this[name] = option;
      }
      if (!this.adapters.length) {
        this.adapters = [Maslosoft.Playlist.Adapters.YouTube, Maslosoft.Playlist.Adapters.Vimeo, Maslosoft.Playlist.Adapters.Dailymotion];
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

  this.Maslosoft.Playlist.Adapters.Dailymotion = (function(superClass) {
    var apiready, init, ready;

    extend(Dailymotion, superClass);

    function Dailymotion() {
      this.setOnEndCallback = bind(this.setOnEndCallback, this);
      this.getSrc = bind(this.getSrc, this);
      return Dailymotion.__super__.constructor.apply(this, arguments);
    }

    ready = false;

    apiready = false;

    init = jQuery.noop;

    Dailymotion.prototype.endCallback = null;

    Dailymotion.match = function(url) {
      return url.match('dailymotion');
    };

    Dailymotion.once = function() {
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

    Dailymotion.prototype.setUrl = function(url1) {
      var part;
      this.url = url1;
      part = this.url.replace(/.+?\//g, '');
      return this.id = part.replace(/_.+/g, '');
    };

    Dailymotion.prototype.getSrc = function(frame1) {
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

    Dailymotion.prototype.setThumb = function(thumbCallback) {
      var url;
      url = "//www.dailymotion.com/thumbnail/video/" + this.id;
      return thumbCallback(url);
    };

    Dailymotion.prototype.play = function(frame1) {
      this.frame = frame1;
      this.call('play');
      return this.playing = true;
    };

    Dailymotion.prototype.stop = function(frame1) {
      this.frame = frame1;
      this.call('pause');
      return this.playing = false;
    };

    Dailymotion.prototype.pause = function(frame1) {
      this.frame = frame1;
      this.call('pause');
      return this.playing = false;
    };

    Dailymotion.prototype.setOnEndCallback = function(frame1, callback) {
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

    Dailymotion.prototype.call = function(func, args) {
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

    return Dailymotion;

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
      var i, len, name, option;
      if (options == null) {
        options = [];
      }
      for (name = i = 0, len = options.length; i < len; name = ++i) {
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
      var d, data, i, len, link, ref;
      data = [];
      ref = element.find('a');
      for (i = 0, len = ref.length; i < len; i++) {
        link = ref[i];
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
      this.element = this.iframe;
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
      var callback, data, e, eventData, method, params, target_id, value;
      data = void 0;
      method = void 0;
      try {
        data = JSON.parse(event.data);
        method = data.event || data.method;
      } catch (_error) {
        e = _error;
      }
      if (method.match('ready' && !isReady)) {
        isReady = true;
      }
      console.log(event.origin);
      if (this.adapter.match(event.origin)) {
        return false;
      }
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
    	 * event for that iframe.
    	 *
    	 * @param eventName (String): Name of the event. Eg. api_onPlay
    	 * @param callback (Function): Function that should get executed when the
    	 * event is fired.
    	 * @param target_id (String) [Optional]: If handling more than one iframe then
    	 * it stores the different callbacks for different iframes based on the iframe's
    	 * id.
     */

    Messenger.prototype.storeCallback = function(eventName, callback, target_id) {
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
      if (target_id) {
        return eventCallbacks[target_id][eventName];
      } else {
        return eventCallbacks[eventName];
      }
    };

    Messenger.prototype.removeCallback = function(eventName, target_id) {
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
