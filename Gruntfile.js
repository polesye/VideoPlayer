module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      build: {
        options: {
          mangle: false
        },
        files: {
          'build/<%= pkg.name %>.min.js': [
            'lib/1.7.2.jquery.min.js',
            'src/js/utils.js',
            'src/js/player.js',
            'src/js/media/html5.js',
            'src/js/media/youtube.js',
            'src/js/parsers/srt.js',
            'src/js/metadata.js',
            'src/js/components/component.js',
            'src/js/components/button.js',
            'src/js/components/slider.js',
            'src/js/components/menu.js',
            'src/js/controls/vcr.js',
            'src/js/controls/progress_slider.js',
            'src/js/controls/play_button.js',
            'src/js/controls/mute_button.js',
            'src/js/controls/transcripts.js'
          ]
        }
      }
    },
    watch: {
      pivotal : {
        files: ['src/**/*.js', 'specs/**/*.js'],
        tasks: ['uglify', 'jasmine']
      }
    },
    jasmine: {
      pivotal: {
        src: [
          'lib/**/*.js',

          'src/js/utils.js',
          'src/js/player.js',
          'src/js/media/html5.js',
          'src/js/media/youtube.js',
          'src/js/parsers/srt.js',
          'src/js/metadata.js',
          'src/js/components/component.js',
          'src/js/components/button.js',
          'src/js/components/slider.js',
          'src/js/components/menu.js',
          'src/js/controls/vcr.js',
          'src/js/controls/progress_slider.js',
          'src/js/controls/play_button.js',
          'src/js/controls/mute_button.js',
          'src/js/controls/transcripts.js'

        // 'build/**/*.js'
        ],
        options: {
          specs: 'specs/**/*.js'
          // helpers: 'specs/**/*_helper.js',
        }
      }
    },
    concat: {
      dist: {
        src: ['src/**/*.js'],
        dest: 'dist/*.js'
      }
    }
  });

    // {jshint: {
    //   files: ['Gruntfile.js', 'lib/**/*.js', 'test/**/*.js', 'src/**/*.js'],
    //   beforeconcat: ['src/**/*.js'],
    //   afterconcat: ['dist/*.js'],
    //   options: {
    //     curly: true,
    //     eqeqeq: true,
    //     eqnull: true,
    //     browser: true,
    //     globals: {
    //       jQuery: true,
    //       console: true,
    //       module: true,
    //       document: true
    //     },
    //   },
    // }

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-watch');
  // grunt.loadNpmTasks('grunt-contrib-concat');

  // Default task(s).
  grunt.registerTask('default', [
    'uglify', 'watch', 'jasmine'
  ]);

};
