import { readdirSync, readFileSync, statSync } from 'fs'
import { readdir, readFile, stat } from 'fs.promises'
import path from 'path'
import log from 'electron-log'
import { rtfToHTML } from 'pltr/v2/slate_serializers/to_html'

const UUIDFolderRegEx = /[A-Z0-9]{8}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{12}/
// Object -> { Draft: [Object], Content: [Object] }
const parseScrivxData = (data) => {
  let sectionsArr = []
  let draftArr = []
  const parser = new DOMParser()
  const htmlData = parser.parseFromString(data, 'text/html')
  const children = htmlData.querySelectorAll('ScrivenerProject Binder > BinderItem')

  Array.from(children).map((i, key) => {
    const isDraftFolder = i.closest('BinderItem').getAttribute('type') === 'DraftFolder'
    const isNew = i.querySelectorAll('MetaData')
    if (isDraftFolder) {
      const draft = getBinderContents(i, key)
      if (draft.length) {
        draftArr = draft
      }
    } else if (!isDraftFolder && !isNew.length) {
      const sec = getBinderContents(i, key)
      if (sec.length) {
        sectionsArr = sec
      }
    } else if (isNew.length) {
      const children = i.querySelector('children')

      sectionsArr.push({
        uuid: i.getAttribute('uuid') || i.getAttribute('id'),
        title: i.querySelector('title').textContent,
        children: children
          ? [
              {
                uuid: children?.querySelector('binderitem')?.getAttribute('uuid'),
                title: children?.querySelector('title')?.textContent,
              },
            ]
          : [],
      })
    }
  })

  return {
    draft: draftArr,
    sections: sectionsArr,
  }
}

// [{ filePath: String, isSectionRTF: Bool }] -> [String]
const keepNonSectionRTFFiles = (results) => {
  return results.filter(({ isSectionRTF }) => !isSectionRTF).map(({ filePath }) => filePath)
}

// [{ filePath: String, isSectionRTF: Bool }] -> [String]
const keepSectionRTFFiles = (results) => {
  return results.filter(({ isSectionRTF }) => isSectionRTF).map(({ filePath }) => filePath)
}

// Step 1: find all the RTF files recursively.
// String -> Promise<[String]>
export const findRelevantFiles = (directory) => {
  const filesInDirectory = readdir(directory)
  const checkedEntries = filesInDirectory.then((files) => {
    return Promise.all(files.map((file) => isSectionRTF(directory, file)))
  })
  const folders = checkedEntries.then(keepNonSectionRTFFiles).then(keepOnlyFolders)
  const sectionRTFFiles = checkedEntries.then(keepSectionRTFFiles)
  const filesForSubFolders = folders
    .then((dirs) => {
      return Promise.all(dirs.map(findRelevantFiles))
    })
    .catch((err) => {
      log.error(err)
      return Promise.all([])
    })

  return sectionRTFFiles
    .then((filesForCurrentFolder) => {
      return filesForSubFolders.then((subFolderResults) =>
        filesForCurrentFolder.concat(...subFolderResults)
      )
    })
    .catch((err) => {
      log.error(err)
      return Promise.all([])
    })
}

// String -> Promise<Bool>
const isFolder = (filePath) => {
  return stat(filePath).then((result) => result.isDirectory())
}

// [String] -> Promise<[String]>
const keepOnlyFolders = (paths) => {
  const testedPaths = Promise.all(
    paths.map((path) => {
      return isFolder(path).then((isAFolder) => {
        return {
          isAFolder,
          path,
        }
      })
    })
  )
  return testedPaths.then((pathResults) => {
    return pathResults.filter(({ isAFolder }) => isAFolder).map(({ path }) => path)
  })
}

export const getScrivxData = (scriv) => {
  const filesInScriv = readdirSync(scriv)
  const scrivFile = filesInScriv.find((file) => path.extname(file) === '.scrivx')
  const absolute = path.join(scriv, scrivFile)
  const scrivxContent = readFileSync(absolute)
  const scrivData = parseScrivxData(scrivxContent, filesInScriv)
  if (scrivData) {
    return scrivData
  }
}

// String, String -> String
const toFullPath = (directory, filePath) => {
  return path.join(directory, filePath)
}

// String, String -> Promise<{filePath: String, isSectionRTF: Bool}>
const isSectionRTF = (directory, fileName) => {
  const filePath = toFullPath(directory, fileName)
  const isRTF = path.extname(fileName) === '.rtf' || path.extname(fileName) === '.txt'
  const isVer_2_7 =
    filePath.endsWith('_synopsis.txt') ||
    filePath.endsWith('_notes.rtf') ||
    (Number(filePath.replace('.rtf', '')) ? true : false)

  return readFile(filePath)
    .then((fileContents) => {
      return {
        filePath,
        isSectionRTF: isRTF ? true : false,
      }
    })
    .catch((error) =>
      isFolder(filePath)
        .then((isAFolder) => {
          return {
            filePath,
            isSectionRTF: false,
          }
        })
        .catch((error) => {
          log.error(error)
          return false
        })
    )
}

const parseToHTML = (noteRtf, title) => {
  const content = noteRtf.content.replace(`{${title}}`, '')
  return rtfToHTML(content)
}

// Array, Object, -> Promise<{ draft: [Any], sections: [Any] }>
export const generateState = (contentRtf, scrivx) => {
  const data = Object.values(scrivx).map((item, key) => {
    return item.map((data) => {
      if (data.children && data.children.length) {
        const children = data.children.map((child, key) => {
          const noteRtf = contentRtf.filter((rtf) => rtf.includes(child.uuid))
          return {
            id: key + 1,
            title: child.title,
            contentPath: noteRtf,
          }
        })

        return {
          uuid: data.uuid,
          title: data.title,
          children,
        }
      } else {
        return {
          uuid: data.uuid,
          title: data.title,
        }
      }
    })
  })

  return {
    draft: data[0],
    sections: data[1],
  }
}

const generateChildrenBinderItems = (uuid, title, childTag) => {
  let noteObj = { uuid, title: title.textContent || null, children: [] }

  if (childTag) {
    const childBinderItem = childTag.querySelectorAll('BinderItem')
    Array.from(childBinderItem).map((c) => {
      const childUUID = c.getAttribute('uuid') || c.getAttribute('id')
      const childTitle = c.querySelector('Title')
      const childChildren = c.querySelector('Children')

      if (childChildren) {
        return generateChildrenBinderItems(childUUID, childTitle, childChildren)
      }

      noteObj.children.push({
        uuid: childUUID,
        title: childTitle.textContent,
      })
    })
    return noteObj
  }
}

const getBinderContents = (item, key) => {
  if (item) {
    const binderItem = item.querySelectorAll('BinderItem')
    return Array.from(binderItem)
      .map((i) => {
        let generateContent
        const uuid = i.getAttribute('uuid') || i.getAttribute('id')
        const title = i.querySelector('Title')
        const children = i.querySelector('Children')
        const metadata = i.querySelector('MetaData')

        if (children) {
          generateContent = generateChildrenBinderItems(uuid, title, children)
        } else if (metadata) {
          generateContent = []
          generateContent = {
            uuid,
            title: title.textContent,
          }
        }
        return generateContent
      })
      .filter((i) => !!i)
  }
}
