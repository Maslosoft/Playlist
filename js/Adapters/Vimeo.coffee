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
	# Play embeddable media
	#
	play: (@frame) ->
		@call 'play'
		@playing = true

	stop: (@frame) ->
		@call 'unload'
		@playing = false

	pause: (@frame) ->
		@call 'pause'
		@playing = false


	#
	# Vimeo specific methods
	#
	call: (func, args = []) ->

		frameId = @frame.get(0).id
		iframe = document.getElementById(frameId);
		console.log iframe
		data = {
			"method": func,
			"value": args
		}
		console.log data
		result = iframe.contentWindow.postMessage(JSON.stringify(data), "*")
		console.log result