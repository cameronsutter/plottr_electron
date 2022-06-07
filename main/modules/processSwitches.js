const ProcessSwitches = (yargv) => {
  const switches = {
    testUtilitiesEnabled: () => {
      return !!yargv.enableTestUtilities
    },
  }

  return {
    ...switches,
    serialise: () => {
      return {
        testUtilitiesEnabled: switches.testUtilitiesEnabled(),
      }
    },
  }
}

export default ProcessSwitches
