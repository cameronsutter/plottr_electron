import jsdom from 'jsdom'

const { JSDOM } = jsdom

function stringToArrayBuffer(string) {
  const buffer = new ArrayBuffer(string.length)
  const bufferView = new Uint8Array(buffer)
  for (let i = 0; i < string.length; i++) {
    bufferView[i] = string.charCodeAt(i)
  }
  return buffer
}

export function runRtfjs(rtf, callback, errorCallback) {
  const virtualConsole = new jsdom.VirtualConsole()
  virtualConsole.sendTo(console)

  new JSDOM(
    `
    <script src="../node_modules/rtf.js/dist/WMFJS.bundle.js"></script>
    <script src="../node_modules/rtf.js/dist/EMFJS.bundle.js"></script>
    <script src="../node_modules/rtf.js/dist/RTFJS.bundle.js"></script>

    <script>
        RTFJS.loggingEnabled(false);
        WMFJS.loggingEnabled(false);
        EMFJS.loggingEnabled(false);

        try {
            const doc = new RTFJS.Document(rtfFile);

            const meta = doc.metadata();
            doc.render().then(function(htmlElements) {
                const div = document.createElement("div");
                div.append(...htmlElements);

                window.done(meta, div.innerHTML);
            }).catch(error => window.onerror(error))
        } catch (error){
            window.onerror(error)
        }
    </script>
    `,
    {
      resources: 'usable',
      runScripts: 'dangerously',
      url: 'file://' + __dirname + '/',
      virtualConsole,
      beforeParse(window) {
        window.rtfFile = stringToArrayBuffer(rtf)
        window.done = function (meta, html) {
          callback(meta, html)
        }
        window.onerror = function (error) {
          errorCallback(error)
        }
      },
    }
  )
}
