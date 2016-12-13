mixin = Maslosoft.Sugar.mixin
implement = Maslosoft.Sugar.implement
abstract = Maslosoft.Sugar.abstract

parseQueryString = (queryString) ->
	query = queryString.split '&'
	result = {}
	i = 0
	while i < query.length
		part = query[i].split('=', 2)
		if part.length == 1
			result[part[0]] = ''
		else
			result[part[0]] = decodeURIComponent(part[1].replace(/\+/g, ' '))
		++i
	result

isFunction = (obj) ->
	!!(obj and obj.constructor and obj.call and obj.apply)

isArray = (obj) ->
	toString.call(obj) == '[object Array]'