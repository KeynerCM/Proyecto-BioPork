import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Layout from './components/Layout'
import Login from './pages/Login'
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

  // Componente para proteger rutas según rol
  const ProtectedRoute = ({ children, requiredRol }) => {
    if (requiredRol && user?.rol !== requiredRol) {
      return <Navigate to="/" replace />
    }
    return children
  }

  // Componente para rutas de solo lectura (consultor no puede editar)
  const EditableRoute = ({ children }) => {
    return children
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <Layout user={user} onLogout={handleLogout}>
      <Routes>
        <Route path="/" element={<Statistics user={user} />} />
        <Route path="/animales" element={<Animals user={user} />} />
        <Route path="/reproduccion" element={<Reproduction user={user} />} />
        <Route path="/salud" element={<Health user={user} />} />
        <Route path="/grupos" element={<Groups user={user} />} />
        <Route path="/notificaciones" element={<Notifications user={user} />} />
        <Route 
          path="/usuarios" 
          element={
            <ProtectedRoute requiredRol="admin">
              <Users user={user} />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default App
