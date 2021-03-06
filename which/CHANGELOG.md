# Changes


## v1.2.10

* Use env.PATH only, not env.Path

## v1.2.9

* fix for paths starting with ../
* Remove unused `is-absolute` module

## v1.2.8

* bullet items in changelog that contain (but don't start with) #

## v1.2.7

* strip 'update changelog' changelog entries out of changelog

## v1.2.6

* make the changelog bulleted

## v1.2.5

* make a changelog, and keep it up to date
* don't include tests in package
* Properly handle relative-path executables
* appveyor
* Attach error code to Not Found error
* Make tests pass on Windows

## v1.2.4

* Fix typo

## v1.2.3

* update isexe, fix regression in pathExt handling

## v1.2.2

* update deps, use isexe module, test windows

## v1.2.1

* Sometimes windows PATH entries are quoted
* Fixed a bug in the check for group and user mode bits. This bug was introduced during refactoring for supporting strict mode.
* doc cli

## v1.2.0

* Add support for opt.all and -as cli flags
* test the bin
* update travis
* Allow checking for multiple programs in bin/which
* tap 2

## v1.1.2

* travis
* Refactored and fixed undefined error on Windows
* Support strict mode

## v1.1.1

* test +g exes against secondary groups, if available
* Use windows exe semantics on cygwin & msys
* cwd should be first in path on win32, not last
* Handle lower-case 'env.Path' on Windows
* Update docs
* use single-quotes

## v1.1.0

* Add tests, depend on is-absolute

## v1.0.9

* which.js: root is allowed to execute files owned by anyone

## v1.0.8

* don't use graceful-fs

## v1.0.7

* add license to package.json

## v1.0.6

* isc license

## 1.0.5

* Awful typo

## 1.0.4

* Test for path absoluteness properly
* win: Allow '' as a pathext if cmd has a . in it

## 1.0.3

* Remove references to execPath
* Make `which.sync()` work on Windows by honoring the PATHEXT variable.
* Make `isExe()` always return true on Windows.
* MIT

## 1.0.2

* Only files can be exes

## 1.0.1

* Respect the PATHEXT env for win32 support
* should 0755 the bin
* binary
* guts
* package
* 1st
