module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'src/**/*.js',
        dest: 'build/<%= pkg.name %>.min.js'
      }
    },
    watch: {
      pivotal : {
        files: ['src/**/*.js', 'specs/**/*.js'],
        tasks: ['jasmine', 'uglify'] // , 'jshint'
      }
    },
    jasmine: {
      pivotal: {
        src: 'src/**/*.js',
        options: {
          specs: 'specs/**/*.js',
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
    // https://npmjs.org/package/grunt-contrib-jshint
  // grunt.loadNpmTasks('grunt-contrib-jshint');
  // https://npmjs.org/package/grunt-contrib-jasmine
  grunt.loadNpmTasks('grunt-contrib-jasmine');
    // https://npmjs.org/package/grunt-contrib-watch
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');

  // Default task(s).
  grunt.registerTask('default', [
    'uglify', 'watch', 'jasmine'//, 'jshint'
  ]);

};
