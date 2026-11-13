import { createRoot } from 'react-dom/client'
import { Providers } from './app/Providers'
import './shared/api/axios.instance.js'
import './shared/styles/globals.css'
createRoot(document.getElementById('root')).render(<Providers />)
