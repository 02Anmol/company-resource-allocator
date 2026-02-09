import { useEffect, useState } from 'react'
import axios from 'axios'

function App() {
  // --- STATE ---
  const [view, setView] = useState("employee") // Toggle: 'employee' or 'manager'
  const [resources, setResources] = useState([])
  const [pendingRequests, setPendingRequests] = useState([])
  
  // Form State
  const [selectedResource, setSelectedResource] = useState(null)
  const [email, setEmail] = useState("")
  const [reason, setReason] = useState("")
  const [message, setMessage] = useState({ text: "", type: "" })

  // --- API CALLS ---
  const fetchResources = () => {
    axios.get('http://localhost:8080/api/resources')
      .then(res => setResources(res.data))
      .catch(err => console.error("Error fetching resources:", err))
  }

  const fetchPendingRequests = () => {
    axios.get('http://localhost:8080/api/requests/pending')
      .then(res => setPendingRequests(res.data))
      .catch(err => console.error("Error fetching requests:", err))
  }

  useEffect(() => {
    fetchResources()
    if (view === "manager") fetchPendingRequests()
  }, [view])

  // --- HANDLERS ---
  const handleRequestSubmit = (e) => {
    e.preventDefault()
    const payload = {
      employee_email: email,
      resource_id: selectedResource.id,
      reason: reason
    }

    axios.post('http://localhost:8080/api/requests', payload)
      .then(() => {
        setMessage({ text: "Request submitted successfully!", type: "success" })
        setSelectedResource(null)
        setEmail(""); setReason("");
      })
      .catch(err => setMessage({ text: "Error: " + err.response?.data?.error, type: "error" }))
  }

  const handleAction = (id, status) => {
    axios.patch('http://localhost:8080/api/requests/action', { id, status })
      .then(() => {
        setMessage({ text: `Request ${status} successfully!`, type: "success" })
        fetchPendingRequests()
        fetchResources() // Refresh stock count
      })
      .catch(err => setMessage({ text: "Action failed", type: "error" }))
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-xl font-bold tracking-tight text-indigo-600">ResourcePortal.io</h1>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button 
            onClick={() => setView("employee")} 
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${view === 'employee' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Storefront
          </button>
          <button 
            onClick={() => setView("manager")} 
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${view === 'manager' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Manager Dashboard
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-8">
        {/* Global Feedback Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg border ${message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
            {message.text}
            <button className="float-right font-bold" onClick={() => setMessage({text:"", type:""})}>&times;</button>
          </div>
        )}

        {/* --- EMPLOYEE VIEW --- */}
        {view === "employee" && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-extrabold">Available Equipment</h2>
              <p className="text-slate-500">Select an item to request for your workstation.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map(item => (
                <div key={item.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold">{item.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${item.available_quantity > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {item.available_quantity} In Stock
                    </span>
                  </div>
                  <button 
                    disabled={item.available_quantity === 0}
                    onClick={() => setSelectedResource(item)}
                    className="w-full mt-2 bg-indigo-600 text-white py-2.5 rounded-xl font-semibold hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition"
                  >
                    {item.available_quantity > 0 ? "Request This Item" : "Out of Stock"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- MANAGER VIEW --- */}
        {view === "manager" && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-extrabold">Approval Queue</h2>
              <p className="text-slate-500">Review and process employee resource requests.</p>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">Employee</th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">Resource</th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">Reason</th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingRequests.map(req => (
                    <tr key={req.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 text-sm">{req.employee_email}</td>
                      <td className="px-6 py-4 text-sm font-medium">{req.resource_name}</td>
                      <td className="px-6 py-4 text-sm text-slate-500 italic">"{req.reason}"</td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button 
                          onClick={() => handleAction(req.id, 'approved')}
                          className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleAction(req.id, 'rejected')}
                          className="px-3 py-1.5 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-300"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {pendingRequests.length === 0 && (
                <div className="p-20 text-center text-slate-400">
                  <p>All caught up! No pending requests.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* --- REQUEST MODAL --- */}
      {selectedResource && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-bold mb-1">Request {selectedResource.name}</h2>
            <p className="text-slate-500 mb-6 text-sm">Fill in your details to submit this request.</p>
            
            <form onSubmit={handleRequestSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Work Email</label>
                <input 
                  type="email" placeholder="e.g. name@company.com" required
                  className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Reason for Request</label>
                <textarea 
                  placeholder="Why do you need this item?" required rows="3"
                  className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  value={reason} onChange={(e) => setReason(e.target.value)}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition">
                  Confirm Request
                </button>
                <button type="button" onClick={() => setSelectedResource(null)} className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-200 transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App