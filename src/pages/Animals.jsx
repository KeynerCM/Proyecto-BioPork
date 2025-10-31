import Card from '../components/Card'
import Button from '../components/Button'
import { Plus, Search } from 'lucide-react'

function Animals() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Gestión de Animales</h1>
          <p className="text-gray-600">Administra el registro de todos los animales</p>
        </div>
        <Button>
          <Plus size={20} className="inline mr-2" />
          Registrar Animal
        </Button>
      </div>

      <Card>
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por ID, raza o tipo..."
              className="input-field pl-10"
            />
          </div>
          <select className="input-field w-48">
            <option value="">Todos los tipos</option>
            <option value="engorde">Engorde</option>
            <option value="reproduccion">Reproducción</option>
          </select>
        </div>

        <div className="text-center text-gray-500 py-12">
          <p>No hay animales registrados aún</p>
          <p className="text-sm mt-2">Comienza registrando tu primer animal</p>
        </div>
      </Card>
    </div>
  )
}

export default Animals
