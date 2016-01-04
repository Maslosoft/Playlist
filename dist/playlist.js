(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  if (!this.Maslosoft) {
    this.Maslosoft = {};
  }

  this.Maslosoft.Playlist = (function() {
    var element, frameId, id, links, playlistLinks;

    Playlist.idCounter = 0;

    Playlist.once = false;

    id = '';

    frameId = '';

    element = null;

    playlistLinks = null;

    links = null;

    Playlist.prototype.adapters = [];

    Playlist.prototype.extractor = null;

    function Playlist(element, options) {
      var adapter, i, len, ref;
      if (options == null) {
        options = null;
      }
      this.options = new Maslosoft.Playlist.Options(options);
      this.adapters = this.options.adapters;
      if (!Playlist.once) {
        ref = this.adapters;
        for (i = 0, len = ref.length; i < len; i++) {
          adapter = ref[i];
          adapter.once(this);
        }
        Playlist.once = true;
      }
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
      var ad, adapter, first, i, j, len, len1, link, linkElement, ref;
      links = this.extractor.getData(this.element);
      this.element.html('<div class="maslosoft-video-embed-wrapper"> <div class="maslosoft-video-embed-container"> <iframe src="" frameborder="" webkitAllowFullScreen mozallowfullscreen allowFullScreen scrolling="no" allowtransparency="true"></iframe> </div> </div>');
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
              this.current = ad;
              this.frame.prop('src', ad.getSrc(this.frame));
              linkElement.addClass('active');
              first = false;
            }
          }
        }
      }
      this.element.append(this.playlist);
      this.links = this.playlist.find('a');
      if (typeof jQuery.fn.tooltip === 'function') {
        return jQuery("#" + this.id).tooltip({
          selector: 'a',
          placement: 'left'
        });
      }
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
          var loaded;
          if (typeof jQuery.fn.tooltip === 'function') {
            link.tooltip('hide');
          }
          loaded = true;
          if (adapter !== _this.current) {
            _this.current = adapter;
            loaded = false;
            _this.frame.prop('src', adapter.getSrc(_this.frame));
          }
          if (!loaded) {
            _this.frame.one('load', function(e) {
              adapter.play(_this.frame);
              adapter.onEnd(_this.frame, function() {
                return _this.next(link);
              });
              _this.links.removeClass('active playing');
              if (adapter.isPlaying()) {
                return link.addClass('active playing');
              }
            });
          }
          if (loaded) {
            if (adapter.isPlaying()) {
              adapter.pause(_this.frame);
            } else {
              adapter.play(_this.frame);
              adapter.onEnd(_this.frame, function() {
                return _this.next(link);
              });
            }
          }
          link.addClass('active');
          if (adapter.isPlaying()) {
            link.addClass('playing');
          } else {
            link.removeClass('playing');
          }
          return e.preventDefault();
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
        this.adapters = [Maslosoft.Playlist.Adapters.YouTube, Maslosoft.Playlist.Adapters.Vimeo];
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

    Abstract.prototype.id = '';

    Abstract.prototype.linkId = '';

    Abstract.prototype.url = '';

    Abstract.prototype.frame = null;

    Abstract.prototype.playing = false;

    title = '';

    function Abstract() {
      Abstract.idCounter++;
      this.linkId = "maslosoft-playlist-link-" + Abstract.idCounter;
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

    Abstract.prototype.getSrc = function(frame) {
      this.frame = frame;
    };

    Abstract.prototype.isPlaying = function() {
      return this.playing;
    };

    Abstract.prototype.onEnd = function(frame, event) {
      this.frame = frame;
    };

    Abstract.prototype.play = function(frame) {
      this.frame = frame;
    };

    Abstract.prototype.stop = function(frame) {
      this.frame = frame;
    };

    Abstract.prototype.pause = function(frame) {
      this.frame = frame;
    };

    return Abstract;

  })();

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

    Vimeo.once = function(playlist) {
      var script;
      script = document.createElement("script");
      script.type = "text/javascript";
      script.src = "//f.vimeocdn.com/js/froogaloop2.min.js";
      return jQuery('head').append(script);
    };

    Vimeo.prototype.setUrl = function(url1) {
      this.url = url1;
      return this.id = this.url.replace(/.+\//, '');
    };

    Vimeo.prototype.getSrc = function(frame) {
      this.frame = frame;
      return "//player.vimeo.com/video/" + this.id + "?api=1&player_id=" + this.frame;
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

    Vimeo.prototype.play = function(frame) {
      this.frame = frame;
      this.call('play');
      return this.playing = true;
    };

    Vimeo.prototype.stop = function(frame) {
      this.frame = frame;
      this.call('unload');
      return this.playing = false;
    };

    Vimeo.prototype.pause = function(frame) {
      this.frame = frame;
      this.call('pause');
      return this.playing = false;
    };

    Vimeo.prototype.onEnd = function(frame, callback) {
      var frameId, iframe, player;
      this.frame = frame;
      frameId = this.frame.get(0).id;
      iframe = document.getElementById(frameId);
      player = Froogaloop(iframe);
      console.log('Init Froogaloop... ');
      return player.addEvent('ready', (function(_this) {
        return function() {
          player.addEvent('finish', callback);
          return player.addEvent('playProgress', function(data) {
            return console.log(data.seconds);
          });
        };
      })(this));
    };

    Vimeo.prototype.call = function(func, args) {
      var data, frameId, iframe, result;
      if (args == null) {
        args = [];
      }
      console.log("Call " + func);
      frameId = this.frame.get(0).id;
      iframe = document.getElementById(frameId);
      data = {
        "method": func,
        "value": args
      };
      return result = iframe.contentWindow.postMessage(JSON.stringify(data), "*");
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

    YouTube.once = function(playlist) {
      var script;
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

    YouTube.prototype.getSrc = function(frame) {
      this.frame = frame;
      return "//www.youtube.com/embed/" + this.id + "?enablejsapi=1";
    };

    YouTube.prototype.play = function(frame) {
      this.frame = frame;
      this.call('playVideo');
      return this.playing = true;
    };

    YouTube.prototype.stop = function(frame) {
      this.frame = frame;
      this.call('stopVideo');
      return this.playing = false;
    };

    YouTube.prototype.pause = function(frame) {
      this.frame = frame;
      this.call('pauseVideo');
      return this.playing = false;
    };

    YouTube.prototype.onEnd = function(frame, callback) {
      var onStateChange, player;
      this.frame = frame;
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
      var data, frameId, iframe, result;
      if (args == null) {
        args = [];
      }
      frameId = this.frame.get(0).id;
      iframe = document.getElementById(frameId);
      data = {
        "event": "command",
        "func": func,
        "args": args,
        "id": frameId
      };
      return result = iframe.contentWindow.postMessage(JSON.stringify(data), "*");
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

}).call(this);

//# sourceMappingURL=playlist.js.map
