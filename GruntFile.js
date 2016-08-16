'use strict';
var pkg = require('./package.json');

//Using exclusion patterns slows down Grunt significantly
//instead of creating a set of patterns like '**/*.js' and '!**/node_modules/**'
//this method is used to create a set of inclusive patterns for all subdirectories
//skipping node_modules, libs, dist, and any .dirs
//This enables users to create any directory structure they desire.
var createFolderGlobs = function (fileTypePatterns) {
    fileTypePatterns = Array.isArray(fileTypePatterns) ? fileTypePatterns : [fileTypePatterns];
    var ignore = ['node_modules', 'bower_components', 'libs', 'dist', 'temp'];
    var fs = require('fs');
    return fs.readdirSync(process.cwd())
        .map(function (file) {
            if (ignore.indexOf(file) !== -1 ||
                file.indexOf('.') === 0 || !fs.lstatSync(file).isDirectory()) {
                return null;
            } else {
                return fileTypePatterns.map(function (pattern) {
                    return file + '/**/' + pattern;
                });
            }
        })
        .filter(function (patterns) {
            return patterns;
        })
        .concat(fileTypePatterns);
};

module.exports = function(grunt) {
    //var gtx = require('gruntfile-gtx').wrap(grunt);
    //
    //gtx.loadAuto();
    //
    //var gruntConfig = require('./grunt');
    //gruntConfig.package = require('./package.json');


    // load all grunt tasks
    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);
    // Configurable paths for the application
    var appConfig = {
        //app: require('./bower.json').appPath || 'app',
        dist: 'dist'
    };

    grunt.initConfig({
        // Project settings
        yeoman: appConfig,
        preprocess : {
            options: {
                inline: true,
                context : {
                    DEBUG: false
                }
            },
            html : {
                src : [
                    '<%= yeoman.dist %>/index.html',
                    '<%= yeoman.dist %>/views/*.html'
                ]
            },
            js : {
                src: '.tmp/concat/src/app/js/*.js'
            }
        },
        connect: {
            main: {
                options: {
                    port: 9090,
                    hostname: '0.0.0.0'
                }
            },
            dist: {
                options: {
                    port: 8283,
                    hostname: '0.0.0.0',
                    base: 'dist'
                }
            }
        },
        watch: {
            main: {
                options: {
                    livereload: true,
                    livereloadOnError: false,
                    spawn: false
                },
                files: [createFolderGlobs(['*.js', '*.less', '*.html']), '!_SpecRunner.html', '!.grunt'],
                tasks: ['less'] //all the tasks are run dynamically during the watch event handler
            }
        },
        replace: {
            restURL: {
                src: ['.tmp/concat/src/app/js/demo.min.js'],
                //src: ['app/app.constant.js'],
                overwrite: true,                 // overwrite matched source files
                replacements: [{
                    from: /\/\*@restURL\*\/'(.*)'/g,
                    to: function (matchedWord, index, fullText, regexMatches) {
                        var restURL = grunt.option('restURL');
                        if (restURL == null) {
                            return matchedWord;
                        }
                        return '"' + restURL + '"';
                    }
                }]
            },
            GA: {
                src: ['dist/index.html'],
                overwrite: true,                 // overwrite matched source files
                replacements: [{
                    from: /<!--@GoogleAnalytics-->/g,
                    to: function (matchedWord, index, fullText, regexMatches) {
                        return "<script>(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');</script>";
                    }
                }]
            },
        },
        filerev: {
            dist: {
                src: [
                    '<%= yeoman.dist %>/src/app/js/*.js',
                    '<%= yeoman.dist %>/src/css/*.css'
                    //'!<%= yeoman.dist %>/src/images/ignore/*.{png,jpg,jpeg,gif,webp,svg}'
                ]
            }
        },
        useminPrepare: {
            html: 'index.html',
            options: {
                dest: 'dist'
            }
        },
        usemin: {
            html: 'dist/index.html'
        },
        jshint: {
            main: {
                options: {
                    jshintrc: '.jshintrc',
                    jshintignore: '.jshintignore'
                },
                src: createFolderGlobs('*.js')
            }
        },
        bower: {
            install: {
                //just run 'grunt bower:install' and you'll see files from your Bower packages in lib directory
                options: {
                    targetDir: './libs',
                    layout: 'byType',
                    install: true,
                    verbose: true,
                    cleanTargetDir: false,
                    cleanBowerDir: false,
                    bowerOptions: {
                        forceLatest: true,    // Force latest version on conflict
                        production: true
                    }
                }
            }
        },
        clean: {
            before: {
                src: ['dist',
                    '.temp',
                    '.tmp'
                ]
            }
            //after: {
            //    src: ['temp',
            //        'dist/desktop/app.full.min.js',
            //        'dist/desktop/app.full.min.css',
            //    ]
            //}
        },
        less: {
            production: {
                options: {},
                files: {
                    'src/css/app.css': 'src/css/less/app.less'
                }
            }
        },
        copy: {
            main: {
                files: [
                    //{expand: true, src: "**", cwd: 'bower_components/bootstrap/fonts', dest: "dist/src/fonts"},
                    //{expand: true, src: "**", cwd: 'bower_components/font-awesome/fonts', dest: "dist/src/fonts"},
                    //{expand: true, src: "**", cwd: 'bower_components/simple-line-icons/fonts', dest: "dist/src/fonts"},
                    //{expand: true, src: "**", cwd: 'src/fonts/cfm-icon-font/fonts', dest: "dist/src/css/fonts"},
                    //lazy load js lib should manually copy file by file
                    //{expand: true, src: "xeditable.min.js", cwd: 'bower_components/angular-xeditable/dist/js', dest: "dist/bower_components/angular-xeditable/dist/js"},
                    //{expand: true, src: "d3.min.js", cwd: 'bower_components/d3/', dest: "dist/bower_components/d3/"},
                    //{expand: true, src: "c3.min.js", cwd: 'bower_components/c3/', dest: "dist/bower_components/c3/"},
                    //{expand: true, src: ['**'], cwd: 'bower_components/summernote/dist/font/', dest: 'dist/src/css/font/'},
                    //{expand: true, src: "summernote.min.js", cwd: 'bower_components/summernote/dist/', dest: "dist/bower_components/summernote/dist/"},
                    //{expand: true, src: "angular-summernote.min.js", cwd: 'bower_components/angular-summernote/dist/', dest: "dist/bower_components/angular-summernote/dist/"},
                    //{expand: true, src: "chosen-sprite.png", cwd: 'bower_components/bootstrap-chosen/', dest: "dist/src/css/"},
                    //end lazy load js lib
                    //{expand: true, src: "**", cwd: 'src/fonts', dest: "dist/src/fonts"},
                    //{expand: true, src: "**", cwd: 'src/api', dest: "dist/src/api"},
                    //{expand: true, src: "**", cwd: 'src/l10n', dest: "dist/src/l10n"},
                    //{expand: true, src: "**", cwd: 'src/img', dest: "dist/src/img"},
                    //{expand: true, src: ['src/app/resource/**'], dest: 'dist/'},
                    //{expand: true, src: ['src/app/extlibs/**'], dest: 'dist/'},
                    {expand: true, src: ['src/**/*.html'], dest: 'dist/', filter: 'isFile'},
                    {src: 'index.html', dest: 'dist/index.html'}
                ]
            }
        },
        ngAnnotate: {
            main: {
                src: '.tmp/concat/src/app/js/demo.min.js',
                dest: '.tmp/concat/src/app/js/demo.min.js'
            }
        },
        htmlmin: {
            main: {
                options: {
                    collapseBooleanAttributes: true,
                    collapseWhitespace: true,
                    removeAttributeQuotes: true,
                    removeComments: true,
                    removeEmptyAttributes: true,
                    removeScriptTypeAttributes: true,
                    removeStyleLinkTypeAttributes: true
                },
                files: [{
                    expand: true,
                    src: 'dist/**/*.html'
                }]
            }
        },
        //nggettext_extract: {
        //    pot: {
        //        files: {
        //            'src/translation/cfm_template.pot': ['src/**/*.html', 'src/app/localization/*.js']
        //        }
        //    }
        //},
        //nggettext_compile: {
        //    all: {
        //        files: {
        //            'src/app/translations.js': ['src/translation/po/*.po']
        //        }
        //    }
        //}
    });

    grunt.registerTask('build-production', [
        // Prepare
        'clean:before',
        'copy:main',
        'useminPrepare',
        'concat:generated',
        'replace',
        'cssmin:generated',
        'preprocess:html',  // Remove DEBUG code from production builds
        'ngAnnotate',
        'uglify:generated',
        //'nggettext_compile',
        // Process in /temp
        // Process in dist
        'filerev',
        'usemin',
        'htmlmin',
    ]);
    grunt.registerTask('build-test', [
        // Prepare
        'clean:before',
        'copy:main',
        'useminPrepare',
        'concat:generated',
        'replace:restURL',
        'cssmin:generated',
        'preprocess:html',  // Remove DEBUG code from production builds
        'ngAnnotate',
        'uglify:generated',
        //'nggettext_compile',
        // Process in /temp
        // Process in dist
        'filerev',
        'usemin',
        'htmlmin',
    ]);
    grunt.registerTask('dist-serve', ['connect:dist', 'watch']);
    grunt.registerTask('serve', ['connect', 'watch']);
    grunt.registerTask('serve-main', ['connect:main', 'watch']);

    // We need our bower components in order to develop
    //gtx.alias('build:angular', ['recess:less', 'clean:angular', 'copy:angular', 'recess:angular', 'usemin:useminPrepare', 'concat:angular', 'usemin:usemin']);
    //gtx.alias('build:less', ['recess:less']);
    //gtx.alias('build:html', ['clean:html', 'copy:html', 'recess:html', 'swig:html', 'concat:html', 'uglify:html']);
    //gtx.alias('build:landing', ['copy:landing', 'swig:landing']);
    //
    //gtx.alias('release', ['bower-install-simple', 'build:dev', 'bump-commit']);
    //gtx.alias('release-patch', ['bump-only:patch', 'release']);
    //gtx.alias('release-minor', ['bump-only:minor', 'release']);
    //gtx.alias('release-major', ['bump-only:major', 'release']);
    //gtx.alias('prerelease', ['bump-only:prerelease', 'release']);
    //
    //gtx.finalise();
}
