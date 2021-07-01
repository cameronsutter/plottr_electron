import { DateTime } from 'luxon'
import {
  backupFiles,
  backupFolders,
  isABackupFile,
  sortFileNamesByDate,
  fileIsSoonerThan,
} from '../backup'

describe('isABackupFile', () => {
  describe('given an empty file name', () => {
    it('should produce false', () => {
      expect(isABackupFile('')).toBeFalsy()
    })
  })
  describe("given a file which isn't in a backup folder", () => {
    it('should produce false', () => {
      expect(isABackupFile('test.pltr')).toBeFalsy()
    })
  })
  describe('given a file which is in a backup folder', () => {
    describe('but is also nested in another folder', () => {
      it('should produce false', () => {
        expect(isABackupFile('some-folder/6_4_2021/test.pltr')).toBeFalsy()
      })
    })
    describe("but doesn't end in 'pltr'", () => {
      it('should produce false', () => {
        expect(isABackupFile('6_4_2021/test.txt')).toBeFalsy()
      })
    })
    describe("and ends in 'pltr'", () => {
      it('should produce true', () => {
        expect(isABackupFile('6_4_2021/test.pltr')).toBeTruthy()
      })
    })
  })
})

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
        '6_30_2021',
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
          '10_15_2021/(start-session)-Goldilocks and The Three Bears.pltr',
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
        '6_3_2021/(start-session)-Zelda.pltr',
        '6_3_2021/Zelda.pltr',
        '6_4_2021/(start-session)-Zelda.pltr',
        '6_4_2021/Zelda.pltr',
        '6_25_2021/(start-session)-Zelda.pltr',
        '6_25_2021/Zelda.pltr',
        '10_15_2021/(start-session)-Goldilocks and The Three Bears.pltr',
      ])
    })
  })
})

describe('fileIsSoonerThan', () => {
  describe('given the anchor date 12th June 2020', () => {
    const anchorDate = DateTime.fromObject({
      day: 12,
      month: 6,
      year: 2020,
    })
    describe('and a file name with date: 13 June 2020', () => {
      it('should produce true', () => {
        expect(fileIsSoonerThan(anchorDate, '6_13_2020/test.pltr')).toEqual(true)
      })
    })
    describe('and a file name with date: 12 June 2020', () => {
      it('should produce false', () => {
        expect(fileIsSoonerThan(anchorDate, '6_12_2020/test.pltr')).toEqual(false)
      })
    })
    describe('and a file name with date: 11 June 2020', () => {
      it('should produce false', () => {
        expect(fileIsSoonerThan(anchorDate, '6_11_2020/test.pltr')).toEqual(false)
      })
    })
  })
})
