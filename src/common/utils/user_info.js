import Store from 'electron-store'
import { USER_INFO_PATH } from './config_paths'
const USER = new Store({name: USER_INFO_PATH})
export default USER