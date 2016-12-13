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
