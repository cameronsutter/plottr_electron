import { readdirSync, readFileSync } from 'fs'
import { readdir, readFile, stat } from 'fs.promises'
import path from 'path'
import log from 'electron-log'
import { rtfToHTML } from 'pltr/v2/slate_serializers/to_html'
import { HTMLToPlotlineParagraph } from 'pltr/v2/slate_serializers/from_html'
import { convertTxtString } from 'pltr/v2/slate_serializers/from_plain_text'
import { isPlainObject } from 'lodash'
import { xml2json } from 'xml-js'

const UUIDFolderRegEx = /[A-Z0-9]{8}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{12}/
// Object -> { manuscript: [Object], Sections: [Object] }
const parseScrivxData = (data) => {
  const parser = new DOMParser()
  const htmlData = parser.parseFromString(data, 'text/html')
  const rootChild = htmlData.querySelectorAll('ScrivenerProject Binder > BinderItem')

  const scrivxData = Array.from(rootChild).map((i, key) => {
    const uuid = i.getAttribute('uuid') || i.getAttribute('id')
    const title = i.querySelector('Title')?.textContent || ''
    const child = i.querySelector('children')
    const isDraftFolder = i.getAttribute('type') == 'DraftFolder'
    // scrivener v3
    const hasMetaData = i.querySelector('metadata')

    if (child && child.children && child.children.length) {
      if (isDraftFolder) {
        return {
          draft: getBinderContents(child.children, isDraftFolder),
        }
      } else if (!isDraftFolder && hasMetaData) {
        return {
          uuid,
          title,
          children: getBinderContents(child.children),
        }
      } else {
        return getBinderContents(child.children)
      }
    }
  })

  const manuscript = scrivxData.filter((i) => i).find((i) => i.draft)
  const filteredSections = scrivxData.filter((item, index) => index !== 0 && item)
  const isSectionflatten = filteredSections.some((p) => isPlainObject(p))

  return {
    manuscript: manuscript?.draft || [],
    sections: isSectionflatten ? filteredSections : filteredSections.flat(),
  }
}

