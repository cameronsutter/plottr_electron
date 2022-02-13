import { readdirSync, readFileSync } from 'fs'
import { readdir, readFile, stat } from 'fs.promises'
import path from 'path'
import log from 'electron-log'
import { rtfToHTML } from 'pltr/v2/slate_serializers/to_html'
import { HTMLToPlotlineParagraph } from 'pltr/v2/slate_serializers/from_html'
import { convertTxtString } from 'pltr/v2/slate_serializers/from_plain_text'

const UUIDFolderRegEx = /[A-Z0-9]{8}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{12}/
// Object -> { Draft: [Object], Content: [Object] }
const parseScrivxData = (data) => {
  const parser = new DOMParser()
  const htmlData = parser.parseFromString(data, 'text/html')
  const rootChild = htmlData.querySelectorAll('ScrivenerProject Binder > BinderItem')

  const scrivxData = Array.from(rootChild).map((i, key) => {
    const child = i.querySelector('children')
    const isDraftFolder = i.getAttribute('type') == 'DraftFolder'

    if (child && child.children && child.children.length) {
      if (isDraftFolder) {
        return {
          draft: getBinderContents(child.children, key),
        }
      } else {
        return getBinderContents(child.children, key)
      }
    }
  })

  const manuscript = scrivxData.find((i) => i.draft)

  return {
    manuscript: manuscript?.draft || [],
    sections: scrivxData.filter((item, index) => index !== 0 && item),
  }
}

const getBinderContents = (root, rootKey) => {
  return Array.from(root).map((bindersItem) => {
    const uuid = bindersItem.getAttribute('uuid') || bindersItem.getAttribute('id')
    const title = bindersItem.querySelector('Title')?.textContent || ''
    const binderChildren = bindersItem.querySelector('Children')

    if (binderChildren && binderChildren.children && binderChildren.children.length) {
      const contentChildren = getBinderContents(binderChildren.children)
      return {
        uuid,
        title,
        children: contentChildren,
      }
    } else {
      return {
        uuid,
        title,
      }
    }
  })
}

// [{ filePath: String, isRelevant: Bool }] -> [String]
const keepNonSectionRTFFiles = (results) => {
  return results.filter(({ isRelevant }) => !isRelevant).map(({ filePath }) => filePath)
}

// [{ filePath: String, isRelevant: Bool }] -> [String]
const keepSectionRTFFiles = (results) => {
  return results.filter(({ isRelevant }) => isRelevant).map(({ filePath }) => filePath)
}

// String -> Promise<[String]>
export const findRelevantFiles = (directory) => {
  const filesInDirectory = readdir(directory)
  const checkedEntries = filesInDirectory.then((files) => {
    return Promise.all(files.map((file) => isRelevantFile(directory, file)))
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

// String, String -> Promise<{filePath: String, isRelevant: Bool}>
const isRelevantFile = (directory, fileName) => {
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
        isRelevant: isRTF ? true : false,
      }
    })
    .catch((error) =>
      isFolder(filePath)
        .then((isAFolder) => {
          return {
            filePath,
            isRelevant: false,
          }
        })
        .catch((error) => {
          log.error(error)
          return false
        })
    )
}

// String -> Object
const readRTF = (filePath) => {
  return readFile(filePath).then((rtfData) => {
    const stringRTF = rtfData.toString()
    return rtfToHTML(stringRTF).then((res) => {
      return Promise.all(HTMLToPlotlineParagraph(res))
    })
  })
}

// String -> String
const getTxtContent = (path) => {
  const txtContent = readFileSync(path)
  const content = txtContent.toString()

  // remove `Click to edit`
  const txtString = content.split('Click to edit').pop()
  return convertTxtString(txtString)
}

// String -> Promise<[{ synopsis: <Object>, rtf: [Object] }]>
const parseRelevantFiles = (paths) => {
  const promise = Promise.all(
    paths.map((filePath) => {
      const fileType = path.extname(filePath)

      if (fileType === '.txt') {
        return Promise.resolve({ synopsis: getTxtContent(filePath) })
      } else {
        return readRTF(filePath).then((data) => {
          return { rtf: data }
        })
      }
    })
  )

  return promise.then((parsedFiles) => {
    const rtf = parsedFiles.filter((file) => file.rtf)
    const synopsis = parsedFiles.filter((file) => file.synopsis)

    // if draft folder has no rtf files
    // possibly from original scrivener file
    if (synopsis.length && !rtf.length) {
      const autoPlotline = { rtf: [{ plotline: `Plotline` }] }
      const withPlotline = [...parsedFiles, autoPlotline]
      return withPlotline
      // } else if (synopsis.length && rtf.length && parentKey === 0) {
      // const autoPlotline = { plotline: `Plot ${parentKey + 1}` }
      // return parsedFiles.map((item) => {
      //   return [...item, { rtf: { ...item.rtf, ...autoPlotline } }]
      // })
    }

    // possibly from plottr exported to scrivener
    return parsedFiles
  })
}

const generateCharacters = (items) => {
  return items.children.flatMap((child, parentKey) => {
    const charAttrib = child.content.flatMap((c) => {
      const attribKeys = c.rtf?.flatMap((i) => {
        return i.children
          .map((char, childKey) => {
            const textVal = char?.find((i) => i.text)
            if (childKey % 2 === 0) {
              return textVal?.text || ''
            } else {
              return 'false'
            }
          })
          .filter((i) => i !== 'false')
      })

      const attribVals = c.rtf?.flatMap((i) => {
        return i.children
          .map((char, childKey) => {
            const textVal = char?.find((i) => i.text)
            if (childKey % 2 !== 0) {
              return textVal?.text || ''
            } else {
              return 'false'
            }
          })
          .filter((i) => i !== 'false')
      })

      return Object.assign(...attribKeys.map((k, i) => ({ [k]: attribVals[i] })))
    })

    const characterIdentity = {
      id: parentKey + 1,
      name: child.title,
    }

    const characterObj = Object.assign({}, characterIdentity, ...charAttrib)

    // remove empty key
    return JSON.parse(JSON.stringify(characterObj))
  })
}

const generateLines = (items) => {
  const lineArr = []
  return items
    .flatMap((item) => {
      return item.children.flatMap((child) => {
        const rtf = child.content.filter((content) => {
          return content.rtf
        })
        return rtf.flatMap((item) =>
          item.rtf.flatMap((i) => {
            if (i.plotline.length && !lineArr.includes(i.plotline)) {
              lineArr.push(i.plotline)
              return i.plotline
            }
          })
        )
      })
    })
    .filter((line) => line)
    .map((line, key) => {
      return {
        id: key + 1,
        bookId: 1,
        title: line,
        color: '#000',
        position: 0,
        expanded: null,
        fromTemplateId: null,
      }
    })
}

const generateChapters = (items) => {
  const chapterList = []
  return items
    .flatMap((item) => {
      if (item.title && !chapterList.includes(item.title)) {
        chapterList.push(item.title)
        return item.title
      }
    })
    .filter((line) => line)
    .map((chapter, key) => {
      return {
        id: key + 1,
        bookId: 1,
        position: 0,
        title: chapter,
        time: 0,
        autoOutlineSort: true,
      }
    })
}

const generateCards = (items, lines, chapters) => {
  return items
    .flatMap((item, parentKey) => {
      const chapter = chapters.find((chapter) => chapter.title === item.title)
      return item.children.flatMap((child) => {
        const synopsis = child.content
          .filter((content) => content.synopsis)
          .flatMap((item) => item.synopsis)
        const plotline = child.content
          .filter((content) => content.rtf)
          .flatMap((item) => {
            const plot = item.rtf.find((i) => i.plotline)
            const line = lines.find((l) => l.title === plot.plotline)
            return {
              lineId: line.id,
            }
          })
        const line = plotline.find((c) => c.lineId)
        return {
          characters: [],
          description: synopsis || [],
          id: parentKey + 1,
          lineId: line.lineId || 0,
          chapterId: chapter.id,
          places: [],
          tags: [],
          templates: [],
          title: child.title,
          position: 0,
          positionWithinLine: 0,
          positionInChapter: null,
          fromTemplateId: null,
        }
      })
    })
    .filter((item) => item)
}

// Array, Object, -> Promise<{ key: [Any] }>
export const generateState = (relevantFiles, scrivx) => {
  const draftFolder = Object.values(scrivx)[0]
  const sectionFolders = Object.values(scrivx).filter((item, index) => index !== 0)
  const flatSectionsFolder = sectionFolders.flat()

  const manuscript = Promise.all(
    draftFolder.map((beats, parentKey) => {
      if (beats.children && beats.children.length) {
        return Promise.all(
          beats.children.map((child, key) => {
            const contentFiles = relevantFiles.filter((file) => {
              const isVer_3_UUID = UUIDFolderRegEx.test(child.uuid)
              if (isVer_3_UUID) {
                return file.includes(child.uuid)
              } else {
                const fileName = file.split('/').pop()
                if (file.endsWith('_synopsis.txt') || file.endsWith('_notes.rtf')) {
                  return fileName.split('_')[0] == child.uuid
                } else {
                  const uuid = fileName.replace('.rtf', '')
                  return uuid == child.uuid
                }
              }
            })
            return parseRelevantFiles(contentFiles).then((parsed) => {
              return {
                id: key + 1,
                title: child.title,
                content: parsed,
              }
            })
          })
        ).then((childrenData) => {
          // returns the content/children of the Beat
          // title represents the chapter/beat
          // if they are siblings meaning they should render on the same chapter
          // TODO: if they are siblings and same `plotline` they should stack

          return {
            uuid: beats.uuid,
            title: beats.title,
            children: childrenData,
          }
        })
      } else {
        // if binder has no children but has rtf/txt files
        // creates a folder/beat for the content
        // if has more than 1 child,
        // `(beats.children && beats.children.length)` should be true
        // const noteRtf = relevantFiles.filter((rtf) => rtf.includes(beats.uuid))
        // if (noteRtf.length) {
        //   return parseRelevantFiles(noteRtf).then((parsed) => {
        //     return {
        //       uuid: beats.uuid,
        //       title: `Beat ${parentKey + 1}`,
        //       children: [
        //         {
        //           id: parentKey + 1,
        //           title: beats.title,
        //           content: parsed,
        //         },
        //       ],
        //     }
        //   })
        // } else {
        //   // if no child and no relevant files
        //   // only renders the beat title
        //   return {
        //     uuid: beats.uuid,
        //     title: beats.title,
        //   }
        // }
      }
    })
  ).then((draftFolderData) => {
    const lines = generateLines(draftFolderData)
    const chapters = generateChapters(draftFolderData)
    const cards = generateCards(draftFolderData, lines, chapters)
    return {
      draft: draftFolderData,
      lines,
      cards,
    }
  })

  const sections = Promise.all(
    flatSectionsFolder.flatMap((item) => {
      return Promise.all(
        item.map((section) => {
          if (section.children && section.children.length) {
            return Promise.all(
              section.children.map((child, key) => {
                const contentFiles = relevantFiles.filter((file) => {
                  const isVer_3_UUID = UUIDFolderRegEx.test(child.uuid)
                  if (isVer_3_UUID) {
                    return file.includes(child.uuid)
                  } else {
                    const fileName = file.split('/').pop()
                    if (file.endsWith('_synopsis.txt') || file.endsWith('_notes.rtf')) {
                      return fileName.split('_')[0] == child.uuid
                    } else {
                      const uuid = fileName.replace('.rtf', '')
                      return uuid == child.uuid
                    }
                  }
                })
                return parseRelevantFiles(contentFiles).then((parsed) => {
                  return {
                    id: key + 1,
                    title: child.title,
                    content: parsed,
                  }
                })
              })
            ).then((childrenData) => {
              // returns the content/children of the Beat
              // title represents the chapter/beat
              // if they are siblings meaning they should render on the same chapter
              // TODO: if they are siblings and same `plotline` they should stack
              return {
                uuid: section.uuid,
                title: section.title,
                children: childrenData,
              }
            })
          }
        })
      )
    })
  )
    .then((sectionsFolderData) => {
      const flatSections = sectionsFolderData.flat()
      const charactersObject = flatSections.find((c) => c.title === 'Characters')
      const characters = Object.entries(charactersObject).length
        ? generateCharacters(charactersObject)
        : []
      return {
        sections: flatSections,
        characters,
      }
    })
    .catch((error) => {
      console.log('sections error', error)
    })

  return Promise.all([manuscript, sections]).then((data) => {
    const flattenData = data.flat()
    return Object.assign({}, ...flattenData)
  })
}
