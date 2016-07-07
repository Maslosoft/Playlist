if not @Maslosoft
	@Maslosoft = {}

class @Maslosoft.Playlist

	@idCounter = 0

	id = ''

	frameId = ''

	element = null

	playlistLinks = null

	links = null

	#
	# Video adapters
	# @var Maslosoft.Playlist.Adapters.Abstract[]
	#
	adapters: []

	#
	# Data extractor
	# @var Maslosoft.Extractors.Abstract
	#
	extractor: null

	constructor: (element, options = null) ->

		@options = new Maslosoft.Playlist.Options options

		# Set adapters from options
		@adapters = @options.adapters

		# Set extractor
		@extractor = new @options.extractor

		# Setup main container
		@element = jQuery element
		if @element.id
			@id = @element.id
		else
			@id = 'maslosoftPlaylist' + Playlist.idCounter++
			@element.prop 'id' , @id

		@frameId = "#{@id}Frame"

		# Build player and playlist
		@build();


	build:() ->

		# Collect videos
		links = @extractor.getData @element

		# Build wrappers
		@element.html(
			'<div class="maslosoft-video-embed-wrapper">
				<div class="maslosoft-video-embed-container">
					<iframe src="" frameborder="" webkitAllowFullScreen mozallowfullscreen allowFullScreen scrolling="no" allowtransparency="true"></iframe>
				</div>
			</div>'
		)

		# Select playlist
		@playlist = jQuery '<div class="maslosoft-video-playlist" />'

		@frame = @element.find 'iframe'
		@frame.prop 'id', @frameId

		first = true
		for link in links
			for adapter in @adapters

				# Check if can be used with current link
				if adapter.match link.url

					# Init adapter
					ad = new adapter
					ad.setUrl link.url
					ad.setTitle link.title

					# Make link in playlist
					linkElement = @createLink ad

					# Setup initial movie
					if first
						currentLink = linkElement
						@current = ad
						@frame.prop 'src', ad.getSrc(@frame)
						@frame.one 'load', (e) =>
							# Attach event on playback of current video finish
							ad.onEnd @frame, () =>
								@next(currentLink)

						linkElement.addClass 'active'
						first = false

		# Playlist wrapper for proper table display and scroll holder
		playlistWrapper = jQuery '<div class="maslosoft-video-playlist-wrapper"></div>'
		playlistHolder = jQuery '<div class="maslosoft-video-playlist-holder"></div>'
		playlistHolder.append(@playlist)
		playlistWrapper.append(playlistHolder)
		@element.append playlistWrapper

		# Links after build, not those which could be used as video sources
		@links = @playlist.find 'a'

		# Tooltip option (bootstrap only)
		if typeof(jQuery.fn.tooltip) is 'function'

			# Apply only to selected playlist
			jQuery("##{@id}").tooltip({
				selector: 'a'
				placement: 'left'
			});

		initScroller = (e) =>
			new Maslosoft.Playlist.Helpers.Scroller(@element, @playlist)
			
		# Re calculate scroller for ajax loaded content
		@frame.on 'load', initScroller
			
		jQuery(window).on 'resize', initScroller
			
		initScroller()
		return true

	# Sloopy next handling
	next: (link) ->
		link = link[0]
		# Get next adapter
		for l, index in @links
			if link.id is l.id
				break
		index++

		# No more media on playlist
		if not @links[index]
			console.log 'No more videos'
			@links.removeClass 'active playing'
			# Activate first one
			if @links.get(0)
				jQuery(@links.get(0)).addClass 'active'
			return

		link = @links[index]
		link.click()


	createLink: (adapter) ->

		# Create caption
		caption = jQuery '<div class="caption"/>'
		caption.html adapter.getTitle()

		# Create link
		link = jQuery '<a />'
		link.attr 'id', adapter.linkId
		link.attr 'title', adapter.getTitle()
		link.attr 'href', adapter.getUrl()
		link.attr 'rel', 'tooltip'
		link.attr 'data-placement', 'left'
		link.attr 'data-html', true

		thumbCallback = (src) ->
			link.css 'background-image', "url('#{src}')"
			link.attr 'title', adapter.getTitle()
		adapter.setThumb(thumbCallback)

		link.html '<i></i>'
		# TODO Style caption
#		link.append caption

		# Some workarounds for mouseout
		link.on 'mouseout', (e) =>
			# Hide tooltip to prevent it staying above video
			if typeof(jQuery.fn.tooltip) is 'function'
				link.tooltip 'hide'

		# Play on click
		link.on 'click', (e) =>

			# Hide tooltip to prevent it staying above video
			if typeof(jQuery.fn.tooltip) is 'function'
				link.tooltip 'hide'

			# Load source if not already loaded
			loaded = true
			if adapter isnt @current
				@current = adapter
				loaded = false
				@frame.prop 'src', adapter.getSrc(@frame)



			# Play when player is loaded into iframe
			if not loaded
				@frame.one 'load', (e) =>
					
					# Play media
					adapter.play @frame

					# Attach event on playback of current video finish

					adapter.onEnd @frame, () =>
						@next(link)

					# Attach some decorations
					@links.removeClass 'active playing'
					if adapter.isPlaying()
						link.addClass 'active playing'

			# Play or stop when player is loaded
			if loaded
				if adapter.isPlaying()
					adapter.pause @frame
				else
					adapter.play @frame
					adapter.onEnd @frame, () =>
						@next(link)

			# Add some styling
			link.addClass 'active'
			if adapter.isPlaying()
				link.addClass 'playing'
			else
				link.removeClass 'playing'

			# Prevent mouse click
			e.preventDefault()


		@playlist.append link
		return link


