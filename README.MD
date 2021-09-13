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

You can also work on the firebase out-of-tree (i.e. checked out to a folder other than `plottr_electron/lib`) as long as the other Plottr libraries are checked out as sibling folders of this library.
i.e. you can checkout `pltr`, `plottr_locales` and `plottr_components` and `plottr_firebase` to an arbitrary folder on your computer and work with them like they're individual git repositories.

## Usage

To use `plottr_firebase`, simply call one of the functions exposed by the library.  It's been designed to have zero overhead for setup at the expense of some things being hard-wired (such as configuration).

For more detail on what the library provides, please refer to its documentation at: `lib/plottr_firebase/README.md`.

# Debugging Tests

To debug a test:

1. start the chrome dedicated debugger for node by: running chrome, navigating to `chrome://inspect/`, "Open dedicated DevTools for Node"
2. add a `debugger` line to the test that you want to debug,
3. change the path to the test to debug in the script `test:debug` in `package.json` to point at the test that you want to debug. e.g. `"node --inspect node_modules/.bin/jest --runInBand src/app/components/rce/__tests__/RichTextEditor.test.js"` -> `"node --inspect node_modules/.bin/jest --runInBand <path-to-your-test>"`,
4. run the script (`npm run test:debug`),
5. the dedicated debugger should detect the node process and launch a debugging process.

# Copyright Notice

Copyright 2016-2021 Fictional Devices LLC
