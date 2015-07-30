if not @Maslosoft
	@Maslosoft = {}

class @Maslosoft.Playlist

	@idCounter = 0

	id = ''

	frameId = ''

	element = null
	
	playlistLinks = null

	links = null

	videos = []

	constructor: (element, @adapters = null, @options = null) ->

		if not @options
			# TODO
			@options = {}

		# Set default adapters if empty
		if not @adapters
			@adapters = [
				Maslosoft.Playlist.Adapters.YouTube
				Maslosoft.Playlist.Adapters.Vimeo
			]

		# Setup main container
		@element = jQuery element
		if @element.id
			@id = @element.id
		else
			@id = 'maslosoftPlaylist' + Playlist.idCounter++
			@element.prop 'id' , @id

		@frameId = "#{@id}Frame"

		# Build player and playlist
		@build();


	build:() ->

		# Collect videos
		links = @element.find 'a'

		# Build wrappers
		@element.html(
			'<div class="maslosoft-video-embed-wrapper">
				<div class="maslosoft-video-embed-container">
					<iframe src="" frameborder="" webkitAllowFullScreen mozallowfullscreen allowFullScreen scrolling="no" allowtransparency="true"></iframe>
				</div>
			</div>'
		)
		
		# Select playlist
		@playlist = jQuery '<div class="maslosoft-video-playlist" />'

		@frame = @element.find 'iframe'
		@frame.prop 'id', @frameId

		first = true
		for link in links
			for adapter in @adapters

				# Check if can be used with current link
				if adapter.match link.href

					# Init adapter
					ad = new adapter
					ad.setUrl link.href
					ad.setTitle link.innerHTML

					# Make link in playlist
					linkElement = @createLink ad

					# Setup initial movie
					if first
						@current = ad
						@frame.prop 'src', ad.getSrc(@frame)
						linkElement.addClass 'active'
						first = false

		
		@element.append @playlist
		@links = @playlist.find 'a'

	createLink: (adapter) ->

		# Create thumb
		thumb = jQuery '<img />'
		adapter.setThumb(thumb)
		thumb.prop 'alt', adapter.getTitle()

		# Create caption
		caption = jQuery '<div class="caption"/>'
		caption.html adapter.getTitle()

		# Create link
		link = jQuery '<a />'
		link.prop 'title', adapter.getTitle()
		link.prop 'href', adapter.getUrl()
		link.html thumb
		# TODO Style caption
#		link.append caption

		# Play on click
		link.on 'click', (e) =>

			# Load source if not already loaded
			loaded = true
			if adapter isnt @current
				console.log 'Load frame'
				@current = adapter
				loaded = false
				@frame.prop 'src', adapter.getSrc(@frame)
			
			# Play when player is loaded into iframe
			if not loaded
				@frame.one 'load', (e) =>
					# Attach event on playback of current video finish
					adapter.onEnd @frame, () =>
						console.log 'Video finished'

					# Play media
					adapter.play @frame

					# Attach some decorations
					@links.removeClass 'active playing'
					if adapter.isPlaying()
						link.addClass 'active playing'
					console.log 'player loaded for: ' + adapter.getTitle()

			# Play or stop when player is loaded
			if loaded
				if adapter.isPlaying()
					adapter.pause @frame
				else
					adapter.play @frame

			# Add some styling
			link.addClass 'active'
			if adapter.isPlaying()
				link.addClass 'playing'
			else
				link.removeClass 'playing'

			# Prevent mouse click
			e.preventDefault()


		@playlist.append link
		return link
