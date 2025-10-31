import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Animals from './pages/Animals'
import Reproduction from './pages/Reproduction'
import Health from './pages/Health'
import Groups from './pages/Groups'
import Statistics from './pages/Statistics'
import Notifications from './pages/Notifications'
import Users from './pages/Users'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Verificar si hay una sesión activa
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
    setIsAuthenticated(true)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const handleLogout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('user')
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <Layout user={user} onLogout={handleLogout}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/animales" element={<Animals />} />
        <Route path="/reproduccion" element={<Reproduction />} />
        <Route path="/salud" element={<Health />} />
        <Route path="/grupos" element={<Groups />} />
        <Route path="/estadisticas" element={<Statistics />} />
        <Route path="/notificaciones" element={<Notifications />} />
        <Route path="/usuarios" element={<Users />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default App
