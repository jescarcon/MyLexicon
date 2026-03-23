import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './components/utils/authContext/authContext'
import Home from './components/pages/home/home'
import Dictionary from './components/pages/dictionary/dictionary'
import Profile from './components/pages/profile/profile'
import Navbar from './components/utils/navbar/navbar'
import PrivateRoute from './components/utils/privateRoute/privateRoute'
import Error from './components/pages/error/error'
import Entry from './components/pages/entry/entry'

function AppContent() {
  const { user, logout } = useAuth()

  return (
    <div className="app-container">
      {user && <Navbar user={user} logout={logout} />}

      <div className="content">
        <Routes>
          {/* Páginas públicas */}
          <Route path="/" element={<Home />} />

          {/* Páginas privadas */}
          <Route path="/mis-diccionarios/:id" element={
            <PrivateRoute>
              <Entry />
            </PrivateRoute>} />

          <Route path="/mis-diccionarios" element={
            <PrivateRoute>
              <Dictionary />
            </PrivateRoute>} />

          <Route path="/perfil" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>} />

          {/* Página 404 */}
          <Route path="*" element={<Error />} />
        </Routes>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  )
}