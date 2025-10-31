import Card from '../components/Card'

function Notifications() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Notificaciones</h1>
        <p className="text-gray-600">Centro de alertas y recordatorios</p>
      </div>

      <Card>
        <div className="text-center text-gray-500 py-12">
          <p>Módulo de Notificaciones</p>
          <p className="text-sm mt-2">En desarrollo</p>
        </div>
      </Card>
    </div>
  )
}

export default Notifications
