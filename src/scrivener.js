import { readdirSync, readFileSync, statSync } from 'fs'
import path from 'path'
import { convertHTMLString } from 'pltr/v2/slate_serializers/from_html'
import { EMFJS, RTFJS, WMFJS } from 'rtf.js'

const UUIDFolderRegEx = /[A-Z0-9]{8}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{12}/

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

const stringToArrayBuffer = (string) => {
  const buffer = new ArrayBuffer(string.length)
  const bufferView = new Uint8Array(buffer)
  for (let i = 0; i < string.length; i++) {
    bufferView[i] = string.charCodeAt(i)
  }
  return buffer
}

RTFJS.loggingEnabled(false)
WMFJS.loggingEnabled(false)
EMFJS.loggingEnabled(false)

export const readScrivContents = (scriv, rtf) => {
  let contentRtf = rtf || []
  let scrivx = []

  const noteFileContent = ['content.rtf', 'synopsis.txt', 'content.pdf']
  const filesInScriv = readdirSync(scriv)
  filesInScriv.map((file) => {
    const isVer_2_7 =
      file.includes('_synopsis.txt') ||
      file.includes('_notes.rtf') ||
      Number(file.replace('.rtf', ''))
    const absolute = path.join(scriv, file)
    const fileExt = path.extname(file)
    const isSectionRTF =
      (UUIDFolderRegEx.test(absolute) && noteFileContent.includes(file)) || isVer_2_7

    if (statSync(absolute).isDirectory()) {
      return readScrivContents(absolute, contentRtf)
    } else if (isSectionRTF) {
      const uuid = UUIDFolderRegEx.test(absolute)
        ? absolute.match(UUIDFolderRegEx)[0]
        : isVer_2_7
        ? file.match(/\d+/)[0]
        : null
      const notesRTF = readFileSync(absolute)
      if (notesRTF.length) {
        return contentRtf.push({ uuid, content: String(notesRTF) })
      }
    } else {
      const scrivxContent = readFileSync(absolute)
      if (fileExt === '.scrivx') {
        const scrivData = parseScrivxData(scrivxContent, filesInScriv)
        if (scrivData) {
          return scrivx.push(scrivData)
        }
      }
    }
  })

  return {
    contentRtf,
    scrivx,
  }
}

const parseToHTML = async (noteRtf, title) => {
  const content = noteRtf.content.replace(`{${title}}`, '')
  const doc = new RTFJS.Document(stringToArrayBuffer(String(content)))
  const htmlArray = await doc
    .render()
    .then((htmlElements) => {
      const spanEl = htmlElements.map((el) => el.querySelectorAll('span'))
      const textContents = spanEl.map((el) => {
        if (el && el[0]) {
          return convertHTMLString(el[0].textContent)
        }
      })
      if (textContents) {
        return {
          type: 'paragraph',
          children: textContents.filter((i) => !!i),
        }
      }
    })
    .catch((error) => console.log(error))
  return htmlArray
}

export const generateState = async (contentRtf, scrivx) => {
  Object.values(scrivx).map(async (item, key) => {
    const scrivData = await item.map(async (data) => {
      let childrenRTF = []
      let childRTF = []
      if (data.children && data.children.length) {
        childRTF = await data.children.map(async (child, key) => {
          let htmlElem = []
          const noteRtf = contentRtf.find((rtf) => rtf.uuid === child.uuid)
          if (noteRtf) {
            const parsed = await parseToHTML(noteRtf, child.title)
            if (parsed) htmlElem.push(parsed)
          }
          return {
            id: key + 1,
            title: child.title,
            content: htmlElem || [],
          }
        })
        childrenRTF = await Promise.all(childRTF)
        return {
          uuid: data.uuid,
          title: data.title,
          children: childrenRTF.length ? childrenRTF : [],
        }
      } else {
        return {
          uuid: data.uuid,
          title: data.title,
        }
      }
    })

    // index 0 is the manuscript/draft folder
    if (key > 0) {
      return (scrivx['sections'] = await Promise.all([...scrivData]))
    } else {
      return (scrivx['draft'] = await Promise.all([...scrivData]))
    }
  })

  return scrivx
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
