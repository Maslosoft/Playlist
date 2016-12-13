
  isFunction = (obj) ->
    ! !(obj and obj.constructor and obj.call and obj.apply)

  isArray = (obj) ->
    toString.call(obj) == '[object Array]'