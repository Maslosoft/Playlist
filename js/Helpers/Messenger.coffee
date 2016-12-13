if not @Maslosoft.Playlist.Helpers
	@Maslosoft.Playlist.Helpers = {}

class Maslosoft.Playlist.Helpers.Messenger

	isReady = false
	eventCallbacks = {}
	hasWindowEvent = false
	slice = Array::slice
	playerOrigin = '*'

	@iframe: null

	@element: null

	@adapter: null

	constructor: (@iframe, @adapter) ->
		@element = @iframe

	api: (method, valueOrCallback) =>
		if !@element or !method
			return false
		target_id = if @element.id != '' then @element.id else null
		params = if !isFunction(valueOrCallback) then valueOrCallback else null
		callback = if isFunction(valueOrCallback) then valueOrCallback else null
		# Store the callback for get functions
		if callback
			@storeCallback method, callback, target_id
		@postMessage method, params, @element
		@

	addEvent: (eventName, callback) =>
		if !@element
			return false
		
		target_id = if @element.id != '' then @element.id else null
		@storeCallback eventName, callback, target_id
		# The ready event is not registered via postMessage. It fires regardless.
		if eventName.match 'ready'
			@postMessage 'addEventListener', eventName, @element
		else if eventName.match 'ready' and isReady
			callback.call null, target_id
		@

	removeEvent: (eventName) =>
		if !@element
			return false
		
		target_id = if @element.id != '' then @element.id else null
		removed = @removeCallback(eventName, target_id)
		# The ready event is not registered
		if eventName.match 'ready' and removed
			@postMessage 'removeEventListener', eventName, @element
		return

	###*
	# Handles posting a message to the parent window.
	#
	# @param method (String): name of the method to call inside the player. For api calls
	# this is the name of the api method (api_play or api_pause) while for events this method
	# is api_addEventListener.
	# @param params (Object or Array): List of parameters to submit to the method. Can be either
	# a single param or an array list of parameters.
	# @param target (HTMLElement): Target iframe to post the message to.
	###

	postMessage: (method, params, target) =>
		if !target.contentWindow.postMessage
			return false
		data = JSON.stringify(
			method: method
			value: params)
		target.contentWindow.postMessage data, playerOrigin
		return

	onMessageReceived: (event) =>
		data = undefined
		method = undefined
		try
			data = JSON.parse(event.data)
			method = data.event or data.method
		catch e
			# We don't need json parse errors

		if method.match 'ready' and !isReady
			isReady = true
		
		# Handles messages from the proper player only
		console.log event.origin
		if @adapter.match(event.origin)
			return false

		if playerOrigin == '*'
			playerOrigin = event.origin
		value = data.value
		eventData = data.data
		target_id = if target_id == '' then null else data.player_id
		callback = @getCallback(method, target_id)
		params = []
		if !callback
			return false
		if value != undefined
			params.push value
		if eventData
			params.push eventData
		if target_id
			params.push target_id
		if params.length > 0 then callback.apply(null, params) else callback.call()

	###
	# Stores submitted callbacks for each iframe being tracked and each
	# event for that iframe.
	#
	# @param eventName (String): Name of the event. Eg. api_onPlay
	# @param callback (Function): Function that should get executed when the
	# event is fired.
	# @param target_id (String) [Optional]: If handling more than one iframe then
	# it stores the different callbacks for different iframes based on the iframe's
	# id.
	###

	storeCallback: (eventName, callback, target_id) ->
		if target_id
			if !eventCallbacks[target_id]
				eventCallbacks[target_id] = {}
			eventCallbacks[target_id][eventName] = callback
		else
			eventCallbacks[eventName] = callback
		return

	###
	# Retrieves stored callbacks.
	###

	getCallback: (eventName, target_id) ->
		if target_id
			eventCallbacks[target_id][eventName]
		else
			eventCallbacks[eventName]

	removeCallback: (eventName, target_id) ->
		if target_id and eventCallbacks[target_id]
			if !eventCallbacks[target_id][eventName]
				return false
			eventCallbacks[target_id][eventName] = null
		else
			if !eventCallbacks[eventName]
				return false
			eventCallbacks[eventName] = null
		true