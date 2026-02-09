import { useEffect, useState } from 'react'
import axios from 'axios'

function App() {
  // --- STATE ---
  const [view, setView] = useState("employee") 
  const [resources, setResources] = useState([])
  const [pendingRequests, setPendingRequests] = useState([])
  const [searchEmail, setSearchEmail] = useState("")
  const [myRequests, setMyRequests] = useState([])
  
  // Form/Modal State
  const [selectedResource, setSelectedResource] = useState(null)
  const [email, setEmail] = useState("")
  const [reason, setReason] = useState("")
  const [message, setMessage] = useState({ text: "", type: "" })

  // --- API CALLS ---
  const fetchResources = () => {
    axios.get('http://localhost:8080/api/resources')
      .then(res => setResources(Array.isArray(res.data) ? res.data : []))
      .catch(err => console.error("Error fetching resources:", err))
  }

  const fetchPendingRequests = () => {
    axios.get('http://localhost:8080/api/requests/pending')
      .then(res => setPendingRequests(Array.isArray(res.data) ? res.data : []))
      .catch(err => {
        console.error("Error fetching requests:", err)
        setPendingRequests([]) 
      })
  }

  const fetchMyHistory = () => {
    if (!searchEmail) return;
    axios.get(`http://localhost:8080/api/my-requests?email=${searchEmail}`)
      .then(res => setMyRequests(Array.isArray(res.data) ? res.data : []))
      .catch(() => setMyRequests([]));
  }

  useEffect(() => {
    fetchResources()
    if (view === "manager") fetchPendingRequests()
  }, [view])

  // --- HANDLERS (The missing function was here!) ---
  const handleSubmitRequest = (e) => {
    if (e) e.preventDefault(); // Prevent page reload
    
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
        fetchResources(); // Update stock count immediately
      })
      .catch(err => setMessage({ text: "Error: " + err.response?.data?.error, type: "error" }))
  }

  const handleAction = (id, status) => {
    axios.patch('http://localhost:8080/api/requests/action', { id, status })
      .then(() => {
        setMessage({ text: `Request ${status}!`, type: "success" })
        fetchPendingRequests()
        fetchResources() 
      })
      .catch(() => setMessage({ text: "Action failed", type: "error" }))
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Navigation - Always Visible */}
      <nav className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <h1 className="text-xl font-bold tracking-tight text-indigo-600">ResourcePortal.io</h1>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          {['employee', 'history', 'manager'].map((v) => (
            <button 
              key={v}
              onClick={() => { setView(v); setMessage({text:"", type:""}); }} 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition capitalize ${view === v ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {v === 'employee' ? 'Storefront' : v === 'history' ? 'My Requests' : 'Manager'}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-8">
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl border flex justify-between items-center ${message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
            <span className="text-sm font-medium">{message.text}</span>
            <button onClick={() => setMessage({text:"", type:""})} className="text-lg font-bold">×</button>
          </div>
        )}

        {/* --- STOREFRONT --- */}
        {view === "employee" && (
          <div>
            <h2 className="text-3xl font-black mb-8 text-center">Available Equipment</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {resources.map(item => (
                <div key={item.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition">
                  <h3 className="text-xl font-bold mb-2">{item.name}</h3>
                  <p className="text-slate-500 text-sm mb-6">Stock: {item.available_quantity}</p>
                  <button 
                    disabled={item.available_quantity === 0}
                    onClick={() => setSelectedResource(item)}
                    className="w-full bg-slate-900 text-white py-3 rounded-2xl font-bold hover:bg-slate-800 disabled:bg-slate-200 transition"
                  >
                    {item.available_quantity > 0 ? "Request Item" : "Out of Stock"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- MANAGER VIEW --- */}
        {view === "manager" && (
          <div>
            <h2 className="text-3xl font-black mb-8">Approval Queue</h2>
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Request Details</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingRequests.length > 0 ? (
                    pendingRequests.map(req => (
                      <tr key={req.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-6">
                          <div className="text-sm font-bold text-indigo-600">{req.resource_name}</div>
                          <div className="text-xs text-slate-500 mt-1 italic">{req.employee_email}: "{req.reason}"</div>
                        </td>
                        <td className="px-6 py-6 text-right space-x-3">
                          <button onClick={() => handleAction(req.id, 'approved')} className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition">Approve</button>
                          <button onClick={() => handleAction(req.id, 'rejected')} className="px-4 py-2 bg-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-300 transition">Reject</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2" className="p-20 text-center text-slate-400 italic">No pending requests at the moment.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- HISTORY VIEW --- */}
        {view === "history" && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-black mb-8 text-center">My Request Status</h2>
            <div className="flex gap-2 mb-8">
              <input 
                type="email" 
                placeholder="Enter your email..." 
                className="flex-1 border border-slate-200 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
              />
              <button onClick={fetchMyHistory} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-700">Search</button>
            </div>
            <div className="space-y-4">
              {myRequests.map(r => (
                <div key={r.id} className="p-6 bg-white border border-slate-200 rounded-2xl flex justify-between items-center shadow-sm">
                  <div>
                    <h4 className="font-bold">{r.resource_name}</h4>
                    <p className="text-xs text-slate-400">{new Date(r.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    r.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 
                    r.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {r.status}
                  </span>
                </div>
              ))}
              {myRequests.length === 0 && searchEmail && <p className="text-center text-slate-400">No history found.</p>}
            </div>
          </div>
        )}
      </main>

      {/* --- MODAL --- */}
      {selectedResource && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full p-8">
            <h2 className="text-2xl font-black mb-6 text-slate-800">Request {selectedResource.name}</h2>
            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <input 
                type="email" 
                placeholder="Work Email" 
                required
                className="w-full border border-slate-200 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
              />
              <textarea 
                placeholder="Reason for request" 
                required
                className="w-full border border-slate-200 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500" 
                value={reason} 
                onChange={(e) => setReason(e.target.value)} 
              />
              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200">Submit</button>
                <button type="button" onClick={() => setSelectedResource(null)} className="flex-1 bg-slate-100 py-4 rounded-2xl font-bold text-slate-500">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App