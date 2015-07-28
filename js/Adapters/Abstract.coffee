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
