var colors = require('colors');
var path = require('path');
var git = require('simple-git')(__dirname);
var deploy = require('gh-pages-deploy');
var packageJSON = require('require-module')('./package.json');

var success = 1;
git.fetch('origin', 'master', function(err) {
    if (err) throw err;
    git.status(function(err, status) {
        if (err) throw err;
        if (!status.isClean()) {
            success = 0;
            console.error('Error: You have uncommitted changes! Please commit them first'.red);   
        }

        if (status.current !== 'master') {
            success = 0;
            console.warn('Warning: Please deploy from the master branch!'.yellow)
        }

        git.diffSummary(['origin/master'], function(err, diff) {
            if (err) throw err;

            if (diff.files.length || diff.insertions || diff.deletions) {
                success = 0;
                console.error('Error: Current branch is different from origin/master! Please push all changes first'.red)
            }

            if (success) {
                var cfg = packageJSON['gh-pages-deploy'] || {};
                var buildCmd = deploy.getFullCmd(cfg);
                deploy.displayCmds(deploy.getFullCmd(cfg));
                deploy.execBuild(buildCmd, cfg);
            }
        })
    })
})