import React from 'react'
import ReactDOM from 'react-dom/client'
import { Auth0Provider } from '@auth0/auth0-react'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Auth0Provider
      domain="dev-kevinb.us.auth0.com"
      clientId="1jniq1aH8NWiM4D3G8LiRa6WCzvuWtQj"
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: "task-manager-api"
      }}
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>,
)
