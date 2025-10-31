import { Link, useLocation } from 'react-router-dom'
import { 
  Home, 
  PiggyBank, 
  Heart, 
  Syringe, 
  Users, 
  BarChart3, 
  Bell,
  LogOut,
  Menu,
  X,
  Shield
} from 'lucide-react'
import { useState } from 'react'

const menuItems = [
  { path: '/', icon: Home, label: 'Dashboard' },
  { path: '/animales', icon: PiggyBank, label: 'Animales' },
  { path: '/reproduccion', icon: Heart, label: 'Reproducción' },
  { path: '/salud', icon: Syringe, label: 'Salud' },
  { path: '/grupos', icon: Users, label: 'Grupos' },
  { path: '/estadisticas', icon: BarChart3, label: 'Estadísticas' },
  { path: '/notificaciones', icon: Bell, label: 'Notificaciones' },
  { path: '/usuarios', icon: Shield, label: 'Usuarios', adminOnly: true },
]

function Layout({ children, user, onLogout }) {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden mr-4 text-gray-600 hover:text-gray-900"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <h1 className="text-2xl font-bold text-primary-600">BioPork</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.nombre || 'Usuario'}
              </span>
              <button
                onClick={onLogout}
                className="flex items-center text-gray-600 hover:text-primary-600 transition-colors"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-40 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 w-64`}
      >
        <nav className="p-4 space-y-2">
          {menuItems
            .filter((item) => !item.adminOnly || user?.rol === 'admin')
            .map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

export default Layout
