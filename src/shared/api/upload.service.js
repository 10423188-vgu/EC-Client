import { api } from './api'
import axios from 'axios'

export const uploadService = {
  getPresignedUrl: (folder) => api.post('/upload/presign', { folder }),
  uploadImage: async (blob, folder, fileName = blob.name ?? 'image.jpg') => {
    const { data: presign } = (await uploadService.getPresignedUrl(folder)).data
    const form = new FormData()
    form.append('file', blob, fileName)
    form.append('timestamp', presign.timestamp)
    form.append('signature', presign.signature)
    form.append('folder', presign.folder)
    form.append('api_key', presign.apiKey)
    // why: Cloudinary is external; avoid the app's cookie and refresh interceptors.
    const { data } = await axios.post(
      `https://api.cloudinary.com/v1_1/${presign.cloudName}/image/upload`,
      form,
      { timeout: 120000 },
    )
    return data.secure_url.replace(
      '/upload/',
      '/upload/f_auto,q_auto,w_1600,c_limit/',
    )
  },
}