// Node, Number -> [{ uuid: String, title: string, children: [any] }]
const getBinderContents = (root, isDraftFolder) => {
  return Array.from(root).map((bindersItem, key) => {
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
    } else if (isDraftFolder && !binderChildren) {
      return {
        uuid,
        title,
        children: [
          {
            uuid,
            title: `Chapter ${key + 1}`,
          },
        ],
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
  // const scrivxContent = readFileSync(absolute)
  // const scrivData = parseScrivxData(scrivxContent, filesInScriv)

  const scrivxContent = readFileSync(absolute, 'utf-8')
  const json = JSON.parse(xml2json(scrivxContent, { compact: true, spaces: 2 }))

  console.log('xml to json', json)
  // if (scrivData) {
  //   return scrivData
  // }
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
// String, Object -> Bool
const getVer_2_7_match = (file, child) => {
  const fileName = file.split('/').pop()
  if (file.endsWith('_synopsis.txt') || file.endsWith('_notes.rtf')) {
    return fileName.split('_')[0] == child.uuid
  } else {
    const uuid = fileName.replace('.rtf', '')
    return uuid == child.uuid
  }
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
      const autoPlotline = { rtf: [{ plotline: `Main Plot` }] }
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

// right now, the attributes from the Notes tab are not exported
// not handling them now
const generateNotes = (items) => {
  return items.children.flatMap((note, parentKey) => {
    const noteContent = note.content.flatMap((c) => {
      return c.rtf?.filter((i) => i)
    })

    return {
      id: parentKey + 1,
      title: note.title,
      places: [],
      characters: [],
      templates: [],
      content: noteContent,
    }
  })
}

const generateCharsOrPlaces = (items) => {
  return items.children.flatMap((child, parentKey) => {
    const itemAttrib = child.content.flatMap((c) => {
      const attribKeys = c.rtf?.flatMap((i) => {
        return i.children
          .map((child, childKey) => {
            const textVal = child?.find((i) => i.text)
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
          .map((child, childKey) => {
            const textVal = child?.find((i) => i.text)
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

    const itemIdentity = {
      id: parentKey + 1,
      name: child.title,
    }

    const itemObj = Object.assign({}, itemIdentity, ...itemAttrib)

    // remove empty key
    return JSON.parse(JSON.stringify(itemObj))
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
  const chapterNames = []
  const beatsChapter = items
    .flatMap((item) => {
      if (item.title && !chapterNames.includes(item.title)) {
        chapterNames.push(item.title)
        return item.title
      }
    })
    .filter((line) => line)

  return {
    beatsChapter: beatsChapter.map((chapter, key) => {
      return {
        [key + 1]: {
          id: key + 1,
          bookId: 1,
          position: key,
          title: chapter,
          time: 0,
          autoOutlineSort: true,
          templates: [],
        },
      }
    }),

    // used for lookups
    chapterList: beatsChapter.map((chapter, key) => {
      return {
        id: key + 1,
        bookId: 1,
        position: key,
        title: chapter,
        time: 0,
        autoOutlineSort: true,
        templates: [],
      }
    }),
  }
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

const generateBeats = (chapters) => {
  return {
    1: {
      children: chapters.map((i) => {
        return {
          [Object.keys(i)[0]]: [],
        }
      }),
      heaps: chapters.map((i) => {
        return {
          [Object.keys(i)[0]]: null,
        }
      }),
      index: chapters,
    },
  }
}

const getContentsData = (section, relevantFiles) => {
  const scrivenerDataFiles = relevantFiles
  return Promise.all(
    section.children.map((child, key) => {
      const contentFiles = scrivenerDataFiles.filter((file) => {
        const isVer_3_UUID = UUIDFolderRegEx.test(child.uuid)
        if (isVer_3_UUID) {
          return file.includes(child.uuid)
        } else {
          return getVer_2_7_match(file, child)
        }
      })
      return parseRelevantFiles(contentFiles).then((parsed) => {
        if (child.children?.length) {
          return {
            id: key + 1,
            title: child.title,
            content: parsed,
            children: getContentsData(child, scrivenerDataFiles),
          }
        }
        return {
          id: key + 1,
          title: child.title,
          content: parsed,
        }
      })
    })
  )

  // .then((childrenData) => {
  // returns the content/children of the Beat
  // title represents the chapter/beat
  // if they are siblings meaning they should render on the same chapter
  // TODO: if they are siblings and same `plotline` they should stack
  // })
  // return {
  //   uuid: section.uuid,
  //   title: section.title,
  //   children: childrenData,
  // }
}

// Array, Object, -> Promise<{ key: [Any] }>
export const generateState = (relevantFiles, scrivx) => {
  const draftFolder = Object.values(scrivx)[0]
  const restOfFolders = Object.values(scrivx).filter((item, index) => index !== 0)

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
                return getVer_2_7_match(file, child)
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
    const chapters = generateChapters(draftFolderData) || { beatsChapter: [], chapterList: [] }
    const beats = chapters.beatsChapter?.length ? generateBeats(chapters.beatsChapter) : []
    const cards = generateCards(draftFolderData, lines, chapters.chapterList)
    return {
      beats,
      cards,
      draft: draftFolderData,
      lines,
    }
  })

  const sections = Promise.all(
    restOfFolders.flatMap((item) => {
      return Promise.all(
        item.map((section) => {
          if (section.children && section.children.length) {
            return getContentsData(section, relevantFiles).then((childrenData) => {
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
      const flattenSectionsData = sectionsFolderData.some((p) => isPlainObject(p))
        ? sectionsFolderData
        : sectionsFolderData.flat()
      const charactersObject =
        flattenSectionsData.find((c) => c && c.title && c.title == 'Characters') || {}
      const characters = Object.entries(charactersObject)?.length
        ? generateCharsOrPlaces(charactersObject)
        : []
      const placesObj = flattenSectionsData.find((c) => c && c.title && c.title == 'Places') || {}
      const places = Object.entries(placesObj).length ? generateCharsOrPlaces(placesObj) : []
      const notesObj = flattenSectionsData.find((c) => c && c.title && c.title == 'Notes') || {}
      const notes = Object.entries(notesObj).length ? generateNotes(notesObj) : []
      return {
        sections: flattenSectionsData,
        characters,
        notes,
        places,
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
