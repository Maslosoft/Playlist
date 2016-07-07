if not @Maslosoft.Playlist.Helpers
	@Maslosoft.Playlist.Helpers = {}

class @Maslosoft.Playlist.Helpers.Scroller

	#
	# Holder element instance
	# @var jQuery
	#
	@holder: null

	#
	# Playlist element instance
	# @var jQuery
	#
	@playlist: null

	constructor: (element, @playlist) ->
		applyHeight = () =>
			frame = element.find('.maslosoft-video-embed-container iframe')
			@holder = @playlist.parent()
			console.log frame.height()
			@holder.height(frame.height())
			@holder.css('overflowY': 'auto')
		setTimeout applyHeight, 0
