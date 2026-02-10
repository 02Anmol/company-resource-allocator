import { useEffect, useState } from 'react'
import axios from 'axios'

function App() {
  const [view, setView] = useState("employee") // 'employee', 'history', 'manager', 'store'
  const [resources, setResources] = useState([])
  const [pendingRequests, setPendingRequests] = useState([])
  const [approvedRequests, setApprovedRequests] = useState([]) // For Store Manager
  
  // States for Forms
  const [searchEmail, setSearchEmail] = useState("")
  const [myRequests, setMyRequests] = useState([])
  const [selectedResource, setSelectedResource] = useState(null)
  const [email, setEmail] = useState("")
  const [reason, setReason] = useState("")
  const [newResName, setNewResName] = useState("")
  const [newResQty, setNewResQty] = useState(1)
  const [message, setMessage] = useState({ text: "", type: "" })

  //pop-up timer : auto dismiss msg
  useEffect(()=>{
    if(message.text){
      const timer = setTimeout(()=>{
        setMessage({text: "", type: ""});
      },3000);  //3 sec time msg

      return ()=> clearTimeout(timer);
    }
  }, [message])

  // --- API CALLS ---
  const fetchData = () => {
    axios.get('http://localhost:8080/api/resources').then(res => setResources(res.data || []))
    
    if (view === "manager") {
      axios.get('http://localhost:8080/api/requests/pending').then(res => setPendingRequests(res.data || []))
    }
    if (view === "store") {
      axios.get('http://localhost:8080/api/requests/approved').then(res => setApprovedRequests(res.data || []))
    }
  }

  useEffect(() => { fetchData() }, [view])

  //actions
  const handleRequestSubmit = (e) => {
    e.preventDefault()
    axios.post('http://localhost:8080/api/requests', {
      employee_email: email,
      resource_id: selectedResource.id,
      reason: reason
    }).then(() => {
      setMessage({ text: "Submitted to Manager!", type: "success" })
      setSelectedResource(null); setEmail(""); setReason("");
    })
  }

  const handleManagerAction = (id, action) => {
    // action is 'approve' or 'reject'
    const status = action === 'approve' ? 'manager_approved' : 'rejected'
    axios.patch('http://localhost:8080/api/requests/action', { id, status })
      .then(() => { setMessage({ text: `Request ${action}d!`, type: "success" }); fetchData(); })
  }

  const handleStoreFulfill = (id) => {
    axios.patch('http://localhost:8080/api/requests/fulfill', { id })
      .then(() => { setMessage({ text: "Item Issued & Stock Updated!", type: "success" }); fetchData(); })
      .catch(err => setMessage({ text: "Error: " + err.response?.data?.error, type: "error" }))
  }

  const handleAddNewResource = (e) => {
    e.preventDefault()
    axios.post('http://localhost:8080/api/resources', { name: newResName, quantity: parseInt(newResQty) })
      .then(() => { setMessage({ text: "Inventory Added!", type: "success" }); setNewResName(""); fetchData(); })
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* NAVIGATION */}
      <nav className="bg-white border-b p-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <h1 className="text-xl font-bold text-indigo-600">BitcommStore</h1>
        <div className="flex bg-slate-100 p-1 rounded-xl space-x-1">
          {['employee', 'history', 'manager', 'store'].map(v => (
            <button key={v} onClick={() => setView(v)} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition ${view === v ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-indigo-900'}`}>
              {v}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-8">
        {message.text && <div className={`mb-6 p-4 rounded-xl border ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>{message.text}</div>}

        {/* --- EMPLOYEE VIEW --- */}
        {view === "employee" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {resources.map(item => (
              <div key={item.id} className="bg-white p-6 rounded-3xl border shadow-sm">
                <h3 className="text-xl font-bold mb-2">{item.name}</h3>
                <p className="text-slate-500 mb-6">Stock: {item.available_quantity}</p>
                <button disabled={item.available_quantity <= 0} onClick={() => setSelectedResource(item)} className="w-full bg-indigo-600 text-white py-3 rounded-2xl font-bold disabled:bg-slate-300">Request</button>
              </div>
            ))}
          </div>
        )}

        {/* --- MANAGER VIEW (Approval) --- */}
        {view === "manager" && (
          <div className="bg-white rounded-3xl border overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b"><tr><th className="p-4">Employee</th><th className="p-4">Item</th><th className="p-4 text-right">Actions</th></tr></thead>
              <tbody>
                {pendingRequests.map(r => (
                  <tr key={r.id} className="border-b">
                    <td className="p-4 text-sm">{r.employee_email}</td>
                    <td className="p-4 font-bold">{r.resource_name}</td>
                    <td className="p-4 text-right space-x-2">
                      <button onClick={() => handleManagerAction(r.id, 'approve')} className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold">Approve</button>
                      <button onClick={() => handleManagerAction(r.id, 'reject')} className="bg-slate-200 px-4 py-2 rounded-xl text-xs font-bold">Reject</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {pendingRequests.length === 0 && <p className="p-10 text-center text-slate-400">No pending approvals.</p>}
          </div>
        )}

        {/* --- STORE MANAGER VIEW (Fulfillment & Add) --- */}
        {view === "store" && (
          <div>
            <div className="bg-white p-6 rounded-3xl border mb-8">
              <h2 className="text-lg font-bold mb-4">Add New Inventory</h2>
              <form onSubmit={handleAddNewResource} className="flex gap-4">
                <input className="flex-1 border p-3 rounded-xl" placeholder="Item Name" value={newResName} onChange={e => setNewResName(e.target.value)} required />
                <input className="w-24 border p-3 rounded-xl" type="number" value={newResQty} onChange={e => setNewResQty(e.target.value)} required />
                <button className="bg-black text-white px-6 rounded-xl font-bold">Add Item</button>
              </form>
            </div>

            <div className="bg-white rounded-3xl border overflow-hidden">
              <h2 className="p-6 text-lg font-bold border-b">Approved Items to Issue</h2>
              <table className="w-full text-left">
                <tbody>
                  {approvedRequests.map(r => (
                    <tr key={r.id} className="border-b">
                      <td className="p-4"><b>{r.resource_name}</b> for {r.employee_email}</td>
                      <td className="p-4 text-right">
                        <button onClick={() => handleStoreFulfill(r.id)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold">Issue Item</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {approvedRequests.length === 0 && <p className="p-10 text-center text-slate-400">Nothing to issue yet.</p>}
            </div>
          </div>
        )}

        {/* --- HISTORY VIEW --- */}
        {view === "history" && (
          <div className="max-w-xl mx-auto">
            <input className="w-full border p-4 rounded-2xl mb-4" placeholder="Enter email to check status..." value={searchEmail} onChange={e => setSearchEmail(e.target.value)} />
            <button onClick={() => {
              axios.get(`http://localhost:8080/api/my-requests?email=${searchEmail}`).then(res => setMyRequests(res.data || []))
            }} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold mb-8">Check Status</button>
            <div className="space-y-4">
              {myRequests.map(r => (
                <div key={r.id} className="bg-white p-4 rounded-2xl border flex justify-between items-center">
                  <span>{r.resource_name}</span>
                  <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${r.status === 'fulfilled' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{r.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* REQUEST MODAL */}
      {selectedResource && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleRequestSubmit} className="bg-white p-8 rounded-[2rem] max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Requesting {selectedResource.name}</h2>
            <input className="w-full border p-4 rounded-2xl mb-4" placeholder="Work Email" required value={email} onChange={e => setEmail(e.target.value)} />
            <textarea className="w-full border p-4 rounded-2xl mb-4" placeholder="Reason" required value={reason} onChange={e => setReason(e.target.value)} />
            <div className="flex gap-4">
              <button type="submit" className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-bold">Submit</button>
              <button type="button" onClick={() => setSelectedResource(null)} className="flex-1 bg-slate-100 rounded-2xl font-bold">Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default App