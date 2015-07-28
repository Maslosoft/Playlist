playlist = [
	'js/Playlist.coffee',
	'js/Adapters/Abstract.coffee',
	'js/Adapters/YouTube.coffee',
	'js/Adapters/Vimeo.coffee'
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
					'dist/playlist.js': playlist
				]
		uglify:
			compile:
				files:
					'dist/playlist.min.js' : ['dist/playlist.js']
		watch:
			compile:
				files: playlist
				tasks: ['coffee:compile']

	# These plugins provide necessary tasks.
	grunt.loadNpmTasks 'grunt-contrib-coffee'
	grunt.loadNpmTasks 'grunt-contrib-watch'
	grunt.loadNpmTasks 'grunt-contrib-uglify'

	# Default task.
	grunt.registerTask 'default', ['coffee', 'uglify']
