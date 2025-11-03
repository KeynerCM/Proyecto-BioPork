import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'

function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    // Animación de entrada
    setTimeout(() => setIsVisible(true), 10)

    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      onClose()
    }, 300)
  }

  const icons = {
    success: <CheckCircle size={24} className="text-green-600 flex-shrink-0" />,
    error: <XCircle size={24} className="text-red-600 flex-shrink-0" />,
    warning: <AlertCircle size={24} className="text-yellow-600 flex-shrink-0" />,
    info: <Info size={24} className="text-blue-600 flex-shrink-0" />,
  }

  const styles = {
    success: 'bg-white border-l-4 border-green-500 shadow-lg',
    error: 'bg-white border-l-4 border-red-500 shadow-lg',
    warning: 'bg-white border-l-4 border-yellow-500 shadow-lg',
    info: 'bg-white border-l-4 border-blue-500 shadow-lg',
  }

  const titleColors = {
    success: 'text-green-800',
    error: 'text-red-800',
    warning: 'text-yellow-800',
    info: 'text-blue-800',
  }

  const titles = {
    success: '¡Éxito!',
    error: 'Error',
    warning: 'Advertencia',
    info: 'Información',
  }

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-start gap-3 px-5 py-4 rounded-lg transition-all duration-300 ${styles[type]} ${
        isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
      style={{ minWidth: '320px', maxWidth: '500px' }}
    >
      <div className="mt-0.5">{icons[type]}</div>
      <div className="flex-1">
        <h4 className={`font-semibold mb-1 ${titleColors[type]}`}>{titles[type]}</h4>
        <p className="text-sm text-gray-700">{message}</p>
      </div>
      <button 
        onClick={handleClose} 
        className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 mt-0.5"
        aria-label="Cerrar"
      >
        <X size={18} />
      </button>
    </div>
  )
}

export default Toast
