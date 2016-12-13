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
