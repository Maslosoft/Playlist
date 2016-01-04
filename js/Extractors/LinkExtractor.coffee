if not @Maslosoft.Playlist.Extractors
	@Maslosoft.Playlist.Extractors = {}

class @Maslosoft.Playlist.Extractors.LinkExtractor

	getData: (element) ->
		data = []
		for link in element.find 'a'
			d = new Maslosoft.Playlist.Data.Video
			d.url = link.href
			d.title = link.innerHTML
			data.push d
		return data
