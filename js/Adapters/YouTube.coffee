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

