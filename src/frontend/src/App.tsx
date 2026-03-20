import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Index from './components/pages/index'
import { AuthProvider } from './components/utils/authContext/authContext'
import Main from './components/pages/main/main'

function App() {

  return (
    <BrowserRouter>
      <AuthProvider>

        <div className="app-container">

          <div className="content">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/main" element={<Main />} />
            </Routes>

          </div>

        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
