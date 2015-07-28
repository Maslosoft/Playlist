if not @Maslosoft
	@Maslosoft = {}

class @Maslosoft.Playlist

	@idCounter = 0

	id = ''

	frameId = ''

	element = null
	
	playlistLinks = null

	links = null

	videos = []

	constructor: (element, @adapters = null, @options = null) ->

		if not @options
			# TODO
			@options = {}

		# Set default adapters if empty
		if not @adapters
			@adapters = [
				Maslosoft.Playlist.Adapters.YouTube
				Maslosoft.Playlist.Adapters.Vimeo
			]

		# Setup main container
		@element = jQuery element
		if @element.id
			@id = @element.id
		else
			@id = 'maslosoftVideoPlayer' + VideoPlayer.idCounter++
			@element.prop 'id' , @id

		@frameId = "#{@id}Frame"

		# Build player and playlist
		@build();


	build:() ->

		# Collect videos
		links = @element.find 'a'

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
				if adapter.match link.href

					# Init adapter
					ad = new adapter
					ad.setUrl link.href
					ad.setTitle link.innerHTML

					# Make link in playlist
					linkElement = @createLink ad

					# Setup initial movie
					if first
						@current = ad
						@frame.prop 'src', ad.getSrc()
						linkElement.addClass 'active'
						first = false

		
		@element.append @playlist
		@links = @playlist.find 'a'

	createLink: (adapter) ->

		# Create thumb
		thumb = jQuery '<img />'
		adapter.setThumb(thumb)
		thumb.prop 'alt', adapter.getTitle()

		# Create caption
		caption = jQuery '<div class="caption"/>'
		caption.html adapter.getTitle()

		# Create link
		link = jQuery '<a />'
		link.prop 'title', adapter.getTitle()
		link.prop 'href', adapter.getUrl()
		link.html thumb
		# TODO Style caption
#		link.append caption

		# Play on click
		link.on 'click', (e) =>

			# Load source if not already loaded
			loaded = true
			if not @frame.prop('src').replace('?', 'X').match(adapter.getSrc().replace('?', 'X'))
				@current = adapter
				loaded = false
				@frame.prop 'src', adapter.getSrc()
			
			# Play when player is loaded into iframe
			if not loaded
				@frame.one 'load', (e) =>
					@links.removeClass 'active playing'
					adapter.play @frame
					if adapter.isPlaying()
						link.addClass 'active playing'
					console.log 'player loaded for: ' + adapter.getTitle()

			# Play or stop when player is loaded
			if loaded
				if adapter.isPlaying()
					adapter.pause @frame
				else
					adapter.play @frame

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

if not @Maslosoft.Playlist.Adapters
	@Maslosoft.Playlist.Adapters = {}

#
# Any adapter class should imlement theese class methods
#
class @Maslosoft.Playlist.Adapters.Abstract

	#
	# Video id
	# @var string
	#
	id: ''

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

	#
	# Return true if this adapter can handle URL
	# @return bool True if this adapter can handle URL
	#
	@match = (url) ->

	#
	# Set url provided by user
	# @param srting url Embaddable media url
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
	# Set preview, or thumb for embaddable media
	# @param jQuery Img element
	#
	setThumb: (thumb) ->

	#
	# Get iframe src. This should return embbedable media iframe ready URL
	#
	#
	getSrc: () ->

	isPlaying: () ->
		return @playing

	#
	# Play embeddable media
	#
	play: (@frame) ->

	stop: (@frame) ->

	pause: (@frame) ->

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
	# @param srting url Embaddable media url
	#
	setUrl: (@url) ->
		@id = @url.replace(/.+?v=/, '')

	#
	# Set preview, or thumb for embaddable media
	# @param jQuery Img element
	#
	setThumb: (thumb) ->
		thumb.prop 'src', "//img.youtube.com/vi/#{@id}/0.jpg"

	#
	# Get iframe src. This should return embbedable media iframe ready URL
	#
	#
	getSrc: () ->
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


	#
	# Youtube specific methods
	#
	call: (func, args = []) ->
		frameId = @frame.get(0).id
		iframe = document.getElementById(frameId);
		console.log iframe
		data = {
			"event": "command",
			"func": func,
			"args": args,
			"id": frameId
		}
		console.log data
		result = iframe.contentWindow.postMessage(JSON.stringify(data), "*")
		console.log result


if not @Maslosoft.Playlist.Adapters
	@Maslosoft.Playlist.Adapters = {}

class @Maslosoft.Playlist.Adapters.Vimeo extends @Maslosoft.Playlist.Adapters.Abstract

	@match: (url) ->
		console.log 'vimeo'
		return url.match('vimeo')

	#
	# @param srting url Embaddable media url
	#
	setUrl: (@url) ->
		@id = @url.replace(/.+\//, '')
		console.log @id

	#
	# Get iframe src. This should return embbedable media iframe ready URL
	#
	#
	getSrc: () ->
		return "//player.vimeo.com/video/#{@id}?enablejsapi=1"

	#
	# Set preview, or thumb for embaddable media
	# @param jQuery Img element
	#
	setThumb: (thumb) ->
		# Get thumb
		# http://stackoverflow.com/a/8616607
		$.ajax({
			type:'GET'
			url: '//vimeo.com/api/v2/video/' + @id + '.json'
			jsonp: 'callback'
			dataType: 'jsonp'
			success: (data) =>
				thumbnail_src = data[0].thumbnail_large;
				thumb.prop 'src', thumbnail_src
		});

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


	#
	# Vimeo specific methods
	#
	call: (func, args = []) ->

#		frameId = @frame.get(0).id
#		iframe = document.getElementById(frameId);
#		console.log iframe
#		data = {
#			"event": "command",
#			"func": func,
#			"args": args,
#			"id": frameId
#		}
#		console.log data
#		result = iframe.contentWindow.postMessage(JSON.stringify(data), "*")
#		console.log result
