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
const path = require('path')

exports.default = function (buildResult) {
  console.log("CUSTOM FUNCTION afterAllArtifactBuild")
  console.log("BUILD TYPE", process.env.BUILD_TYPE)
  console.log("outDir", buildResult.outDir)
  console.log("artifactPaths", buildResult.artifactPaths)
  if (process.env.BUILD_TYPE === 'trial') {
    let files = fs.readdirSync(buildResult.outDir)
    console.log(files)
    // throw new Error("I pitty the fool!");
    if(process.env.BUILD_PLATFORM === 'win32') {
      fs.renameSync(path.join(buildResult.outDir, 'latest.yml'), path.join(buildResult.outDir, 'latest-trial.yml'))
    } else {
      fs.renameSync(path.join(buildResult.outDir, 'latest-mac.yml'), path.join(buildResult.outDir, 'latest-mac-trial.yml'))
    }
  }
}