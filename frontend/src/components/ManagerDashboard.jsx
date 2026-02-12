import { useEffect, useState } from 'react'
import axios from 'axios'

export default function ManagerDashboard() {
  const [requests, setRequests] = useState([])

  // Fetch only pending requests
  const fetchPending = () => {
    axios.get('http://localhost:8080/api/requests/pending')
      .then(res => setRequests(res.data))
      .catch(err => console.error(err))
  }

  useEffect(() => {
    fetchPending()
  }, [])

  const handleAction = (id, status) => {
    axios.patch('http://localhost:8080/api/requests/action', { id, status })
      .then(() => {
        alert(`Request ${status}!`)
        fetchPending() // Refresh the list
      })
      .catch(err => alert("Error updating request"))
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Pending Resource Requests</h2>
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="p-4">Employee</th>
              <th className="p-4">Item</th>
              <th className="p-4">Reason</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(req => (
              <tr key={req.id} className="border-b hover:bg-gray-50">
                <td className="p-4">{req.employee_email}</td>
                <td className="p-4 font-semibold">{req.resource_name}</td>
                <td className="p-4 italic text-gray-600">"{req.reason}"</td>
                <td className="p-4 flex gap-2">
                  <button 
                    onClick={() => handleAction(req.id, 'approved')}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => handleAction(req.id, 'rejected')}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr><td colSpan="4" className="p-10 text-center text-gray-500">No pending requests!</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}