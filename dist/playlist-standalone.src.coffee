mixin = Maslosoft.Sugar.mixin
implement = Maslosoft.Sugar.implement
abstract = Maslosoft.Sugar.abstract

parseQueryString = (queryString) ->
	query = queryString.split '&'
	result = {}
	i = 0
	while i < query.length
		part = query[i].split('=', 2)
		if part.length == 1
			result[part[0]] = ''
		else
			result[part[0]] = decodeURIComponent(part[1].replace(/\+/g, ' '))
		++i
	result

isFunction = (obj) ->
	!!(obj and obj.constructor and obj.call and obj.apply)

isArray = (obj) ->
	toString.call(obj) == '[object Array]'
if not @Maslosoft
	@Maslosoft = {}

class @Maslosoft.Playlist

	@idCounter = 0

	frameTemplate = '<iframe src="" frameborder="" webkitAllowFullScreen mozallowfullscreen allowFullScreen scrolling="no" allowtransparency="true"></iframe>'

	id: ''

	frameId: ''

	element: null

	links: null

	#
	# Video adapters
	# @var Maslosoft.Playlist.Adapters.Abstract[]
	#
	adapters: []

	#
	# Messenger instance
	#
	#
	msg: null

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

		@msg = new Maslosoft.Playlist.Helpers.Messenger(@frame)


	build:() ->

		# Collect videos
		links = @extractor.getData @element

		# Build wrappers
		@element.html(
			"<div class='maslosoft-video-embed-wrapper'>
				<div class='maslosoft-video-embed-container'>
					#{frameTemplate}
				</div>
			</div>"
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
						src = ad.getSrc(@frame)
						if src
							@frame.prop 'src', src
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
		
		# Just one video, remove side links
		if @links.length is 1
			@element.find('.maslosoft-video-playlist-wrapper').remove()
			@element.find('.maslosoft-video-embed-wrapper').css('width', '100%')

		# Tooltip option (bootstrap only)
		if typeof(jQuery.fn.tooltip) is 'function'

			# Apply only to selected playlist
			jQuery("##{@id}").tooltip({
				selector: 'a'
				placement: 'left'
				container: 'body'
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

			# Prevent mouse click
			e.preventDefault()

			console.log 'Playing next link...'
			# Hide tooltip to prevent it staying above video
			if typeof(jQuery.fn.tooltip) is 'function'
				link.tooltip 'hide'

			# Load source if not already loaded
			loaded = true
			if adapter isnt @current
				@current = adapter
				loaded = false
				src = adapter.getSrc(@frame)
				if src
					@frame.prop 'src', src

			# Clear all links status first
			@links.removeClass 'active playing'
			
			endCb = () =>
				@next(link)

			# Play when player is loaded into iframe
			# NOTE: This is not reliable
			if not loaded
				@frame.one 'load', (e) =>
					
					# Play media
					adapter.play @frame

					# Attach event on playback of current video finish

					adapter.onEnd @frame, endCb

					# Attach some decorations
					if adapter.isPlaying()
						link.addClass 'active playing'

			# Play or stop when player is loaded
			if loaded
				if adapter.isPlaying()
					link.addClass 'active'
					adapter.pause @frame
				else
					link.addClass 'active playing'
					adapter.play @frame
					adapter.onEnd @frame, () =>
						@next(link)

			# Add some styling
			link.addClass 'active'
			if adapter.isPlaying()
				link.addClass 'playing'
			else
				link.removeClass 'playing'

			


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
				Maslosoft.Playlist.Adapters.Dailymotion
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

	@parseEventData = (rawData) ->
		return JSON.parse(rawData)

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
	# @param @frame jQuery element
	#
	play: (@frame) ->

	stop: (@frame) ->

	pause: (@frame) ->

if not @Maslosoft.Playlist.Adapters
	@Maslosoft.Playlist.Adapters = {}

#
# Dailymotion adapter
# http://www.dailymotion.com/video/x54imp7_zig-sharko-new-compilation-2016-the-island-tour-hd_kids
#
#
class @Maslosoft.Playlist.DailymotionOld extends @Maslosoft.Playlist.Adapters.Abstract

	ready = false
	apiready = false
	init = jQuery.noop
	endCallback: null
	@match: (url) ->
		return url.match('dailymotion')

	#
	# This is called once per adapter type. Can be used to include external
	# libraries etc.
	#
	@once: () ->
		script = document.createElement('script')
		script.async = true
		script.src = 'https://api.dmcdn.net/all.js';
		tag = document.getElementsByTagName('script')[0]
		tag.parentNode.insertBefore(script, tag)

		window.dmAsyncInit = () ->
			DM.init()
			init()
			ready = true

	#
	# @param string url Embaddable media url
	#
	setUrl: (@url) ->
		# Get rid of first url part
		part = @url.replace(/.+?\//g, '')
		# Remove all after underscore
		@id = part.replace(/_.+/g, '')

	#
	# Get iframe src. This should return embbedable media iframe ready URL
	# or false if other methods should be used
	#
	getSrc: (@frame) =>
		frameId = @frame.get(0).id

		# This will be called on async init if not yet ready
		init = () =>
			config = {
				video: @id,
				params: {
					api: 'postMessage',
					# Use autoplay only when ready, otherways just show still frame
					autoplay: ready,
					origin: "#{document.location.protocol}//#{document.location.hostname}"
					id: frameId,
					'endscreen-enable': 0,
					'webkit-playsinline': 1,
					html: 1
				}
			}
			player = DM.player(@frame.get(0), config)
			player.addEventListener 'apiready', () =>
				console.log 'DM API ready'
				apiready = true
				@playing = ready
			player.addEventListener 'end', () =>
				console.log 'On video end...'
				console.log @endCallback
				@endCallback()

		# If not ready, it means that it's first video on list,
		# and page just loaded
		if ready
			init()
			return false
		else
			params = [
				'endscreen-enable=0',
				'api=postMessage',
				'autoplay=1',
				"id=#{frameId}",
				"origin=#{document.location.protocol}//#{document.location.hostname}"
			]
			src = "https://www.dailymotion.com/embed/video/#{@id}?" + params.join('&')
			return src

	#
	# Set preview, or thumb for embaddable media
	# @param function thumbCallback Img element
	#
	setThumb: (thumbCallback) ->
		# Get thumb
		# http://stackoverflow.com/questions/13173641/
		url = "//www.dailymotion.com/thumbnail/video/#{@id}"
		thumbCallback url

	#
	# Play dailymotion movie
	#
	play: (@frame) ->
		@call 'play'
		@playing = true

	#
	# Stop dailymotion movie
	#
	stop: (@frame) ->
		# Does it have stop??
		@call 'pause'
		@playing = false

	#
	# Pause dailymotion movie
	#
	pause: (@frame) ->
		@call 'pause'
		@playing = false

	#
	# On stop event
	# @param object Iframe object
	# @param function Function to call after finish
	#
	setOnEndCallback: (@frame, callback) =>
		try
			@endCallback = callback
			console.log "Setting callback..."
		catch e
			console.log "Could not set callback..."
			console.log e

	#
	# DM specific methods
	# @param function Function name to call on player
	# @param mixed Optional arguments
	#
	call: (func, args = []) ->
		toCall = () =>
			# Just in case api is not yet loaded
			if not ready
				console.log 'Not loaded'
				return
			if not apiready
				console.log 'api not ready, skipping'
				return
			
			console.log "Call DM #{func}"
			frameId = @frame.get(0).id
			iframe = document.getElementById(frameId)
			data = {
				command: func,
				parameters: args
			}
			result = iframe.contentWindow.postMessage(JSON.stringify(data), "*")
#			result = iframe.contentWindow.postMessage(func, "*")
		toCall()
		# Wait a bit or API will complain
#		setTimeout toCall, 200

		# Call it again, as sometimes it lags and nothing happens...
#		setTimeout toCall, 500

if not @Maslosoft.Playlist.Adapters
	@Maslosoft.Playlist.Adapters = {}

#
# Dailymotion adapter
# http://www.dailymotion.com/video/x54imp7_zig-sharko-new-compilation-2016-the-island-tour-hd_kids
#
#
class @Maslosoft.Playlist.Adapters.Dailymotion extends @Maslosoft.Playlist.Adapters.Abstract

	ready = false
	apiready = false
	init = jQuery.noop
	endCallback: null
	@match: (url) ->
		return url.match('dailymotion')

	@parseEventData = (rawData) ->
		return parseQueryString(rawData)

	#
	# This is called once per adapter type. Can be used to include external
	# libraries etc.
	#
	@once: () ->

	#
	# @param string url Embaddable media url
	#
	setUrl: (@url) ->
		# Get rid of first url part
		part = @url.replace(/.+?\//g, '')
		# Remove all after underscore
		@id = part.replace(/_.+/g, '')

	#
	# Get iframe src. This should return embbedable media iframe ready URL
	# or false if other methods should be used
	#
	getSrc: (@frame) =>
		frameId = @frame.get(0).id

		params = [
			'endscreen-enable=0',
			'api=postMessage',
			'autoplay=0',
			"id=#{frameId}",
			"origin=#{document.location.protocol}//#{document.location.hostname}"
		]
		src = "https://www.dailymotion.com/embed/video/#{@id}?" + params.join('&')
		return src

	#
	# Set preview, or thumb for embaddable media
	# @param function thumbCallback Img element
	#
	setThumb: (thumbCallback) ->
		# Get thumb
		# http://stackoverflow.com/questions/13173641/
		url = "//www.dailymotion.com/thumbnail/video/#{@id}"
		thumbCallback url

	#
	# Play dailymotion movie
	#
	play: (@frame) ->
		@call 'play'
		@playing = true

	#
	# Stop dailymotion movie
	#
	stop: (@frame) ->
		# Does it have stop??
		@call 'pause'
		@playing = false

	#
	# Pause dailymotion movie
	#
	pause: (@frame) ->
		@call 'pause'
		@playing = false

	#
	# On stop event
	# @param object Iframe object
	# @param function Function to call after finish
	#
	onEnd: (@frame, callback) =>
		onMsg = (e, data) ->
			console.log "onEnd Dailymotion"
			callback()
		name = "message.maslosoft.playlist.dailymotion.end"
		@frame.on name, onMsg

	#
	# DM specific methods
	# @param function Function name to call on player
	# @param mixed Optional arguments
	#
	call: (func, args = []) ->
		toCall = () =>
			
			console.log "Call DM #{func}"
			frameId = @frame.get(0).id
			iframe = document.getElementById(frameId)
			data = {
				command: func,
				parameters: args
			}
			result = iframe.contentWindow.postMessage(JSON.stringify(data), "*")
#			result = iframe.contentWindow.postMessage(func, "*")
		toCall()
		# Wait a bit or API will complain
#		setTimeout toCall, 200

		# Call it again, as sometimes it lags and nothing happens...
#		setTimeout toCall, 500

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
		@id = @id.replace(/\?.+/, '')

	#
	# Get iframe src. This should return embbedable media iframe ready URL
	#
	#
	getSrc: (@frame) ->
		frameId = @frame.get(0).id
		params = [
			'api=1',
			"player_id=#{frameId}"
		]
		src = "//player.vimeo.com/video/#{@id}?" + params.join('&')
		return src

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
		toCall = () =>
			console.log "Call #{func}"
			frameId = @frame.get(0).id
			iframe = document.getElementById(frameId)
			data = {
				"method": func,
				"value": args
			}
			result = iframe.contentWindow.postMessage(JSON.stringify(data), "*")
		setTimeout toCall, 0
		
		# Call it again, as sometimes it lags and nothing happens...
		setTimeout toCall, 500
		
		
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
		params = [
			'enablejsapi=1',
			'rel=0',
			'controls=2',
			'modestbranding=1'
			"origin=#{document.location.protocol}//#{document.location.hostname}"
		]
		src = "//www.youtube.com/embed/#{@id}?" + params.join('&')
		console.log src
		return src

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
		
		# Player instance is required or events will not trigger
		player = new YT.Player(@frame.get(0).id, {
			height: '390',
			width: '640',
			videoId: @id,
			events: {
				'onStateChange': jQuery.noop
			}
		})

		onStateChange = (e, data) ->
			if data.info is 0
				callback()
		name = "message.maslosoft.playlist.youtube.onStateChange"
		@frame.on name, onStateChange

		infoDelivery = (e, data) =>
			if data.info.currentTime is data.info.duration
				@playing = false
		name = "message.maslosoft.playlist.youtube.infoDelivery"
		@frame.on name, infoDelivery

	#
	# Youtube specific methods
	#
	call: (func, args = []) ->
		toCall = () =>
			frameId = @frame.get(0).id
			iframe = document.getElementById(frameId);
			data = {
				"event": "command",
				"func": func,
				"args": args,
				"id": frameId
			}
			result = iframe.contentWindow.postMessage(JSON.stringify(data), "*")
		
		setTimeout toCall, 0
		
		# Call it again, as sometimes it lags and nothing happens...
		setTimeout toCall, 500

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

#
#
#
#
class Maslosoft.Playlist.Helpers.Messenger

	frame: null

	element: null

	constructor: (@frame) ->
		@element = @frame.get(0)
		
		#
		# This event handlers must be attached 
		# _only_ once per playlist
		# or will fire multiplicated events
		#
		#
		if window.addEventListener
			# Default event subscribe
			window.addEventListener 'message', @onMessage, false
		else
			# IE compat
			window.attachEvent 'onmessage', @onMessage

	onMessage: (event) =>
		
		# See also:
		# http://stackoverflow.com/questions/15329710/postmessage-source-iframe
		# Below check shoul handle multi-event handers issue
		# raised in constructor
		if @frame.get(0).contentWindow isnt event.source
			return
		for name, adapter of Maslosoft.Playlist.Adapters
			if adapter.match event.origin

				# This must be parsed here, to get info
				# about sub-event
				parsedData = adapter.parseEventData(event.data)
				data = [
					parsedData
				]
				ns = "message.maslosoft.playlist.#{name.toLowerCase()}"
				ns = "#{ns}.#{parsedData.event}"
				console.log ns
				@frame.trigger(ns, data)
				return

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
			@holder.height(frame.height())

			list = element.find('.maslosoft-video-playlist')
			height = list.height()
			list.css('height': "#{height}px")

			container = element.find('.maslosoft-video-playlist-holder')
			Maslosoft.Ps.initialize(container.get(0))
			
		setTimeout applyHeight, 0
