export const ACTS_TOUR_STEPS = [
  {
    target: '.acts-tour-step1',
    title: 'Plottr by Act & Chapter',
    content:
      'Welcome to the next level of Plottr! Click here to use and manage act structures in your Plottr project.',
    event: 'hover',
    placement: 'bottom',
    spotlightClicks: true,
    hideCloseButton: true,
    disableBeacon: true,
    styles: {
      buttonNext: {
        display: 'none',
      },
    },
  },
  {
    target: `.acts-tour-step2`,
    title: 'Adding Levels of Structure',
    content:
      "Add levels to place your top row timeline cards in their own defined sections. You can have up to three (3) levels for optimal visual arrangement, and can even make cards for entire sections. Think of the second level as a way to organize your top row cards (which will become 'Scenes') into chapters and the third level to organize your chapters into acts, adding layers of specificity and structure to your Plottr project.",
    placement: 'bottom',
    event: 'hover',
    spotlightClicks: true,
    styles: {
      buttonBack: {
        display: 'none',
      },
      buttonNext: {
        display: 'none',
      },
    },
  },
  {
    target: `.acts-tour-step3`,
    title: 'Removing Levels [CAUTION]',
    content:
      "You can remove levels of hierarchy, but BE CAREFUL as the cards within that chapter or act may be deleted. Once you decide to go with multiple levels of hierarchy, we recommend sticking with at least as many as you choose to add. Pro-tip: you can always hit 'undo.'",
    event: 'hover',
    spotlightClicks: true,
    disableBeacon: true,
  },
  {
    target: `.acts-tour-step4`,
    title: 'Naming and Editing Levels',
    content:
      'You can manage the settings of each level, including the name of the level that appears on the cards (e.g. "Act"), the color and outline of the level, and whether new cards are autonumbered.',
    event: 'hover',
    spotlightClicks: true,
    disableBeacon: true,
  },
  {
    target: `.acts-tour-step5`,
    title: 'Take Plottr to the next level!',
    content: 'Make sure you have added levels or the tour will end here.',
    event: 'hover',
    spotlightClicks: true,
    placement: 'right',
    styles: {
      buttonBack: {
        display: 'none',
      },
      buttonNext: {
        display: 'none',
      },
      options: {
        zIndex: 0,
      },
    },
  },
  {
    target: `.acts-tour-step6`,
    title: 'Adding Acts and Chapters',
    content:
      'Click to the right of higher level cards to add another of that card (e.g. another act). If you just now implemented acts for this project there is only one act (level 3) and/or one chapter (level 2) containing all of your cards. Added acts and chapters show up at the end of the timeline.',
    event: 'hover',
    spotlightClicks: true,
    placement: 'right',
    styles: {
      buttonBack: {
        display: 'none',
      },
      buttonNext: {
        display: 'none',
      },
    },
  },
  {
    target: `.acts-tour-step7`,
    title: 'Compress and Expand Sections',
    content:
      'Click to hide the cards within this section for greater ease of navigation. You can click again to show the cards in this section.',
    event: 'hover',
    spotlightClicks: true,
    styles: {
      buttonBack: {
        display: 'none',
      },
      buttonNext: {
        display: 'none',
      },
    },
  },
  {
    target: `.acts-tour-step8`,
    title: 'Adding Lower-Level Cards',
    content: `Click here to add lower-level cards within their parent section. Lower level cards from other sections can be dragged into this section once there are lower-level cards here (e.g. if this act has at least one chapter then other chapters can be dragged into this act).`,
    event: 'hover',
    // spotlightClicks: false,
  },
  {
    target: `.tour-end`,
    content: 'Click the help menu to take the acts tour again! Happy plotting!',
    spotlightClicks: false,
    disableBeacon: true,
    placement: 'center',
    styles: {
      buttonBack: {
        display: 'none',
      },
    },
  },
]
