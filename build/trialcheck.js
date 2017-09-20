if (process.env.BUILD_TYPE === 'trial') {
  console.log('TRIAL MODE detected. Writing trialmode.json')
  var json = {trialmode: true}
  fs.writeFileSync('trialmode.json', JSON.stringify(json))
}
