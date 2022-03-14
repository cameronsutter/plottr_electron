# Plottr Firebase

This library contains a collection of functions to bind a Plottr
application to Firebase as a back end for collaboration and file
storage.

# Scripts

This library provides a number of convenience scripts to help develop
applications against Plottr's Firebase instance.

## Specifying the Project

Before running the emulators etc. you need to tell Firebase which
project to use. You can do this with the command `firebase use plottr-ci`.

## Emulators

The local emulators are provided by Google to enable development in
sandbox environment. The command `yarn start-emulators` will launch a
console to manage and monitor these emulators as well as two servers:

1. an authentication emulator, and
2. a firestore emulator.

If you're running your project in `development` mode (i.e. the
`NODE_ENV` is set to `development`) the configuration is automatically
switched for a local connection. i.e. this library will automatically
attempt to connect to the local emulators (whether or not they're
running) when the library is loaded in a process that's in
`development` mode.

### Seeding

The emulator can be seeded with three files (Goldilocks, The Three
Little Pigs and Pride and Prejudice) by running: `yarn seed-firestore`.

The seeding script also adds a test user. Use the following credentials to log into that user:

- username: "test@test.com", and
- password: "tester".

### Permissions

The seeding script adds the three files to Firestore. It doesn't
grant any user permission to use them.

The command `yarn grant-all-permissions` gives the "owner" permission
to all users in the database to all files in the database.

The command `yarn grant-test-permissions` cycles through all users and
then cycles through the three permission types "owner", "collaborator"
and "viewer" while simultaneously cycling through all of the files and
assigning the current permission to the current user to the current
file. If this script is run immediately following the
`seed-firestore` script, the test user will have one file shared in
each of those three states. This is ideal for testing the permission
states.

# Responsibilities

This library is responsible for self-configuration, connecting to
Firebase and providing functions to query, listen for changes and
publish new changes to Firestore.

## Configuration

The repository contains the configuration to connect to Firebase. It
doesn't need to be configured by the dependant module.

## Connection

Dependence on the library seeds a global connection to Firebase that's
managed by the library.

# API Documentation

The library exposes the following functions:

## Fetching And Subscriptions

### Fetch Files

`fetchFiles(userId: String): Promise<File[]>`

Produce a `Promise` that will be resolved with an array of files that
the user with id `userId` has access to. Each of those records will
identify the access that the user has to the corresponding Plottr file
in the `permission` field.

### Initial Fetch

`initialFetch(userId: String, fileId: String, clientId: String, version: String): Promise<PlottrFile>`

Fetch all the documents in Firestore corresponding to the Plottr file
accessed by user with id `userId`, belonging to file with id `fileId`
at paths:

- `files`,
- `cards`,
- `series`,
- `books`,
- `categories`,
- `characters`,
- `customAttributes`,
- `lines`,
- `notes`,
- `places`,
- `tags`,
- `hierarchyLevels`,
- `images`, and
- `client`.

The `clientId` must uniquely identify the running process that made
the call so that other clients can differentiate between themselves
and this process. This is important for collaborative editing
features.

The `fileVersion` must correspond with the current version of file
loaded from Firestore. It's needed for edge cases where the schema of
a key changed. (See `index.js:listenToBeats`).

Produce a `Promise` containing the `PlottrFile` **prior** to migrating
the file.

### Listen

`listen(store: ReduxStore, userId: String, fileId: String, clientId: String, fileVersion: String): Promise<Function[]>`

Start listening to changes in the documents in Firestore to update the
given `store` with those changes. The file is accessed by user with
id `userId`, belonging to file with id `fileId` at paths:

- `files`,
- `cards`,
- `series`,
- `books`,
- `categories`,
- `characters`,
- `customAttributes`,
- `lines`,
- `notes`,
- `places`,
- `tags`,
- `hierarchyLevels`,
- `images`, and
- `client`.

The `clientId` must uniquely identify the running process that made
the call so that other clients can differentiate between themselves
and this process. This is important for collaborative editing
features.

The `fileVersion` must correspond with the current version of file
loaded from Firestore. It's needed for edge cases where the schema of
a key changed. (See `index.js:listenToBeats`).

Whenever a change to a key for the Plottr file in Firestore is
communicated back to the process that invoked this function, a
corresponding patch action is dispatched to `store` to update that
key.

To stop listening for changes (for example when changing files)
iterate through the returned functions and call them. The functions
are produced by the Firebase library and may be called to cancel a
subscription.

### Listen To Custom Templates

`listenToCustomTemplates(userId: String, callback: (Template => Void)): Promise<Function[]>`

Register a `callback` with Firebase to be called every time that the
templates owned by user with id `userId` are updated.

The callback is also called initially.

## Updating

### Overwrite All Keys

`overwriteAllKeys(fileId: String, clientId: String, state: PlottrFile): Promise<Any[]>`

