const fs = require('fs')
const { join } = require('path')
const semver = require('semver')
const childProcess = require('child_process')

const { readdir, lstat, readFile } = fs.promises

const directoriesInDirectory = (base, directory) => {
  return readdir(directory).then((contents) => {
    const directories = contents.map((entry) => {
      return lstat(join(base, entry)).then((stats) => {
        return {
          entry,
          isDirectory: stats.isDirectory(),
        }
      })
    })
    return Promise.all(directories).then((results) => {
      return results.reduce((acc, { entry, isDirectory }) => {
        if (isDirectory) {
          return [...acc, entry]
        }
        return acc
      }, [])
    })
  })
}

const filesInDirectory = (base, directory) => {
  return readdir(join(base, directory)).then((contents) => {
    const directories = contents.map((entry) => {
      return lstat(join(base, directory, entry)).then((stats) => {
        return {
          entry,
          isFile: stats.isFile(),
        }
      })
    })
    return Promise.all(directories).then((results) => {
      return results.reduce((acc, { entry, isFile }) => {
        if (isFile) {
          return [...acc, entry]
        }
        return acc
      }, [])
    })
  })
}

const keepSubTrees = (directories) => {
  return Promise.all(
    directories.map((directory) => {
      const subFiles = filesInDirectory('lib', directory)
      const hasPackage = subFiles.then((files) => {
        return files.some((file) => {
          return file === 'package.json'
        })
      })
      return hasPackage.then((hasPackage) => {
        return {
          directory,
          isSubTree: hasPackage,
        }
      })
    })
  ).then((results) => {
    return results.reduce((acc, { directory, isSubTree }) => {
      if (isSubTree) {
        return [...acc, directory]
      }
      return acc
    }, [])
  })
}

const aggregateSubTreePackages = (base) => (subTreeDirectories) => {
  return Promise.all(
    subTreeDirectories.map((directory) => {
      return readFile(join(base, directory, 'package.json')).then((file) => {
        const { dependencies, devDependencies } = JSON.parse(file)
        return { dependencies: dependencies || [], devDependencies: devDependencies || [] }
      })
    })
  ).then((results) => {
    return results.reduce(
      (acc, next) => {
        const withDependencyType = (name, newDependencyObject) => {
          return Object.entries(next[name]).reduce((accIter, [key, value]) => {
            if (
              semver.valid(accIter[name][key]) &&
                semver.valid(value) &&
                semver.gt(semver.coerce(accIter[name][key]), semver.coerce(value))
            ) {
              console.warn(`Two sub trees depend on ${key}.  Taking the higher version: ${value}`)
              return {
                ...accIter,
                [name]: {
                  ...accIter[name],
                  [key]: value,
                },
              }
            } else if (!accIter[name][key]) {
              return {
                ...accIter,
                [name]: {
                  ...accIter[name],
                  [key]: value,
                },
              }
            } else {
              if (accIter[name][key]) {
                console.warn(`Two sub trees depend on ${key}.  Taking the higher version: ${value}`)
              }
              return accIter
            }
          }, newDependencyObject)
        }
        const withDependencies = withDependencyType('dependencies', acc)
        const withDevDependencies = withDependencyType('devDependencies', withDependencies)
        return withDevDependencies
      },
      {
        dependencies: {},
        devDependencies: {},
      }
    )
  })
}

function main() {
  directoriesInDirectory('./lib/', './lib/')
    .then(keepSubTrees)
    .then(aggregateSubTreePackages('lib'))
    .then((results) => {
      console.log('Sub tree dependencies', results)
      console.log('Installing dependencies:')
      Object.entries(results.dependencies).map(([packageName, version]) => {
        const args = ['npm', 'i', '--save', `${packageName}@${version}`]
        console.log(`> ${args.join(' ')}`)
        childProcess.execFileSync(...args)
      })
      console.log('Installing dev dependencies:')
      Object.entries(results.devDependencies).map(([packageName, version]) => {
        const args = ['npm', 'i', '--save-dev', `${packageName}@${version}`]
        console.log(`> ${args.join(' ')}`)
        childProcess.execFileSync(...args)
      })
    })
}

main()
