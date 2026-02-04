import axios from 'axios'
import { getCurrentGroupId } from './group'

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL
const baseURL = apiBase ? `${apiBase.replace(/\/$/, '')}/api` : '/api'

const api = axios.create({
  baseURL,
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
