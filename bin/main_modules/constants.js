let TRIAL_MODE = process.env.TRIALMODE === 'true';

const getTrialMode = () => TRIAL_MODE;
const setTrialMode = (value) => TRIAL_MODE = value;

module.exports = {
  getTrialMode,
  setTrialMode,
  NODE_ENV: process.env.NODE_ENV,
  ROLLBAR_ACCESS_TOKEN: process.env.ROLLBAR_ACCESS_TOKEN || ''
}
