(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  if (!this.Maslosoft) {
    this.Maslosoft = {};
  }

  this.Maslosoft.Playlist = (function() {
    var element, frameId, id, links, playlistLinks, videos;

    Playlist.idCounter = 0;

    id = '';

    frameId = '';

    element = null;

    playlistLinks = null;

    links = null;

    videos = [];

    function Playlist(element, adapters, options) {
      this.adapters = adapters != null ? adapters : null;
      this.options = options != null ? options : null;
      if (!this.options) {
        this.options = {};
      }
      if (!this.adapters) {
        this.adapters = [Maslosoft.Playlist.Adapters.YouTube, Maslosoft.Playlist.Adapters.Vimeo];
      }
      this.element = jQuery(element);
      if (this.element.id) {
        this.id = this.element.id;
      } else {
        this.id = 'maslosoftVideoPlayer' + VideoPlayer.idCounter++;
        this.element.prop('id', this.id);
      }
      this.frameId = this.id + "Frame";
      this.build();
    }

    Playlist.prototype.build = function() {
      var ad, adapter, first, i, j, len, len1, link, linkElement, ref;
      links = this.element.find('a');
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
          if (adapter.match(link.href)) {
            ad = new adapter;
            ad.setUrl(link.href);
            ad.setTitle(link.innerHTML);
            linkElement = this.createLink(ad);
            if (first) {
              this.current = ad;
              this.frame.prop('src', ad.getSrc());
              linkElement.addClass('active');
              first = false;
            }
          }
        }
      }
      this.element.append(this.playlist);
      return this.links = this.playlist.find('a');
    };

    Playlist.prototype.createLink = function(adapter) {
      var caption, link, thumb;
      thumb = jQuery('<img />');
      adapter.setThumb(thumb);
      thumb.prop('alt', adapter.getTitle());
      caption = jQuery('<div class="caption"/>');
      caption.html(adapter.getTitle());
      link = jQuery('<a />');
      link.prop('title', adapter.getTitle());
      link.prop('href', adapter.getUrl());
      link.html(thumb);
      link.on('click', (function(_this) {
        return function(e) {
          var loaded;
          loaded = true;
          if (!_this.frame.prop('src').replace('?', 'X').match(adapter.getSrc().replace('?', 'X'))) {
            _this.current = adapter;
            loaded = false;
            _this.frame.prop('src', adapter.getSrc());
          }
          if (!loaded) {
            _this.frame.one('load', function(e) {
              _this.links.removeClass('active playing');
              adapter.play(_this.frame);
              if (adapter.isPlaying()) {
                link.addClass('active playing');
              }
              return console.log('player loaded for: ' + adapter.getTitle());
            });
          }
          if (loaded) {
            if (adapter.isPlaying()) {
              adapter.pause(_this.frame);
            } else {
              adapter.play(_this.frame);
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

  if (!this.Maslosoft.Playlist.Adapters) {
    this.Maslosoft.Playlist.Adapters = {};
  }

  this.Maslosoft.Playlist.Adapters.Abstract = (function() {
    var title;

    function Abstract() {}

    Abstract.prototype.id = '';

    Abstract.prototype.url = '';

    Abstract.prototype.frame = null;

    Abstract.prototype.playing = false;

    title = '';

    Abstract.match = function(url) {};

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

    Abstract.prototype.setThumb = function(thumb) {};

    Abstract.prototype.getSrc = function() {};

    Abstract.prototype.isPlaying = function() {
      return this.playing;
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

  this.Maslosoft.Playlist.Adapters.YouTube = (function(superClass) {
    extend(YouTube, superClass);

    function YouTube() {
      return YouTube.__super__.constructor.apply(this, arguments);
    }

    YouTube.match = function(url) {
      return url.match('youtube');
    };

    YouTube.prototype.setUrl = function(url1) {
      this.url = url1;
      return this.id = this.url.replace(/.+?v=/, '');
    };

    YouTube.prototype.setThumb = function(thumb) {
      return thumb.prop('src', "//img.youtube.com/vi/" + this.id + "/0.jpg");
    };

    YouTube.prototype.getSrc = function() {
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

    YouTube.prototype.call = function(func, args) {
      var data, frameId, iframe, result;
      if (args == null) {
        args = [];
      }
      frameId = this.frame.get(0).id;
      iframe = document.getElementById(frameId);
      console.log(iframe);
      data = {
        "event": "command",
        "func": func,
        "args": args,
        "id": frameId
      };
      console.log(data);
      result = iframe.contentWindow.postMessage(JSON.stringify(data), "*");
      return console.log(result);
    };

    return YouTube;

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
      console.log('vimeo');
      return url.match('vimeo');
    };

    Vimeo.prototype.setUrl = function(url1) {
      this.url = url1;
      this.id = this.url.replace(/.+\//, '');
      return console.log(this.id);
    };

    Vimeo.prototype.getSrc = function() {
      return "//player.vimeo.com/video/" + this.id + "?enablejsapi=1";
    };

    Vimeo.prototype.setThumb = function(thumb) {
      return $.ajax({
        type: 'GET',
        url: '//vimeo.com/api/v2/video/' + this.id + '.json',
        jsonp: 'callback',
        dataType: 'jsonp',
        success: (function(_this) {
          return function(data) {
            var thumbnail_src;
            thumbnail_src = data[0].thumbnail_large;
            return thumb.prop('src', thumbnail_src);
          };
        })(this)
      });
    };

    Vimeo.prototype.play = function(frame) {
      this.frame = frame;
      this.call('playVideo');
      return this.playing = true;
    };

    Vimeo.prototype.stop = function(frame) {
      this.frame = frame;
      this.call('stopVideo');
      return this.playing = false;
    };

    Vimeo.prototype.pause = function(frame) {
      this.frame = frame;
      this.call('pauseVideo');
      return this.playing = false;
    };

    Vimeo.prototype.call = function(func, args) {
      if (args == null) {
        args = [];
      }
    };

    return Vimeo;

  })(this.Maslosoft.Playlist.Adapters.Abstract);

}).call(this);

//# sourceMappingURL=playlist.js.map
