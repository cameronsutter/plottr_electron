# Plottr Components
This is a component library which we use to build the desktop and
website versions of Plottr.

## Conventions

### Embedding
This repository is usually embedded into a folder called `lib` at the
root of the dependant-application's.

Use the following commands to push and pull as a subtree (if you're
working inside of an application).

```bash
    git subtree push --prefix=lib/plottr_components/ plottr_components <your-branch-name-here>
```

```bash
    git subtree pull --prefix lib/plottr_components plottr_components master --squash
```

### Dependency on Other Plottr Libraries
This library depends on `plottr_locale` and `pltr`.  It depends on
them by symbolic link e.g. `file:../pltr`.

Plottr Components expects the other Plottr libraries to be located one
directory up in the file system.  This is what enables us to develop
the libraries both in- and out-of-tree.