class @Maslosoft.Playlist.Options

	#
	# Video adapters
	# @var Maslosoft.Playlist.Adapters.Abstract[]
	#
	adapters: []

	extractor: null

	constructor: (options = []) ->
		@adapters = new Array
		for option, name in options
			@[name] = option
		if not @adapters.length
			@adapters = [
				Maslosoft.Playlist.Adapters.YouTube
				Maslosoft.Playlist.Adapters.Vimeo
			]
		if not @extractor
			@extractor = Maslosoft.Playlist.Extractors.LinkExtractor

if not @Maslosoft.Playlist.Adapters
	@Maslosoft.Playlist.Adapters = {}

#
# Any adapter class should imlement theese class methods
#
class @Maslosoft.Playlist.Adapters.Abstract

	@idCounter: 0

	#
	# Initialized adapters array
	# @var bool[]
	#
	@initialized: {}

	#
	# Video id
	# @var string
	#
	id: ''

	#
	# Internal link id
	# @var string
	#
	linkId: ''

	#
	# Base media URL
	# @var string
	#
	url: ''

	#
	# jQuery's frame object
	# @var jQuery
	#
	frame: null

	#
	# Whenever player is playing
	# @var bool
	#
	playing: false

	#
	# Movie title
	# @var string
	#
	title = ''


	constructor: () ->
		Abstract.idCounter++
		@linkId = "maslosoft-playlist-link-#{Abstract.idCounter}"

		id = @constructor.name
		if not Abstract.initialized[id]
			Maslosoft.Playlist.Adapters[id].once()
			Abstract.initialized[id] = true


	#
	# Return true if this adapter can handle URL
	# @return bool True if this adapter can handle URL
	#
	@match = (url) ->

	#
	# This is called once per adapter type. Can be used to include external
	# libraries etc.
	# @param Maslosoft.Playlist playlist instance
	#
	@once: (playlist) ->


	#
	# Set url provided by user
	# @param string url Embaddable media url
	#
	setUrl: (@url) ->

	getUrl: () ->
		return @url

	#
	# Set title
	#
	setTitle: (title) ->
		@title = title

	#
	# Get title
	#
	getTitle: () ->
		return @title


	#
	# Set preview, or thumb for embeddable media
	# @param function thumbCallback Callback to set thumbnail image
	#
	setThumb: (thumbCallback) ->

	#
	# Get iframe src. This should return embbedable media iframe ready URL
	#
	#
	getSrc: (@frame) ->

	isPlaying: () ->
		return @playing

	#
	# Attach event on movie finish
	# @param function Event to attach at move stop
	#
	onEnd: (@frame, event) ->


	#
	# Play embeddable media
	#
	play: (@frame) ->

	stop: (@frame) ->

	pause: (@frame) ->

if not @Maslosoft.Playlist.Adapters
	@Maslosoft.Playlist.Adapters = {}

