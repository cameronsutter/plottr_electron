import semverGt from 'semver/functions/gt'

import { toSemver } from './toSemver'

export const greaterBySemver = (thisVersion, thatVersion) =>
  semverGt(toSemver(thisVersion), toSemver(thatVersion))
