# pltr
Everything to manage Plottr's file type

Copyright 2017 C Louis S, LLC

## Data Repairers
The root reducer and all its children accept a `dataRepairers` object.

`dataRepairers` is an object which contains various repairs to be made to the data that's loaded from files.  We have it here because often we make fixes to the application which we can't apply to files in the wild.  The best we can do is make sure that the problems are fixed when we load the file into the application.  It's the responsibility of each reducer to use applicable data repairers to fix pieces of data which they apply to.  The schema of the object is as follows:

```
{
  normalizeRCEContent: RCEContent => RCEContent
}
```