For the file with id `fileId`, edited by process with id `clientId`,
overwrite all keys in Firestore with the values in the corresponding
slots in `state`.

`clientId` must uniquely identify the running process requesting the
change for the purposes of collaborative editing.

### Edit File Name

`editFileName(fileId: String, newName: String): Promise<Any>`

Update the `file` document with id `fileId` to have `fileName`
`newName`.

### Patch

`patch(path: String, fileId: String, payload: Object, clientId: String): Promise<Any>`

Update the document at `path` that has file id `fileId` with the
values in `payload` from the process that can be uniquely identified
by `clientId`.

Produce a `Promise` which, when resolved, indicates that the action
was completed.

### Owerwrite

`owerwrite(path: String, fileId: String, payload: Object, clientId: String): Promise<Any>`

Overwrite the contents of the document at `path` that has file id
`fileId` with the values in `payload` from the process that can be
uniquely identified by `clientId`.

Produce a `Promise` which, when resolved, indicates that the action
was completed.

### Share Document

`shareDocument(fileId: String, emailAddress: String): Promise<String>`

Share file with id `fileId` (owned by the current user and if not then
produce a failed Promise) with user that has email address
`emailAddress`.

Produce a `Promise` which, when resolved, contains the unique token
that should be emailed to the user for them to accept the invitation
when logging in.

### Save Custom Template

`saveCustomTemplate(userId: String, template: Template): Promise<Any>`

Save `template` to user with id `userId`s custom templates in
Firebase.

Produce a `Promise` which, when resolved, indicates whether the
operation was successful.

### Edit Custom Template

`editCustomTemplate(userId: String, template: Object): Promise<Any>`

Edit `template` belonging to user with id `userId` in Firebase.

Produce a `Promise` which, when resolved, indicates whether the
operation was successful.

### Save Backup

`saveBackup(userId: String, file: PlottrFile): Promise<Any>`

Take a backup of `file` belonging to user with id `userId` and produce
a `Promise` which, when resolved, indicates that the appropriate
backup was taken.

Strategy is:

- First, check whether any backups for today exist and if there are
  none, then take a "start of session" backup.
- Otherwise, update or create the mid-session backup.

The strategy results in at-most two backups per day. Backups are
cleared on a 30 day rolling window when they exceed 60 backups.

## Deleting

### Delete File

`deleteFile(fileId: String, userId: String, clientId: String): Promise<Any[]>`

Mark all the documents in Firestore corresponding to file with id
`fileId`, as deleted.

The change is requested by user with id `userId` and from a client
with id, that uniquely identifies this running process, `clientId`.

Note that the file is not actually removed from Firestore. It's the
responsibility of the client library to exclude deleted files from the
client's UI.

Produce a `Promise` with an array of update results in it.

### Delete Custom Template

`deleteCustomTemplate(userId: String, templateId: String): Promise<Any>`

Mark the template with id `templateId` that belongs to user with id
`userId` as deleted. The template is not actually removed from
Firebase.

Produces a `Promise` which, when resolved, indicates whether the
operation was successful.

## Session Management

### Log Out

`logOut(): Promise<Void>`

Produce a `Promise` which, when resolved, indicates that the current
user was logged out.

### On Session Change

`onSessionChange(cb: (User | Null => Void)): Void`

Register `cb`, a callback function, to be called by Firebase whenever
the session changes. The callback function is called with the current
user if there is on.

### Firebase UI

`firebaseUI(): AuthUI`

Produce an instantiated singleton instance of the Firebase Auth UI.
See [https://firebase.google.com/docs/auth/web/firebaseui].

### Start UI

`startUI(firebaseUI: AuthUI, queryString: String): Void`

Instruct Firebase to mount the authentication interface corresponding
to `firebaseUI` to the DOM node corresponding to `queryString`.

## Utilities

### With File Id

`withFileId(fileId: String, file: PlottrFile): PlottrFile`

Produce a copy of `file` with the `file.id` in `file` to `fileId`.

### To Firestore Array

`toFirestoreArray(array: Any[]): Object`

Produce an object whose keys correspond to the indices in `array` and
whose values correspond to the values in `array`.

### Has Undefined Value

`hasUndefinedValue(object: Object): Bool`

Produce `true` if any key or sub key recursively in `object` has value
`undefined`. This is useful for debugging update/set requests to
Firestore that fail because Firestore doesn't support undefined values.

# Tribal Knowledge

This section elucidates details that might help other developers avoid
deep rabbit holes.

## Informing Clients About Updates to Files

Clients listen to the `authorisation` collection in Firestore for
changes in the files list. In order to inform a client that the name
of a file changed, or that a file was deleted and should no longer be
displayed, you should change the `authorisation` collection.

This presents a problem because authorisation is read-only to all
clients. To update a timestamp on the appropriate record, we instead
call an API `/api/ping-auth`. When the API isn't on the same host,
specify the API_BASE_DOMAIN environment variable to point it at another
server.
