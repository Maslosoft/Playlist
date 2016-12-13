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
