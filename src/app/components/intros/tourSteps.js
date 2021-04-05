export const ACTS_TOUR_STEPS = [
    {
      // target:`[step='step1']`,
      target:'.acts-tour-step1',
      content:'Click here to manage your act structures.',
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
      content:'You can add levels of hierarchy to your timeline here, for a total of up to three (3). Think of the second level as a way to organize your scenes into chapters and the third level to organize your chapters into acts.',
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
      content:'You can remove levels of hierarchy, but BE CAREFUL as the cards within that chapter or act may be deleted.',
      event:'hover',
      spotlightClicks: true,
      disableBeacon:true,
    },
    {
      target:`.acts-tour-step4`,
      content:'This is step 4',
      event:'hover',
      spotlightClicks: true,
      // disableBeacon:true,
    },
    {
      target:`.acts-tour-step5`,
      content:'This is step 5',
      event:'hover',
      spotlightClicks: true,
      placement:'right'
      // disableBeacon:true,
    }
  ]