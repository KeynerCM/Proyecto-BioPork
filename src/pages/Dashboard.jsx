import { PiggyBank, Heart, Syringe, AlertCircle } from 'lucide-react'
import Card from '../components/Card'

function Dashboard() {
  const stats = [
    {
      title: 'Total de Animales',
      value: '145',
      icon: PiggyBank,
      color: 'bg-blue-500',
      change: '+5 este mes',
    },
    {
      title: 'Cerdas Reproductoras',
      value: '32',
      icon: Heart,
      color: 'bg-pink-500',
      change: '8 en gestación',
    },
    {
      title: 'Cerdos de Engorde',
      value: '113',
      icon: PiggyBank,
      color: 'bg-green-500',
      change: '15 próximos a salida',
    },
    {
      title: 'Alertas Pendientes',
      value: '7',
      icon: AlertCircle,
      color: 'bg-orange-500',
      change: '3 vacunaciones',
    },
  ]

  const recentNotifications = [
    {
      id: 1,
      type: 'vaccination',
      message: 'Vacunación de cerda #A-042 programada para mañana',
      time: 'Hace 2 horas',
    },
    {
      id: 2,
      type: 'reproduction',
      message: 'Cerda #B-015 entrará en ciclo reproductivo en 3 días',
      time: 'Hace 5 horas',
    },
    {
      id: 3,
      type: 'exit',
      message: 'Grupo #G-03 listo para salida en 7 días',
      time: 'Hace 1 día',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
        <p className="text-gray-600">Resumen general de tu granja porcina</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon size={24} className="text-white" />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Notificaciones Recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Notificaciones Recientes">
          <div className="space-y-4">
            {recentNotifications.map((notification) => (
              <div
                key={notification.id}
                className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
              >
                <Syringe size={20} className="text-primary-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Actividad Reciente">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="text-sm text-gray-800">Nuevo animal registrado: #C-156</p>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <p className="text-sm text-gray-800">Parto registrado: Cerda #A-023</p>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <p className="text-sm text-gray-800">Grupo #G-02 trasladado a corral 5</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard
