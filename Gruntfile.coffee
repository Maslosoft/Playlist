fs = require "fs"

ps = [
	'bower_components/perfect-scrollbar/js/perfect-scrollbar.js'
	'bower_components/perfect-scrollbar/js/perfect-scrollbar.min.js'
]
replaces = {
	'window.PerfectScrollbar': 'Maslosoft.PerfectScrollbar'
	'window.Ps': 'Maslosoft.Ps'
}
for file in ps
	contents = fs.readFileSync(file).toString()
	for search, replace of replaces
		contents = contents.replace(search, replace)
	fs.writeFileSync(file, contents)

playlist = [
	'js/_functions.coffee',
	'js/Playlist.coffee',
	'js/Options.coffee',
	'js/Adapters/*',
	'js/Data/*',
	'js/Extractors/*',
	'js/Helpers/*'
]
sass = [
	'css/playlist.scss'
]
watchSass = sass.slice 0
watchSass.push 'css/ps/*'

dev = [
	'bower_components/coffee-sugar/dist/sugar.js'
	'dist/playlist-standalone.js'
	ps[0]
]
min = [
	'bower_components/coffee-sugar/dist/sugar.min.js'
	'dist/playlist-standalone.min.js'
	ps[1]
]
module.exports = (grunt) ->

	# Project configuration.
	grunt.initConfig
		coffee:
			compile:
				options:
					sourceMap: true
					join: true
					expand: true
					nonull: true
				files: [
					'dist/playlist-standalone.js': playlist
				]
		uglify:
			options:
				mangle: false
			compile:
				files:
					'dist/playlist-standalone.min.js' : ['dist/playlist-standalone.js']
		concat:
			min:
				src: min
				nonull: true
				dest: 'dist/playlist.min.js'
			dev:
				src: dev
				nonull: true
				dest: 'dist/playlist.js'
		watch:
			compile:
				files: playlist
				tasks: ['coffee:compile', 'concat:dev']
			sass:
				files: watchSass
				tasks: ['sass:compile']
		sass:
			compile:
				files:
					'dist/playlist.css' : sass
				options:
					require: './data_url.rb'

	# These plugins provide necessary tasks.
	grunt.loadNpmTasks 'grunt-contrib-coffee'
	grunt.loadNpmTasks 'grunt-contrib-watch'
	grunt.loadNpmTasks 'grunt-contrib-concat'
	grunt.loadNpmTasks 'grunt-contrib-uglify'
	grunt.loadNpmTasks 'grunt-contrib-sass'

	# Default task.
	grunt.registerTask 'default', ['coffee', 'sass', 'uglify', 'concat']
