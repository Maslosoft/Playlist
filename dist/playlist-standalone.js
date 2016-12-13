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

    Playlist.prototype.msg = null;

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
      this.msg = new Maslosoft.Playlist.Helpers.Messenger(this.frame);
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

    Abstract.parseEventData = function(rawData) {
      return JSON.parse(rawData);
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

  this.Maslosoft.Playlist.DailymotionOld = (function(superClass) {
    var apiready, init, ready;

    extend(DailymotionOld, superClass);

    function DailymotionOld() {
      this.setOnEndCallback = bind(this.setOnEndCallback, this);
      this.getSrc = bind(this.getSrc, this);
      return DailymotionOld.__super__.constructor.apply(this, arguments);
    }

    ready = false;

    apiready = false;

    init = jQuery.noop;

    DailymotionOld.prototype.endCallback = null;

    DailymotionOld.match = function(url) {
      return url.match('dailymotion');
    };

    DailymotionOld.once = function() {
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

    DailymotionOld.prototype.setUrl = function(url1) {
      var part;
      this.url = url1;
      part = this.url.replace(/.+?\//g, '');
      return this.id = part.replace(/_.+/g, '');
    };

    DailymotionOld.prototype.getSrc = function(frame1) {
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

    DailymotionOld.prototype.setThumb = function(thumbCallback) {
      var url;
      url = "//www.dailymotion.com/thumbnail/video/" + this.id;
      return thumbCallback(url);
    };

    DailymotionOld.prototype.play = function(frame1) {
      this.frame = frame1;
      this.call('play');
      return this.playing = true;
    };

    DailymotionOld.prototype.stop = function(frame1) {
      this.frame = frame1;
      this.call('pause');
      return this.playing = false;
    };

    DailymotionOld.prototype.pause = function(frame1) {
      this.frame = frame1;
      this.call('pause');
      return this.playing = false;
    };

    DailymotionOld.prototype.setOnEndCallback = function(frame1, callback) {
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

    DailymotionOld.prototype.call = function(func, args) {
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

    return DailymotionOld;

  })(this.Maslosoft.Playlist.Adapters.Abstract);

  if (!this.Maslosoft.Playlist.Adapters) {
    this.Maslosoft.Playlist.Adapters = {};
  }

  this.Maslosoft.Playlist.Adapters.Dailymotion = (function(superClass) {
    var apiready, init, ready;

    extend(Dailymotion, superClass);

    function Dailymotion() {
      this.onEnd = bind(this.onEnd, this);
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

    Dailymotion.parseEventData = function(rawData) {
      return parseQueryString(rawData);
    };

    Dailymotion.once = function() {};

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
      params = ['endscreen-enable=0', 'api=postMessage', 'autoplay=0', "id=" + frameId, "origin=" + document.location.protocol + "//" + document.location.hostname];
      src = ("https://www.dailymotion.com/embed/video/" + this.id + "?") + params.join('&');
      return src;
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

    Dailymotion.prototype.onEnd = function(frame1, callback) {
      var name, onMsg;
      this.frame = frame1;
      onMsg = function(e, data) {
        console.log("onEnd Dailymotion");
        return callback();
      };
      name = "message.maslosoft.playlist.dailymotion.end";
      return this.frame.on(name, onMsg);
    };

    Dailymotion.prototype.call = function(func, args) {
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
      var infoDelivery, name, onStateChange, player;
      this.frame = frame1;
      player = new YT.Player(this.frame.get(0).id, {
        height: '390',
        width: '640',
        videoId: this.id,
        events: {
          'onStateChange': jQuery.noop
        }
      });
      onStateChange = function(e, data) {
        if (data.info === 0) {
          return callback();
        }
      };
      name = "message.maslosoft.playlist.youtube.onStateChange";
      this.frame.on(name, onStateChange);
      infoDelivery = (function(_this) {
        return function(e, data) {
          if (data.info.currentTime === data.info.duration) {
            return _this.playing = false;
          }
        };
      })(this);
      name = "message.maslosoft.playlist.youtube.infoDelivery";
      return this.frame.on(name, infoDelivery);
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
    Messenger.prototype.frame = null;

    Messenger.prototype.element = null;

    function Messenger(frame1) {
      this.frame = frame1;
      this.onMessage = bind(this.onMessage, this);
      this.element = this.frame.get(0);
      if (window.addEventListener) {
        window.addEventListener('message', this.onMessage, false);
      } else {
        window.attachEvent('onmessage', this.onMessage);
      }
    }

    Messenger.prototype.onMessage = function(event) {
      var adapter, data, name, ns, parsedData, ref;
      if (this.frame.get(0).contentWindow !== event.source) {
        return;
      }
      ref = Maslosoft.Playlist.Adapters;
      for (name in ref) {
        adapter = ref[name];
        if (adapter.match(event.origin)) {
          parsedData = adapter.parseEventData(event.data);
          data = [parsedData];
          ns = "message.maslosoft.playlist." + (name.toLowerCase());
          ns = ns + "." + parsedData.event;
          console.log(ns);
          this.frame.trigger(ns, data);
          return;
        }
      }
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
