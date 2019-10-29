// if it's a trial build
// change the names of latest.yml and latest-mac.yml
//
// buildResult:
// interface BuildResult {
//   outDir: string
//   artifactPaths: Array<string>
//   platformToTargets: Map<Platform, Map<string, Target>>
//   configuration: Configuration
// }
const fs = require('fs')

exports.default = function (buildResult) {
  console.log("CUSTOM FUNCTION afterAllArtifactBuild")
  console.log("BUILD TYPE", process.env.BUILD_TYPE)
  console.log("outDir", buildResult.outDir)
  console.log("artifactPaths", buildResult.artifactPaths)
  console.log("platformToTargets", buildResult.platformToTargets)
  if (process.env.BUILD_TYPE === 'trial') {
    if(process.env.BUILD_PLATFORM === 'win32') {
      fs.renameSync('latest.yml', 'latest-trial.yml')
    } else {
      fs.renameSync('latest-mac.yml', 'latest-mac-trial.yml')
    }
  }
}