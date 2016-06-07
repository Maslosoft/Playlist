playlist = [
	'js/Playlist.coffee',
	'js/Options.coffee',
	'js/Adapters/*',
	'js/Data/*',
	'js/Extractors/*',
	'js/Helpers/*'
]
less = [
	'css/playlist.less'
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
			less:
				files: less
				tasks: ['less:compile']
		less:
			compile:
				files:
					'dist/playlist.css' : less
				options:
					sourceMap: true

	# These plugins provide necessary tasks.
	grunt.loadNpmTasks 'grunt-contrib-coffee'
	grunt.loadNpmTasks 'grunt-contrib-watch'
	grunt.loadNpmTasks 'grunt-contrib-uglify'
	grunt.loadNpmTasks 'grunt-contrib-less'

	# Default task.
	grunt.registerTask 'default', ['coffee', 'less', 'uglify']
