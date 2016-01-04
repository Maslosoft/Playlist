if not @Maslosoft.Playlist.Data
	@Maslosoft.Playlist.Data = {}

class @Maslosoft.Playlist.Data.Video

	constructor: (options = []) ->
		for option, name in options
			@[name] = option

	title: ''
	url: ''
