
class @Maslosoft.Playlist.Options

	#
	# Video adapters
	# @var Maslosoft.Playlist.Adapters.Abstract[]
	#
	adapters: []

	extractor: null

	constructor: (options = []) ->
		@adapters = new Array
		for option, name in options
			@[name] = option
		if not @adapters.length
			@adapters = [
				Maslosoft.Playlist.Adapters.YouTube
				Maslosoft.Playlist.Adapters.Vimeo
				Maslosoft.Playlist.Adapters.Dailymotion2
			]
		if not @extractor
			@extractor = Maslosoft.Playlist.Extractors.LinkExtractor
