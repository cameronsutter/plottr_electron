var Rollbar = require('rollbar')
var storage = require('electron-json-storage')
var log = require('electron-log')
var TRIALMODE = process.env.TRIALMODE === 'true'

var recentFiles = null

const recentKey = process.env.NODE_ENV === 'dev' ? 'recentFilesDev' : 'recentFiles'

module.exports = class RecentFilesManager {

  constructor() {
  }
  
  // returns the recents list. Note we never want to error out from here -- if there's a problem with the recents list, 
  // just return an empty array
  get recents() {
    if (recentFiles === null) {
      log.info("Retrieving recents list from file " + recentKey)
      let self = this
      return new Promise(function(resolve, reject) {
        storage.has(recentKey, function(err, hasKey) {
           if (err) { 
             log.warn(err)
             self.rollbar.warn(err)
             resolve([])
             return
            }
            if (hasKey) {
            storage.get(recentKey, function (err, contents) {
              if (err) { 
                log.warn(err)
                self.rollbar.warn(err)
                resolve([])
                return
              }
              let result = contents instanceof Array ? contents : [contents]
              recentFiles = result;
              log.info("Finished retrieving recents list")
              resolve(result);
           });
         } else {
           resolve([])
         }
        })
      });
    } else {
      log.info("Recents list cached, returning...")
      return new Promise(function(resolve, reject) { resolve(recentFiles) })
    }
  }

  async getMostRecentFile() {
    let recentsList = await this.recents
    if (recentsList.length > 0) { 
      return recentsList[0]
    }
    throw 'Recents list file is invalid'
  }
  
 addFileToRecentsList(fileName) {
   log.info("Adding " + fileName + " to the recent files list")
   let self = this;
    return new Promise( function (resolve, reject) {
      self.recents.then(async function (result) {
        let elementIndex = result.indexOf(fileName);
        let newResult = result;
        if (elementIndex != 0) {
          if (elementIndex > 0) {
            newResult.splice(elementIndex, 1);
          }
          newResult.unshift(fileName);
          await self.saveRecentsList(newResult);
        }
        log.info("Finished adding " + fileName + " to the recent files list")
        resolve();
      },
      async function (rejectReason) {
        log.warn(rejectReason);
        self.rollbar.warn(rejectReason);
  
        let result = [fileName];
        await self.saveRecentsList(result);
      })
    });
  }
  
async removeRecentFile (fileNameToRemove) {
  log.info("Removing " + fileNameToRemove + " from recent files list")
  let recentsList = await this.recents
  
  let indexToBeRemoved = recentsList.indexOf(fileNameToRemove)
  
  if (indexToBeRemoved >= 0) {
    recentsList.splice(indexToBeRemoved, 1)
  }
  
  await this.saveRecentsList(recentsList)
  log.info("Finished removing " + fileNameToRemove + " from recent files list")
}

 saveRecentsList(recentsArray) {
   log.info("Saving recent files list to " + recentKey + " : " + recentsArray);
   let self = this;
   return new Promise(function (resolve, reject) {
    recentFiles = recentsArray;
    if (!Array.isArray(recentsArray)) {
      recentsArray = [recentsArray];
    }
    storage.set(recentKey, recentsArray, function(err) {
      if (err !== null) {
        log.warn(err);
        self.rollbar.warn(err);
      } else {
        log.info("Finished saving recent files list to " + recentKey + " : " + recentsArray)
        resolve();
      }
    })
   })
   
  }
}