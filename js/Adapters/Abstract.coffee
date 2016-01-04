if not @Maslosoft.Playlist.Adapters
	@Maslosoft.Playlist.Adapters = {}

#
# Any adapter class should imlement theese class methods
#
class @Maslosoft.Playlist.Adapters.Abstract

	@idCounter: 0

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


	#
	# Return true if this adapter can handle URL
	# @return bool True if this adapter can handle URL
	#
	@match = (url) ->

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
	# Set preview, or thumb for embaddable media
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
	play: (@frame) ->

	stop: (@frame) ->

	pause: (@frame) ->
