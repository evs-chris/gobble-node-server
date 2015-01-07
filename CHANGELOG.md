## 0.1.0

* Renames function to `nodeServer` to match package name
* Adds an `appflags` option that allows passing arguments to the node script (as opposed to node itself)
* Runs inside input directory (upstream) instead of copying to an external directory and running there
* Dies if the target app exits before the timeout instead of just warning
* Adds an `init` option that allows changing flags at a slightly later stage

## 0.0.1

Initial version
