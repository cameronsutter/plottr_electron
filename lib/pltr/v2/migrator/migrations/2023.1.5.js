// This is a dummy migration that prevents users from opening files
// created with this and newer versions in older versions of Plottr.
function migrate(data) {
  return data
}

module.exports = migrate
