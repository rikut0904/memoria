import axios from 'axios'
import { getCurrentGroupId } from './group'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
})

api.interceptors.request.use(async (config) => {
  const groupId = getCurrentGroupId()
  if (groupId) {
    config.headers['X-Group-ID'] = String(groupId)
  }
  return config
})

export default api
