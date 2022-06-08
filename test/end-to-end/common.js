import fs from 'fs'

export const TEST_OUTPUT = 'test.pltr'

export const readOutput = () => JSON.parse(fs.readFileSync(TEST_OUTPUT, 'utf-8'))
