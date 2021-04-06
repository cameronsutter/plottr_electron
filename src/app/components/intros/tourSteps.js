export const ACTS_TOUR_STEPS = [
    {
      // target:`[step='step1']`,
      target:'.acts-tour-step1',
      content:'Click here to use and manage act structures in your Plottr project.',
      event:'hover',
      placement: "bottom",
      spotlightClicks: true,
      // showSkipButton:false,
      styles: {
        // tooltipFooter: {
        //   opacity: 0
        // },
        buttonNext: {
          display: "none"
        }
      },
    // title: "Our Mission",
    //     content: (
    //       <div>
    //         You can interact with your own components through the spotlight.
    //         <br />
    //         Click in the Advance button above.
    //       </div>
    //     ),
    },
    {
      target:`.acts-tour-step2`,
      content:'Add a level to place your timeline top row cards in their own defined sections. You can have up to three (3) levels for optimal visual arrangement, and can even make cards for entire sections. Think of the second level as a way to organize your top row into chapters and the third level to organize your chapters into acts, adding layers of specificity and structure to your Plottr project.',
      placement:'bottom',
      event:'hover',
      spotlightClicks: true,
      // disableBeacon:true,
      styles: {
        // tooltipFooter: {
        //   opacity: 0
        // },
        buttonBack: {
          display: "none"
        },
        buttonNext: {
          display: "visible"
        }
      }
    },
    {
      target:`.acts-tour-step3`,
      content:'You can remove levels of hierarchy, but BE CAREFUL as the cards within that chapter or act may be deleted. Once you decide to go with multiple levels of hierarchy, we recommend sticking with at least as many as you choose to add.',
      event:'hover',
      spotlightClicks: true,
      disableBeacon:true,
    },
    {
      target:`.acts-tour-step4`,
      content:'You can manage the settings of each level, including the name of the level that appears on the cards (e.g. "Act"), the color and outline of the level, and whether new cards are autonumbered.',
      event:'hover',
      spotlightClicks: true,
      // disableBeacon:true,
    },
    {
      target:`.acts-tour-step5`,
      content:'Click here to take you Plottr project to the next level!',
      event:'hover',
      spotlightClicks: true,
      placement:'right',
      styles: {
        // tooltipFooter: {
        //   opacity: 0
        // },
        buttonNext: {
          display: "none"
        }
      },
      // disableBeacon:true,
    },
    {
      target:`.acts-tour-step6`,
      content:'Click to the right of higher level cards to add another of that card (e.g. another act). If you just now implemented acts for this project there is only one act (level 3) and/or one chapter (level 2) containing all of your cards. Added cards show up at the end of the timeline.',
      event:'hover',
      spotlightClicks: true,
      placement:'right',
      styles: {
        // tooltipFooter: {
        //   opacity: 0
        // },
        buttonBack: {
          display: "none"
        },
        buttonNext: {
          display: "none"
        }
      }
    },
    {
      target:`.acts-tour-step7`,
      content:'Click here to add lower-level cards within their parent section. Lower level cards from other sections can be dragged into this section once there are lower-level cards here (e.g. if this act has chapters then other chapter can be dragged into this act).',
      event:'hover',
      spotlightClicks: true,
      // disableBeacon:true,
    },
    {
      target:`.acts-tour-step8`,
      content:'This is step 8',
      event:'hover',
      spotlightClicks: true,
      // disableBeacon:true,
    }
  ]