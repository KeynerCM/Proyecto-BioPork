import Card from '../components/Card'

function Health() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Control Sanitario</h1>
        <p className="text-gray-600">Gestión de vacunaciones y tratamientos</p>
      </div>

      <Card>
        <div className="text-center text-gray-500 py-12">
          <p>Módulo de Salud</p>
          <p className="text-sm mt-2">En desarrollo</p>
        </div>
      </Card>
    </div>
  )
}

export default Health
