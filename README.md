# Backup Contacts - Firefox OS

This Firefox OS app will allow you to save your contact database in a .vcf file on your sdcard.

With this backup file, you'll be able to re-import your contacts if you lost them, or if you flash your device.

19/06/2013: this is my first Firefox OS app, based on the Mozilla Hacks blog Todo article. It currently can browse contact but not save them to the sdcard.

If you can help, some hints on how to write content on sdcard would help a lot :)

## Structure

This web project has the following setup:

* www/ - the web assets for the project
    * index.html - the entry point into the app.
    * js/
        * app.js - the top-level config script used by index.html
        * app/ - the directory to store project-specific scripts.
        * lib/ - the directory to hold third party scripts.
* tools/ - the build tools to optimize the project.

To optimize, run:

    volo build

This will run the "build" command in the volofile that is in this directory.

That build command creates an optimized version of the project in a
**www-built** directory. The js/app.js file will be optimized to include
all of its dependencies.

For more information on the optimizer:
http://requirejs.org/docs/optimization.html

For more information on using requirejs:
http://requirejs.org/docs/api.html
