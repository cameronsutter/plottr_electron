# Environment Variables
This project requires that you specify environment variables in order
to connect to Firebase.  You may place these into a file called `.env`
at the root of the project.

At the time of writing this, we require two variables and your `.env`
file might look something like the following:

```
FIREBASE_KEY=IM_A_KEY_THAT_YOU_SHOULD_REPLACE
API_BASE_DOMAIN=plottr-web-alpha.vercel.app
```

# `Pltr` Library

The core feature set of `Plottr` is modelled using actions, reducers
and selectors. It depends on `redux` to model state coherently and
uses several pieces of middleware to augment the data store with
features such as histories and undo.

All of this logic is intended to be housed in the `pltr` library. You
can find a sub tree of this repository, containing the `pltr` library,
in `/lib/pltr`.

## First Time Usage of `Pltr`

Before you get developing in this repository, be sure to set up
`pltr`'s repository as a remote to make it easier to work with the
subtree.

Use the following command to add `pltr` as a remote:

```bash
    git remote add -f pltr git@github.com:Plotinator/pltr.git
```

navigate to lib/pltr and install packages with `npm install`
(and don't forget to navigate back to the root)

## Developing With the `Pltr` Subtree

To develop the project and then downstream your changes back to
`pltr`, you should develop as though `pltr` is part of this
repository. There is no need to split commits or treat `pltr`
specially in any way, until you want to do one of two things:

1. Push your changes to `pltr` to it's repository.
2. Pull the changes made to `pltr` in it's repository into this
   repository.

To do 1. run the following command:

```bash
    git subtree push --prefix=lib/pltr/ pltr <your-branch-name-here>
```

To do 2. run the following command:

```bash
    git subtree pull --prefix lib/pltr pltr master --squash
```

## Embedding `Pltr` (Do Not Run)

This section is here to document the process which resulted in `pltr`
embedded as a subtree in this repository.

The following command embeds `pltr` into the current repository at a
path of `/lib`.

```bash
    git subtree add --prefix lib/pltr pltr master --squash
```

# The `plottr_components` Library

The [component library repo](https://github.com/Plotinator/plottr_components) is the new home of our components! :)

## Working With the Library

You change the `plottr_components` library the same way you would work with `plottr_locales` or `pltr`.
i.e. develop `plottr_electron` as though it doesn't contain any subtrees, and push the changes to Github using the subtree commands in the [Readme](https://github.com/cameronsutter/plottr_electron#readme).

## Working Out-Of-Tree

You can also work on the components out-of-tree (i.e. checked out to a folder other than `plottr_electron/lib`) as long as the other Plottr libraries are checked out as sibling folders of this library.
i.e. you can checkout `pltr`, `plottr_locales` and `plottr_components` to an arbitrary folder on your computer and work with them like they're individual git repositories.

## Storybook

The component library comes with Storybook installed and configured.
Storybook helps you develop components in isolation of the rest of the application to be more sure that the components work in isolation.
The idea here is that if it works and looks good in Storybook, then it's the application's job to replicate how it looks and behaves in Storybook.

### Starting the Watch-Compiler for Components

You need to start a watcher process for the component library as well as the `plottr_electron` app if you're making changes to components.
To start the component library watch compiler, run the following commands from the root of the repository:

```bash
  cd lib/plottr_components
  npm run start
```

The compiler doesn't use webpack and doesn't minify anything.
It simply runs the Sass compiler and babel directly.
It's intended to be a light-weight process which reflects changes quickly, aids in debugging and doesn't place more burden on your system.

### Starting Storybook

While you make changes to components it's recommended that you start up Storybook to watch how the components look in isolation from `plottr_electron`.
You can start the storybook by running the following commands from the root of the repository:

```bash
  cd lib/plottr_components
  npm run storybook
```

The storybook will open in a new tab and changes that you make to components will reflect via Webpack's Hot Module Reloading (HMR) -- i.e. they'll reflect pretty quickly and without refreshing the page.

# The `plottr_firebase` Library

The [firebase library repo](https://github.com/Plotinator/plottr_firebase) is a library of functions for connecting to and using Firebase in Plottr.

## Working With the Library

You change the `plottr_firebase` library the same way you would work with `plottr_locales` or `pltr`.
i.e. develop `plottr_electron` as though it doesn't contain any subtrees, and push the changes to Github using the subtree commands in the [Readme](https://github.com/cameronsutter/plottr_electron#readme).

## Working Out-Of-Tree

You can also work on the firebase library out-of-tree (i.e. checked out to a folder other than `plottr_electron/lib`) as long as the other Plottr libraries are checked out as sibling folders of this library.
i.e. you can checkout `pltr`, `plottr_locales`, `plottr_components`, `plottr_firebase` and `plottr_import_export` to an arbitrary folder on your computer and work with them like they're individual git repositories.

# The `plottr_import_export` Library

The [import export repo](https://github.com/Plotinator/plottr_import_export) is a library of functions for importing and exporting between Plottr files and supported types.

## Working with the library

You change the `plottr_firebase` library the same way you would work with `plottr_locales` or `pltr`.
i.e. develop `plottr_electron` as though it doesn't contain any subtrees, and push the changes to Github using the subtree commands in the [Readme](https://github.com/cameronsutter/plottr_electron#readme).

## Working Out-Of-Tree

You can also work on the import export library out-of-tree (i.e. checked out to a folder other than `plottr_electron/lib`) as long as the other Plottr libraries are checked out as sibling folders of this library.
i.e. you can checkout `pltr`, `plottr_locales`, `plottr_components`, `plottr_firebase` and `plottr_import_export` to an arbitrary folder on your computer and work with them like they're individual git repositories.

## Usage

To use `plottr_import_export`, simply call one of the functions exposed by the library.

For more detail on what the library provides, please refer to its documentation at: `lib/plottr_import_export/README.md`.

# Features

## Offline Mode
Offline mode is there for people to continue working on Pro files when their Internet connection goes down.

Here's what I wrote about it when I asked for help testing it:

The easiest way to test it is to go to the network tab on the inspector and select “offline” on the throttle drop down.
What you should see is the following:
 - A bar appears at the bottom to indicate that offline mode is on (I haven’t paid a lot of attention to styling it, and the last time I posted a screenshot we all seemed happy with it),
 - The current file should become associated with a file in <appFolder>/offline/<encoded-file-name>.pltr, (e.g. /Users/edward/Library/Application Support/plottr/offline/my%20file.pltr).  When you save etc. this file should be updated.
 - When you open the dashboard, it should list the files in the offline directory (as above).
 - When you resume the Internet connection, it should show a busy dialog and prevent you from interacting with the app.
 - It’ll resolve the dialog when it determines what needs to happen.  There are four possibilities:
   1. It detects no changes and simply switches back to the online file.
   2. It detects that you changed the local file, and the online file didn’t change.  In which case, it should overwrite the online file with your changes.
   3. It detects that you didn’t change the local file, and the online file did change.  In which case, it should switch to the online file and you should see the updates that were made online.
   4. It detects that both the online and the offline file changed.  In which case, it should warn you that it’s making a backup of your file and switching to the online file.  You should find the backup on the dashboard.
 - After it’s finished “resuming” (there’s state in redux and a component which track this state) it should have switched to online mode and changes you make should be reflected on Plottr cloud again.

Another note that taken during a Slack discussion that might help understand the feature.

> The feature itself should work as follows:
> While a user plots in Plottr Pro, all changes are backed up in a hidden offline copy.
> If the machine running Plottr loses its connection to the Internet, we notify the user that they're now working offline (there should be a banner across the bottom).
>
> A couple of things might happen now:
> a. The user quits Plottr without modifying the file.
> b. The user plots some more on the machine that lost its connection.
> c. The user modifies the file on another machine that's still connected to the Internet.
>
> Later on, there are also some potential scenarios:
> 1. The user starts Plottr while not connected to the Internet.
> 2. The user starts Plottr after reconnecting to the Internet.
> 3. The machine re-acquires the Internet connection without the user closing Plottr.
>
> If a. then 1. happens, users are presented with the files that they were working on previously, but they're loaded from the local file system.  This sequence leads to scenario b.
> If a. then 2. happens, Plottr checks for drift between the file stored online and the file stored locally when it boots any file (more on drift resolution later).
> If b. then 2. happens, Plottr checks for drift as above (when Plottr boots a file).
> If b. then 3. happens, then Plottr presents a "resuming" dialog to the user that prevents further plotting (plottring? :slightly_smiling_face:) before we fetch the online file and check for drift.
>
> Resolving Drift:
> In the case of a., optionally followed by c., followed by 1., 2., or 3., Plottr recognises that the user didn't modify the local file and accepts all changes from the remote file.
> In the case of b. followed optionally by 1. then 2. or 3. but not c. Plottr sees that the remote file didn't change and overwrites it with local changes.
> In the case of b. and c. followed optionally by 1. and then either 2. or 3., Plottr does the same thing as Dropbox: it creates a "conflicted copy" (which we call a resume backup and put a date-stamp on it), adds that copy to the list of all of your files, and then it opens  the online file.  i.e. if the file changes locally while offline and on the remote server, we backup the local copy and start using the remote copy.

## File Bootup Sequence
Here's how booting a file works.
1. `app.whenReady` create a new window with **no file path**.
2. `BrowserWindow` **starts**.
3. After loading settings, checking pro session etc. as described by
   the selector: `applicationIsBusyButFileCouldBeUnloadedSelector` we
   **ask the main process** for state using `pls-fetch-state`.
4. The main process finds that the file has no file path and checks
   whether there is a **valid latest file** (i.e. if we're on pro then
   latest file must be a cloud file).
5. Main process replies with **either the latest file or null** along
   with the number of open windows and new file options.
6. The window receives the payload back and checks the settings to see
   whether the **dashboard should load** on the first window.

   a. If the window count is **1**, and the setting **is on**, then
   the dashboard is loaded and whatever is in **the latest file slot
   is ignored**.  According to the main process, this window will
   remain with a null file path forever.

   b. If the window count is **2**, or the settings **is off**, and
   there is a **non-null latest file**, then we load that file and ask
   the main process to associate it's file path with the receiving
   window's corresponding window object on the main process.

   c. If the window count is **2**, or the settings **is off**, and
   there is a **null latest file**, then we don't load any file and we
   don't let the user exit the full-screen dashboard.

 - In the alternative flow, we're opening a file that we **just
   created** or a **pre-existing file**.
 - In both instances the change is that the `filePath` **is known**
   and stored on the window object on the main process.
 - So we'll reply with that path and **ignore conditions 6.a-c** so
   that we simply open the file.

# License Management

The following is a description of how Plottr uses EDD to manage licenses.

On our wordpress site (my.plottr.com) we use a plugin called Easy Digital Downloads (EDD) for purchases. EDD has a license key system as an additional plugin. You can configure the license keys for things like number of activations, lifetime vs duration, etc
We have several “products” which are called “downloads” in EDD that are different forms of access to Plottr. Some are no longer being sold but users are still on those plans (Windows only, Mac only, both platforms bundled together, “Universal” which is what Ryan calls the non-platform dependent product, lifetime, annual, etc)
We use a few API endpoints directed at my.plottr.com and handled by EDD which activate and check licenses. Plottr calls out to these endpoints and receives a json response
When a user makes a purchase, we’ve added some code in the EDD plugin to create a user in Firebase with the same email/pw. There is also another WP plugin that we are using called Firebase PRO that acts as a single-sign-on between the WP user and the Firebase user
When a user purchases lifetime Pro, it creates a lifetime “claim” in their firebase user through a Zapier integration. (WP --> Zapier --> Firebase). When a user purchases non-lifetime Pro, we will check if they have an active subscription in EDD for Pro using the /subscriptions EDD endpoint

# Debugging Tests

To debug a test:

1. start the chrome dedicated debugger for node by: running chrome, navigating to `chrome://inspect/`, "Open dedicated DevTools for Node"
2. add a `debugger` line to the test that you want to debug,
3. change the path to the test to debug in the script `test:debug` in `package.json` to point at the test that you want to debug. e.g. `"node --inspect node_modules/.bin/jest --runInBand src/app/components/rce/__tests__/RichTextEditor.test.js"` -> `"node --inspect node_modules/.bin/jest --runInBand <path-to-your-test>"`,
4. run the script (`npm run test:debug`),
5. the dedicated debugger should detect the node process and launch a debugging process.

# Copyright Notice

Copyright 2016-2021 Fictional Devices LLC
