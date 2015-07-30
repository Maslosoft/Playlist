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
	getSrc: (@frame) ->
		return "//player.vimeo.com/video/#{@id}?api=1&player_id=#{@frame}"

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
	onEnd: (@frame, event) ->
		console.log 'Attaching event onStop'
		
		if window.addEventListener
			window.addEventListener('message', onMsg, false)
		else
			window.attachEvent('onmessage', onMsg, false)

		jQuery(window).on 'message', (e) =>
			console.log 'On message...'

		onMsg = (e) =>
			console.log 'Got event:'
			console.log e

		jQuery(@frame).on 'message', (e) =>
			data = JSON.parse e.data
			console.log 'Received data from player...'
			console.log data
	

	#
	# Vimeo specific methods
	# @param function Function name to call on player
	# @param mixed Optional arguments
	#
	call: (func, args = []) ->
		frameId = @frame.get(0).id
		iframe = document.getElementById(frameId);
		data = {
			"method": func,
			"value": args
		}
		result = iframe.contentWindow.postMessage(JSON.stringify(data), "*")
