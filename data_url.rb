require 'base64'

# tools.ietf.org/html/rfc2397
# developer.mozilla.org/en/data_URIs

# "data:" + MIME type + ";base64," + base64-encoded content
def to_data_url(content, content_type)
  outuri = 'data:' + content_type + ';base64'
  content = Base64.encode64(content).gsub("\n", '')
  outuri += ",#{content}"
end

module Sass::Script::Functions
  def data_url(file)
    supportedTypes = {
      '.jpg' => 'image/jpeg',
      '.png' => 'image/png',
      '.gif' => 'image/gif',
      '.svg' => 'image/svg+xml',
      '.otf'   => 'font/opentype',
      '.ttf'   => 'application/x-font-ttf',
      '.woff'  => 'application/x-font-woff'
    }
    file = file.value
    content = File.open(file, 'rb') { |f| f.read }
    ext = File.extname(file)
    if supportedTypes.has_key?(ext)
      url = to_data_url(content, supportedTypes[ext])

      # IE8 has a 32KiB limit on data uri
      # en.wikipedia.org/wiki/Data_URI_scheme
      if url.length > 32768
        raise ArgumentError.new(
          "#{file} is greater than 32KiB in size,"\
          " that is the max size of data urls in IE8.")
      end

      Sass::Script::String.new("url(#{url})")
    else
      raise ArgumentError.new('Extension not supported.')
    end
  end
  declare :data_url, [:file]
end