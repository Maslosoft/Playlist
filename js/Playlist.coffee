if not @Maslosoft
	@Maslosoft = {}

class @Maslosoft.Playlist

	@idCounter = 0

	id = ''

	frameId = ''

	element = null

	playlistLinks = null

	links = null

	#
	# Video adapters
	# @var Maslosoft.Playlist.Adapters.Abstract[]
	#
	adapters: []

	#
	# Data extractor
	# @var Maslosoft.Extractors.Abstract
	#
	extractor: null

	constructor: (element, options = null) ->

		@options = new Maslosoft.Playlist.Options options

		# Set adapters from options
		@adapters = @options.adapters

		# Set extractor
		@extractor = new @options.extractor

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
		links = @extractor.getData @element

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
				if adapter.match link.url

					# Init adapter
					ad = new adapter
					ad.setUrl link.url
					ad.setTitle link.title

					# Make link in playlist
					linkElement = @createLink ad

					# Setup initial movie
					if first
						currentLink = linkElement
						@current = ad
						@frame.prop 'src', ad.getSrc(@frame)
						@frame.one 'load', (e) =>
							# Attach event on playback of current video finish
							ad.onEnd @frame, () =>
								@next(currentLink)

						linkElement.addClass 'active'
						first = false

		# Playlist wrapper for proper table display and scroll holder
		playlistWrapper = jQuery '<div class="maslosoft-video-playlist-wrapper"></div>'
		playlistHolder = jQuery '<div class="maslosoft-video-playlist-holder"></div>'
		playlistHolder.append(@playlist)
		playlistWrapper.append(playlistHolder)
		@element.append playlistWrapper

		# Links after build, not those which could be used as video sources
		@links = @playlist.find 'a'

		# Tooltip option (bootstrap only)
		if typeof(jQuery.fn.tooltip) is 'function'

			# Apply only to selected playlist
			jQuery("##{@id}").tooltip({
				selector: 'a'
				placement: 'left'
			});

		new Maslosoft.Playlist.Helpers.Scroller(@frame, @playlist)
		return true

	# Sloopy next handling
	next: (link) ->
		link = link[0]
		# Get next adapter
		for l, index in @links
			if link.id is l.id
				break
		index++

		# No more media on playlist
		if not @links[index]
			console.log 'No more videos'
			@links.removeClass 'active playing'
			# Activate first one
			if @links.get(0)
				jQuery(@links.get(0)).addClass 'active'
			return

		link = @links[index]
		link.click()


	createLink: (adapter) ->

		# Create caption
		caption = jQuery '<div class="caption"/>'
		caption.html adapter.getTitle()

		# Create link
		link = jQuery '<a />'
		link.attr 'id', adapter.linkId
		link.attr 'title', adapter.getTitle()
		link.attr 'href', adapter.getUrl()
		link.attr 'rel', 'tooltip'
		link.attr 'data-placement', 'left'

		thumbCallback = (src) ->
			link.css 'background-image', "url('#{src}')"
			link.attr 'title', adapter.getTitle()
		adapter.setThumb(thumbCallback)

		link.html '<i></i>'
		# TODO Style caption
#		link.append caption

		# Some workarounds for mouseout
		link.on 'mouseout', (e) =>
			# Hide tooltip to prevent it staying above video
			if typeof(jQuery.fn.tooltip) is 'function'
				link.tooltip 'hide'

		# Play on click
		link.on 'click', (e) =>

			# Hide tooltip to prevent it staying above video
			if typeof(jQuery.fn.tooltip) is 'function'
				link.tooltip 'hide'

			# Load source if not already loaded
			loaded = true
			if adapter isnt @current
				@current = adapter
				loaded = false
				@frame.prop 'src', adapter.getSrc(@frame)



			# Play when player is loaded into iframe
			if not loaded
				@frame.one 'load', (e) =>
					# Play media
					adapter.play @frame

					# Attach event on playback of current video finish

					adapter.onEnd @frame, () =>
						@next(link)

					# Attach some decorations
					@links.removeClass 'active playing'
					if adapter.isPlaying()
						link.addClass 'active playing'

			# Play or stop when player is loaded
			if loaded
				if adapter.isPlaying()
					adapter.pause @frame
				else
					adapter.play @frame
					adapter.onEnd @frame, () =>
						@next(link)

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
