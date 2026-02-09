import { useEffect, useState } from 'react'
import axios from 'axios'

function App() {
  const [resources, setResources] = useState([])

  useEffect(() => {
    // Calling your Go Backend!
    axios.get('http://localhost:8080/api/resources')
      .then(res => setResources(res.data))
      .catch(err => console.error("Backend not running?", err))
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">Company Storefront</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {resources.map(item => (
          <div key={item.id} className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold">{item.name}</h2>
            <p className="text-gray-600">Available: {item.available_quantity}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App