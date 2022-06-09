const ProcessSwitches = (yargv) => {
  const switches = {
    testUtilitiesEnabled: () => {
      return !!yargv.enableTestUtilities
    },
    importFromScrivener: () => {
      if (yargv.importFromScrivener) {
        return {
          sourceFile: yargv.importFromScrivener,
          destinationFile: yargv.outputFile,
        }
      }
      return false
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
