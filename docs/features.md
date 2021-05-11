# Major features

## Act Structure

### Motivation
As a user, I'd like to organise my literary work into units of varying sizes.
For example, I'd like to organise short sequences into scenes and group scenes into chapters.
I'd also like to change how the organisational units look and the different sizes of literary-units.

### Solution: Act Structure
Organise beats into a tree data structure that encodes the concept of groups of beats and their corresponding scene cards belonging to different literary-unit sizes.

#### Conceptual Description
A beat has a level, and children associated with it.
The "null beat" is the parent of all 0-level beats.
One may traverse the tree of beats by starting at "null" and working their way down to the point that there are no children left.

#### Technical Description
Beats is no longer an array, but an object-index of `bookId` -> `BeatTree`.
A `BeatTree` has three properties:
 - `index`: an object-index of `beatId` -> `Beat`,
 - `heap`: an object-index of `beatId` -> parent `beatId`, and
 - `children`: an object-index of `beatId` -> [child `beatId`].

 This feature adds a library to make it simpler to work with the tree data structure, called `tree.js`.
 The API should serve most purposes and has unit tests for every function.
 In cases where the API isn't sufficient, there are useful functions for general-purpose traversal of the tree as follows:
  - `filter`,
  - `map`, and
  - `reduce`,
Which, together with the other library functions, should be sufficient to model most functionality.

#### Visual Changes
##### Beat Title Cells
Beat titles have configurable styles.
The user can change:
 - the border colour,
 - the background colour,
 - the border type (dotted, dashed, none and solid),
 - auto numbering,
 - the font size, and
 - the name of an auto-named beat.

##### Act Structure Settings
On the dashboard settings area, there's a new section for "Beta" features.
The only setting there, for the time being, is the act structure.
Toggling this switch turns the feature on for all open windows and ensures that new files are made consistent with the preference, i.e. if the user wasn't using beats hierarchy for a project, turns on act structure and then opens the file, then the file is made consistent with the feature.

##### Beat Config Modal
This feature adds a modal to configure the number of hierarchy levels, and the properties for each level listed in the "Beat Title Cells" section.
The user may change the number of hierarchy levels with up and down adjustment controls and change the properties for each level of the hierarchy.

#### Special Cases

##### Don't use Empty File Lines When Migrating Templates to Apply to Timelines
Previous versions of `plottr` supported exporting without a line and applied a template by creating a line with a title that equalled the template's title.
The problem with doing this is that it's hard to migrate partial templates.
A previous commit ensured that templates are created with a line.
Partial templates could still exist in user's templates files.
So this change supports that case by special-casing the application of templates to new timelines.

##### Use Different Templates For Beta On/Off
###### Motivation
 - We want to leave the user experience unchanged when the user turns the beta off.
 - While the beta is on, we want to leverage the new structure to create richer templates (e.g. templates with acts will have Acts on the timeline).

###### Mechanics
Every time that the user changes the beta feature, we force a fetch and update of templates.

###### See Also
New templates fetched from: https://github.com/Plotinator/plottr_templates/pull/3

##### Motivation
When the Act Hierarchy is turned off, we want the user's experience to be the same as it was before.

###### Change
This change special cases beat titles.
If hierarchy is enabled and we're in the series view, we'll use the word "Beat" for auto-titling.
If hierarchy is enabled and we're in a book view, we'll use the word "Chapter" for auto-titling.

###### Notes
When we un-beta this feature, it'll be imperative to clean up all the extra wiring.
It really is a bit cumbersome to pass the extra flags around!
