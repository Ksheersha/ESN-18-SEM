module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        mochaTest: {
          local: {
            options: {
              reporter: 'spec',
              // reporterOptions: {
              //   mochaFile: 'test_result/test-results.xml'
              // },
              //captureFile: 'results.txt', // Optionally capture the reporter output to a file
              quiet: false, // Optionally suppress output to standard out (defaults to false)
              clearRequireCache: false, // Optionally clear the require cache before running tests (defaults to false)
              ui: 'tdd'
            },
            src: ['test/**/*.js']
          },
          smoketest: {
            options: {
              reporter: 'spec',
              // reporterOptions: {
              //   mochaFile: 'test_result/test-results.xml'
              // },
              //captureFile: 'results.txt', // Optionally capture the reporter output to a file
              quiet: false, // Optionally suppress output to standard out (defaults to false)
              clearRequireCache: false, // Optionally clear the require cache before running tests (defaults to false)
              ui: 'tdd'
            },
            src: ['test/UnitTest/joinCommunity.js',
                  'test/UnitTest/chatPublicly.js',]
          }
        },

        mocha_istanbul: {
            coverage: {
                src: ['test/IntegrationTest/', 'test/UnitTest/'], // a folder works nicely
                options: {
                    mochaOptions: ['--ui', 'tdd', '--async-only', '--exit'] // any extra options for mocha
                }
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    // grunt.loadNpmTasks('grunt-mocha'); Client Side testing
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-mocha-istanbul');

    // Default task(s).
    grunt.registerTask('default', []);

    //smoke test
    grunt.registerTask('smoketest', ['mochaTest:smoketest']);  

    //Test
    grunt.registerTask('test', ['mochaTest:local']);

    //Coverage
    grunt.registerTask('coverage', ['mocha_istanbul']);


};
