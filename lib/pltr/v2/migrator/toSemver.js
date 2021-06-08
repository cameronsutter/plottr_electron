import semverCoerce from 'semver/functions/coerce'

export const toSemver = (version) => {
  return semverCoerce(version.replace('m', '').replace(/_/g, '.'))
}