class @Maslosoft.Playlist.Adapters.Vimeo extends @Maslosoft.Playlist.Adapters.Abstract

	@match: (url) ->
		return url.match('vimeo')

	#
	# This is called once per adapter type. Can be used to include external
	# libraries etc.
	#
	@once: () ->
		# Include froogaloop2 library for easier events
		if typeof(Froogaloop) isnt 'undefined' then return
		script = document.createElement("script")
		script.type = "text/javascript"
		script.src = "//f.vimeocdn.com/js/froogaloop2.min.js"
		jQuery('head').append(script)

	#
	# @param string url Embaddable media url
	#
	setUrl: (@url) ->
		@id = @url.replace(/.+\//, '')

	#
	# Get iframe src. This should return embbedable media iframe ready URL
	#
	#
	getSrc: (@frame) ->
		frameId = @frame.get(0).id
		return "//player.vimeo.com/video/#{@id}?api=1&player_id=#{frameId}"

	#
	# Set preview, or thumb for embaddable media
	# @param function thumbCallback Img element
	#
	setThumb: (thumbCallback) ->
		# Get thumb
		# http://stackoverflow.com/a/8616607
		$.ajax({
			type:'GET'
			url: '//vimeo.com/api/v2/video/' + @id + '.json'
			jsonp: 'callback'
			dataType: 'jsonp'
			success: (data) =>
				if not @title
					@setTitle data[0].title
				thumbCallback data[0].thumbnail_large
		})

	#
	# Play vimeo movie
	#
	play: (@frame) ->
		@call 'play'
		@playing = true

	#
	# Stop vimeo movie
	#
	stop: (@frame) ->
		@call 'unload'
		@playing = false

	#
	# Pause vimeo movie
	#
	pause: (@frame) ->
		@call 'pause'
		@playing = false

	#
	# On stop event
	# @param object Iframe object
	# @param function Function to call after finish
	#
	onEnd: (@frame, callback) ->
		# Try, try, try and still..., hate this
		try
			player = Froogaloop @frame.get(0)
			# console.log 'Init Froogaloop... '
			try
				player.addEvent 'ready', () =>
					player.addEvent 'finish', callback
					# player.addEvent 'playProgress', (data) ->
					# 	console.log data.seconds
			catch e
			try
				player.addEvent 'finish', callback
				# player.addEvent 'playProgress', (data) ->
				# 	console.log data.seconds
			catch e
		catch e

	#
	# Vimeo specific methods
	# @param function Function name to call on player
	# @param mixed Optional arguments
	#
	call: (func, args = []) ->
		console.log "Call #{func}"
		frameId = @frame.get(0).id
		iframe = document.getElementById(frameId)
		data = {
			"method": func,
			"value": args
		}
		result = iframe.contentWindow.postMessage(JSON.stringify(data), "*")

if not @Maslosoft.Playlist.Adapters
	@Maslosoft.Playlist.Adapters = {}

class @Maslosoft.Playlist.Adapters.YouTube extends @Maslosoft.Playlist.Adapters.Abstract

	#
	# Return true if this adapter can handle URL
	# @return bool True if this adapter can handle URL
	#
	@match: (url) ->
		return url.match('youtube')

	#
	# This is called once per adapter type. Can be used to include external
	# libraries etc.
	#
	@once: () ->
		# Include YouTube library
		if typeof(YT) isnt 'undefined' then return
		script = document.createElement("script")
		script.type = "text/javascript"
		script.src = "https://www.youtube.com/player_api"
		jQuery('head').append(script)

	#
	# @param srting url Embaddable media url
	#
	setUrl: (@url) ->
		@id = @url.replace(/.+?v=/, '')

	#
	# Set preview, or thumb for embaddable media
	# @param function thumbCallback Callback to set video thumbnail
	#
	setThumb: (thumbCallback) ->
		thumbCallback "//img.youtube.com/vi/#{@id}/0.jpg"

	#
	# Get iframe src. This should return embbedable media iframe ready URL
	#
	#
	getSrc: (@frame) ->
		return "//www.youtube.com/embed/#{@id}?enablejsapi=1"

	#
	# Play embeddable media
	#
	play: (@frame) ->
		@call 'playVideo'
		@playing = true

	stop: (@frame) ->
		@call 'stopVideo'
		@playing = false

	pause: (@frame) ->
		@call 'pauseVideo'
		@playing = false

	onEnd: (@frame, callback) =>
		onStateChange = (e) ->
			if e.data is 0
				callback()

		player = new YT.Player(@frame.get(0).id, {
	        height: '390',
        	width: '640',
        	videoId: @id,
        	events: {
            	'onStateChange': onStateChange
        	}
        })
	#
	# Youtube specific methods
	#
	call: (func, args = []) ->
		frameId = @frame.get(0).id
		iframe = document.getElementById(frameId);
		data = {
			"event": "command",
			"func": func,
			"args": args,
			"id": frameId
		}
		result = iframe.contentWindow.postMessage(JSON.stringify(data), "*")

if not @Maslosoft.Playlist.Data
	@Maslosoft.Playlist.Data = {}

class @Maslosoft.Playlist.Data.Video

	constructor: (options = []) ->
		for option, name in options
			@[name] = option

	title: ''
	url: ''

if not @Maslosoft.Playlist.Extractors
	@Maslosoft.Playlist.Extractors = {}

class @Maslosoft.Playlist.Extractors.Abstract

	getData: (element) ->

if not @Maslosoft.Playlist.Extractors
	@Maslosoft.Playlist.Extractors = {}

class @Maslosoft.Playlist.Extractors.LinkExtractor

	getData: (element) ->
		data = []
		for link in element.find 'a'
			d = new Maslosoft.Playlist.Data.Video
			d.url = link.href
			d.title = link.innerHTML
			data.push d
		return data

if not @Maslosoft.Playlist.Helpers
	@Maslosoft.Playlist.Helpers = {}

class @Maslosoft.Playlist.Helpers.Scroller

	#
	# Holder element instance
	# @var jQuery
	#
	@holder: null

	#
	# Playlist element instance
	# @var jQuery
	#
	@playlist: null

	constructor: (element, @playlist) ->
		applyHeight = () =>
			frame = element.find('.maslosoft-video-embed-container iframe')
			@holder = @playlist.parent()
			console.log frame.height()
			@holder.height(frame.height())
			@holder.css('overflowY': 'auto')
		setTimeout applyHeight, 0
