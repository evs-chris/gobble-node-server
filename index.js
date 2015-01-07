var sander = require('sander');
var path = require('path');
var spawn = require('child_process').spawn;

module.exports = nodeServer;

function noop() {}

function nodeServer(indir, outdir, options, done) {
  var pidfile = path.resolve(process.cwd(), options.pidfile || 'NODE-APP.pid');
  var log = this.log || noop;

  options.pidfile = pidfile;

  if (typeof options.init === 'function') {
    options.init.call(this, options);
  }

  if (!nodeServer.inited) {
    nodeServer.inited = true;
    process.on('exit', function() {
      if (nodeServer.child) {
        console.log('killing child ' + nodeServer.child.pid);
        nodeServer.child.kill('SIGINT');
      }
      sander.unlinkSync(pidfile);
    });
    if (sander.existsSync(pidfile)) {
      log('\nIt looks like gobble restarted, so I\'m going to try killing the old node app process.');
      var pid = sander.readFileSync(pidfile).toString();
      try {
        process.kill(pid, 'SIGINT');
      } catch (e) {}
    }
  }

  if (sander.existsSync(pidfile)) {
    if (nodeServer.child) {
      console.log('...killing child ' + nodeServer.child.pid);
      nodeServer.child.on('exit', step1);
      nodeServer.child.kill('SIGINT');
    } else step1();
  } else step1();

  function step1() {
    var exec = options.exec || process.execPath;
    var args = (options.flags || []).concat(path.join(indir, options.entry));
    if (Array.isArray(options.appflags)) args = args.concat(options.appflags);
    var opts = {
      cwd: indir
    };

    var child = nodeServer.child = spawn(exec, args, opts);
    var started = Date.now();
    var timeout = options.timeout || 1000;
    var failed = false;

    child.on('exit', function() {
      nodeServer.child = undefined;
      if (Date.now() - started < timeout) {
        console.warn('Your node app exited in less than ' + timeout + 'ms. Something may have gone wrong.');
        failed = true;
      }
    });
    child.stdout.on('data', nodeServer.log);
    child.stderr.on('data', nodeServer.log);
    sander.writeFileSync(pidfile, child.pid);
    setTimeout(function() {
      if (failed) done(new Error('Your app exited before the timeout expired.'));
      else done();
    }, timeout);
  }
}
nodeServer.log = function log(data) { console.log(data.toString()); };
