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

	constructor: (frame, @playlist) ->
		@holder = @playlist.parent()
		@holder.height(frame.height())
