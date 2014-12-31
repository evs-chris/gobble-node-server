var sander = require('sander');
var path = require('path');
var spawn = require('child_process').spawn;

module.exports = nodeApp;

function nodeApp(indir, outdir, options, done) {
  var dir = path.resolve(outdir, '../../../.node-app');
  var pidfile = path.resolve(dir, 'NODE-APP.pid');

  if (!nodeApp.inited) {
    nodeApp.inited = true;
    process.on('exit', function() {
      if (nodeApp.child) {
        console.log('killing child ' + nodeApp.child.pid);
        nodeApp.child.kill('SIGINT');
      }
      sander.unlinkSync(pidfile);
    });
    if (sander.existsSync(pidfile)) {
      console.log('It looks like gobble restarted, so I\'m going to try killing the old node app process.');
      var pid = sander.readFileSync(pidfile).toString();
      try {
        process.kill(pid, 'SIGINT');
      } catch (e) {}
    }
  }

  if (sander.existsSync(pidfile)) {
    if (nodeApp.child) {
      console.log('...killing child ' + nodeApp.child.pid);
      nodeApp.child.on('exit', step1);
      nodeApp.child.kill('SIGINT');
    } else step1();
  } else step1();

  function step1() {
    sander.copydirSync(indir).to(dir);
    var exec = options.exec || process.execPath;
    var args = (options.flags || []).concat(path.join('.node-app', options.entry));
    var opts = {};

    var child = nodeApp.child = spawn(exec, args, opts);
    var started = Date.now();
    var timeout = options.timeout || 1000;
    child.on('exit', function() {
      nodeApp.child = undefined;
      if (Date.now() - started < timeout) {
        console.warn('Your node app exited in less than ' + timeout + 'ms. Something may have gone wrong.');
      }
    });
    child.stdout.on('data', nodeApp.log);
    child.stderr.on('data', nodeApp.log);
    sander.writeFileSync(pidfile, child.pid);
    setTimeout(done, timeout);
  }
}
nodeApp.log = function log(data) { console.log(data.toString()); };
