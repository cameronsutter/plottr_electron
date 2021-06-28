import { backupFiles, backupFolders, sortFileNamesByDate } from '../backup'

describe('backupFolders', () => {
  describe('given an empty backup directory', () => {
    const emptyFolder = `${__dirname}/__fixtures__/empty_backups/`
    it('should produce an empty list', () => {
      expect(backupFolders(emptyFolder)).toEqual([])
    })
  })
  describe('given a non-empty folder', () => {
    const nonEmptyBackupFolder = `${__dirname}/__fixtures__/backups/`
    it('should produce the base-names of all those folders', () => {
      expect(backupFolders(nonEmptyBackupFolder)).toEqual([
        '4_12_2021',
        '4_13_2021',
        '4_21_2021',
        '4_7_2021',
        '4_8_2021',
        '5_12_2021',
        '5_15_2021',
        '5_18_2021',
        '5_19_2021',
        '5_20_2021',
        '6_25_2021',
        '6_3_2021',
        '6_4_2021',
      ])
    })
  })
})

describe('backupFiles', () => {
  describe('given an empty backup directory', () => {
    const emptyFolder = `${__dirname}/__fixtures__/empty_backups/`
    it('should produce an empty list', () => {
      expect(backupFiles(emptyFolder)).toEqual([])
    })
  })
  describe('given a non-empty folder', () => {
    const nonEmptyBackupFolder = `${__dirname}/__fixtures__/backups/`
    it('should produce a list of all of the files contained in that folder', () => {
      expect(backupFiles(nonEmptyBackupFolder)).toEqual([
        '5_15_2021/(start-session)-Goldilocks and The Three Bears.pltr',
        '5_15_2021/Goldilocks and The Three Bears.pltr',
        '5_18_2021/(start-session)-Zelda.pltr',
        '5_18_2021/Zelda.pltr',
        '5_19_2021/(start-session)-Zelda.pltr',
        '5_19_2021/Zelda.pltr',
        '6_25_2021/(start-session)-Zelda.pltr',
        '6_25_2021/Zelda.pltr',
        '6_3_2021/(start-session)-Zelda.pltr',
        '6_3_2021/Zelda.pltr',
        '6_4_2021/(start-session)-Zelda.pltr',
        '6_4_2021/Zelda.pltr',
      ])
    })
  })
})

describe('sortFileNamesByDate', () => {
  describe('given the empty list', () => {
    it('should produce the empty list', () => {
      expect(sortFileNamesByDate([])).toEqual([])
    })
  })
  describe('given a non-empty list of jumbled file names', () => {
    it('should produce those file names, sorted by date with initial backup first', () => {
      expect(
        sortFileNamesByDate([
          '6_4_2021/Zelda.pltr',
          '5_19_2021/(start-session)-Zelda.pltr',
          '5_19_2021/Zelda.pltr',
          '5_15_2021/(start-session)-Goldilocks and The Three Bears.pltr',
          '6_25_2021/(start-session)-Zelda.pltr',
          '6_25_2021/Zelda.pltr',
          '6_3_2021/(start-session)-Zelda.pltr',
          '6_3_2021/Zelda.pltr',
          '5_15_2021/Goldilocks and The Three Bears.pltr',
          '6_4_2021/(start-session)-Zelda.pltr',
          '5_18_2021/Zelda.pltr',
          '5_18_2021/(start-session)-Zelda.pltr',
        ])
      ).toEqual([
        '5_15_2021/(start-session)-Goldilocks and The Three Bears.pltr',
        '5_15_2021/Goldilocks and The Three Bears.pltr',
        '5_18_2021/(start-session)-Zelda.pltr',
        '5_18_2021/Zelda.pltr',
        '5_19_2021/(start-session)-Zelda.pltr',
        '5_19_2021/Zelda.pltr',
        '6_25_2021/(start-session)-Zelda.pltr',
        '6_25_2021/Zelda.pltr',
        '6_3_2021/(start-session)-Zelda.pltr',
        '6_3_2021/Zelda.pltr',
        '6_4_2021/(start-session)-Zelda.pltr',
        '6_4_2021/Zelda.pltr',
      ])
    })
  })
})
