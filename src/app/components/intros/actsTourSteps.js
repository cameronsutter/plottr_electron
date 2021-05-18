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
      "Click the '+' to add levels. This will place your top row timeline cards in their own defined sections. You can have up to three (3) levels for optimal visual arrangement, and can even make cards for entire sections. Think of the second level as a way to organize your top row cards (which will become 'Scenes') into chapters and the third level to organize your chapters into acts, adding layers of specificity and structure to your Plottr project.",
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
      "You can remove levels of hierarchy, but BE CAREFUL as the cards you place directly under the chapter or act on the timeline will be deleted. Pro-tip: you can always hit 'undo' in the Edit menu at the top of the screen.",
    event: 'hover',
    spotlightClicks: true,
    disableBeacon: true,
  },
  {
    target: `.acts-tour-step4`,
    title: 'Naming and Editing Levels',
    content:
      'You can manage the settings of each level, including the name of the level that appears on the cards (e.g. "Act") and the styling of the cards.',
    event: 'hover',
    spotlightClicks: true,
    disableBeacon: true,
  },
  // {
  //   target: `.acts-tour-step5`,
  //   title: 'Take Plottr to the next level!',
  //   content: 'Make sure you have added levels or the tour will end here.',
  //   event: 'hover',
  //   spotlightClicks: true,
  //   placement: 'right',
  //   styles: {
  //     buttonBack: {
  //       display: 'none',
  //     },
  //     buttonNext: {
  //       display: 'none',
  //     },
  //     options: {
  //       zIndex: 0,
  //     },
  //   },
  // },
  {
    target: `.acts-tour-step6`,
    title: 'Adding Acts and Chapters',
    content:
      'Click next to higher level cards to add another of that card (e.g. another act). If you just now implemented acts for this project there is only one act (level 3) and/or one chapter (level 2) containing all of your cards. Added acts and chapters display at the end of the section, which may be at the end of the timeline. The timeline will autoscroll to and highlight the card you just added.',
    event: 'hover',
    spotlightClicks: true,
    styles: {
      buttonBack: {
        display: 'none',
      },
      buttonNext: {
        display: 'none',
      },
      options: {
        zIndex: 10,
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
    content: `Click here to add lower-level cards within their parent section. Cards can be dragged and dropped onto/next to cards of the same level or one level up.`,
    event: 'hover',
    spotlightClicks: true,
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
