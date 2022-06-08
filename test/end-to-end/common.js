import fs from 'fs'

export const EXAMPLE_FILES_PATH = 'examples'
export const TEST_OUTPUT = 'test.pltr'
export const A_CORONERS_TALE = 'test_output/A-Coroners-Tale-Temp2.pltr'
export const FRACTURED_TEST = 'test_output/Fractured-Test-Import-to-Plottr.pltr'
export const THE_TURN = 'test_output/The-Turn.pltr'

export const A_CORONERS_TALE_PATH = `${EXAMPLE_FILES_PATH}/${A_CORONERS_TALE}`
export const FRACTURED_TEST_PATH = `${EXAMPLE_FILES_PATH}/${FRACTURED_TEST}`
export const THE_TURN_PATH = `${EXAMPLE_FILES_PATH}/${THE_TURN}`

export const readOutput = (file) => JSON.parse(fs.readFileSync(file, 'utf-8'))
