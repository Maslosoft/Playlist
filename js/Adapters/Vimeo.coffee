if not @Maslosoft.Playlist.Adapters
	@Maslosoft.Playlist.Adapters = {}

class @Maslosoft.Playlist.Adapters.Vimeo extends @Maslosoft.Playlist.Adapters.Abstract

	@match: (url) ->
		return url.match('vimeo')

	#
	# This is called once per adapter type. Can be used to include external
	# libraries etc.
	# @param Maslosoft.Playlist playlist instance
	#
	@once: (playlist) ->
		# Include froogaloop2 library for easier events
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
