playlist = [
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
	'bower_components/perfect-scrollbar/js/perfect-scrollbar.js'
	'dist/playlist-standalone.js'
]
min = [
	'bower_components/perfect-scrollbar/js/perfect-scrollbar.min.js'
	'dist/playlist-standalone.min.js'
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
				dest: 'dist/playlist.min.js'
			dev:
				src: dev
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
