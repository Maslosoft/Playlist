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
			@holder.height(frame.height())

			list = element.find('.maslosoft-video-playlist')
			height = list.height()
			list.css('height': "#{height}px")

			container = element.find('.maslosoft-video-playlist-holder')
			Ps.initialize(container.get(0))
			
		setTimeout applyHeight, 0
