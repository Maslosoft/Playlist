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
