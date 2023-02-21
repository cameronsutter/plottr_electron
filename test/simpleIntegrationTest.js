import { repeat, isEqual } from 'lodash'

export const describe = (description, testBody, depth = 0, prefix = '') => {
  const indentation = repeat('  ', depth)
  console.log(`${indentation}> ${prefix} ${description}`)
  const innerDescribe = (description, testBody) => describe(description, testBody, depth + 2)
  const innerIt = (description, testBody) => {
    const itIndentation = repeat('  ', depth + 2)
    if (testBody.length === 1) {
      let called = false
      let successTimeout
      const success = () => {
        called = true
        clearTimeout(successTimeout)
      }
      successTimeout = setTimeout(() => {
        if (!called) {
          throw new Error('Timed out waiting for test to register success')
        }
      }, 50000)
      console.log(`${itIndentation}> it ${description}`)
      return testBody(success)
    } else {
      console.log(`${itIndentation}> it ${description}`)
      return testBody()
    }
  }
  return testBody(innerDescribe, innerIt)
}

export const assertEqual = (a, b) => {
  if (!isEqual(a, b)) {
    console.error(`Expected ${JSON.stringify(a)} to equal ${JSON.stringify(b)}`)
    throw new Error(`Expected ${JSON.stringify(a)} to equal ${JSON.stringify(b)}`)
  }
  return true
}

export const assertGreaterThan = (a, b) => {
  if (a <= b) {
    throw new Error(`Expected ${JSON.stringify(a)} to be greater than ${JSON.stringify(b)}`)
  }
  return true
}
