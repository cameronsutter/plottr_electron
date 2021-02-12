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

# Debugging Tests
To debug a test:

1. start the chrome dedicated debugger for node by: running chrome, navigating to `chrome://inspect/`, "Open dedicated DevTools for Node"
2. add a `debugger` line to the test that you want to debug,
3. change the path to the test to debug in the script `test:debug` in `package.json` to point at the test that you want to debug.  e.g. `"node --inspect node_modules/.bin/jest --runInBand src/app/components/rce/__tests__/RichTextEditor.test.js"` -> `"node --inspect node_modules/.bin/jest --runInBand <path-to-your-test>"`,
4. run the script (`npm run test:debug`),
5. the dedicated debugger should detect the node process and launch a debugging process.

# Copyright Notice

Copyright 2016-2020 Fictional Devices LLC
