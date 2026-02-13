import { useEffect, useState } from 'react'
import api, { getCurrentUser, logout as apiLogout, isAuthenticated } from './utils/api.js'
import AuthScreen from './components/AuthScreen.jsx'

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("employee") 
  const [resources, setResources] = useState([])
  const [pendingRequests, setPendingRequests] = useState([])
  const [approvedRequests, setApprovedRequests] = useState([])
  const [myRequests, setMyRequests] = useState([])
  const [selectedResource, setSelectedResource] = useState(null)
  const [reason, setReason] = useState("")
  const [newResName, setNewResName] = useState("")
  const [newResQty, setNewResQty] = useState(1)
  const [message, setMessage] = useState({ text: "", type: "" })
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (isAuthenticated()) {
      const savedUser = getCurrentUser();
      if (savedUser) {
        setUser(savedUser);
      }
    }
  }, []);

  const fetchData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const res = await api.get('/api/resources');
      setResources(res.data || []);

      if (view === "manager" && (user.role === "manager")) {
        const pending = await api.get('/api/requests/pending');
        setPendingRequests(pending.data || []);
      }

      if (view === "store" && user.role === "store") {
        const approved = await api.get('/api/requests/approved');
        setApprovedRequests(approved.data || []);
      }

      if (view === "history") {
        const userEmail = user?.email
        const myReqs = await api.get(`/api/my-requests?email=${userEmail}`);
        setMyRequests(myReqs.data || []);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      if (err.response?.status !== 401) {
        setMessage({ 
          text: err.response?.data?.message || "Failed to fetch data", 
          type: "error" 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, view]);

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: "", type: "" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message])

  const handleLogout = () => {
    apiLogout();
    setUser(null);
    setView("employee");
    setMessage({ text: "Logged out successfully", type: "success" });
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (reason.length < 10) {
      setMessage({ text: "Reason must be at least 10 characters", type: "error" });
      return;
    }
    setLoading(true);
    try {
      await api.post('/api/requests', {
        resource_id: selectedResource.id,
        reason: reason,
        employee_email: user.email 
      });
      setMessage({ text: "Request submitted successfully!", type: "success" });
      setSelectedResource(null);
      setReason("");
      fetchData();
    } catch (err) {
      setMessage({ 
        text: err.response?.data?.message || "Failed to submit request", 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  }

  const handleManagerAction = async (id, action) => {
    const status = action === 'approve' ? 'manager_approved' : 'rejected';
    setLoading(true);
    try {
      await api.patch('/api/requests/action', { id, status });
      setMessage({ text: `Request ${action}d successfully!`, type: "success" });
      fetchData();
    } catch (err) {
      setMessage({ 
        text: err.response?.data?.message || `Failed to ${action} request`, 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  }

  const handleStoreFulfill = async (id) => {
    setLoading(true);
    try {
      await api.patch('/api/requests/fulfill', { id });
      setMessage({ text: "Item issued & stock updated!", type: "success" });
      fetchData();
    } catch (err) {
      setMessage({ 
        text: err.response?.data?.message || "Failed to fulfill request", 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  }

  const handleAddNewResource = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/resources', { 
        name: newResName, 
        quantity: parseInt(newResQty) 
      });
      setMessage({ text: "Resource added to inventory!", type: "success" });
      setNewResName("");
      setNewResQty(1);
      fetchData();
    } catch (err) {
      setMessage({ 
        text: err.response?.data?.message || "Failed to add resource", 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  }

  const hasAccessToView = (viewName) => {
    if (!user) return false;
    switch (viewName) {
      case 'employee':
      case 'history':
        return true;
      case 'manager':
        return user.role === 'manager' || user.role === 'store';
      case 'store':
        return user.role === 'store';
      default:
        return false;
    }
  }

  const handleDeleteResource = async (id) => {
    if (!window.confirm("Are you sure you want to remove this item from inventory?")) return;
    setLoading(true);
    try {
      await api.delete(`/api/resources/${id}`);
      setMessage({ text: "Resource removed!", type: "success" });
      fetchData();
    } catch (err) {
      setMessage({ 
      text: err.response?.data?.error || "Failed to delete", 
      type: "error" 
    });
    } finally {
      setLoading(false);
    }
  }

  // --- FILTER LOGIC ---
  const filteredResources = resources.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) {
    return <AuthScreen onLoginSuccess={setUser} setMessage={setMessage} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <nav className="bg-white border-b p-4 flex flex-col md:flew-row justify-between items-center sticky top-0 z-10 shadow-sm gap-4">
        <div className="flex items-center justify-between md:w-auto gap-4">
          <h1 className="text-xl font-bold text-indigo-600">BitcommStore</h1>
          <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full overflow-hidden">
            <span className="text-[10px] md:text-xs font-bold text-slate-500 uppercase">{user.role}</span>
            <span className=" hidden sm:imline text-xs text-slate-400">•</span>
            <span className="hidden sm:inline text-xs text-slate-600 truncate max-w-[1000px]">{user.email}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap justify-center  items-center gap-2 w-full md:w-auto">
          <div className="flex bg-slate-100 p-1 rounded-xl space-x-1 overflow-x-auto no-scrollbar">
            {['employee', 'history', 'manager', 'store'].map(v => (
              hasAccessToView(v) && (
                <button 
                  key={v} 
                  onClick={() => setView(v)} 
                  className={`px-3 md:px-4 py-2 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-wider transition whitespace-nowrap ${
                    view === v 
                      ? 'bg-white shadow text-indigo-600' 
                      : 'text-slate-500 hover:text-indigo-900'
                  }`}
                >
                  {v}
                </button>
              )
            ))}
          </div>
          <button onClick={handleLogout} className="px-3 py-2 bg-slate-200 rounded-xl text-[10px] md:text-xs font-bold uppercase">
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-8">
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl border ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
            {message.text}
          </div>
        )}

        {/* --- SEARCH UI --- */}
        {view === "employee" && (
          <div className="mb-10 max-w-lg mx-auto">
            <div className="relative group">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search resources..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-transparent bg-white shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Employee View */}
        {view === "employee" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Available Resources</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gqap-6">
              {filteredResources.map(item => (
                <div key={item.id} className="bg-white p-5 md:p-6 rounded-3xl border shadow-sm">
                  <h3 className="text-xl font-bold mb-2">{item.name}</h3>
                  <p className={`text-sm mb-4 ${
                    item.available_quantity === 0 ? 'text-red-500' :
                    item.available_quantity < 5 ? 'text-amber-500' :
                    'text-slate-500'
                  }`}>
                    Stock: {item.available_quantity} / {item.total_quantity}
                  </p>
                  <button 
                    disabled={item.available_quantity <= 0 || loading} 
                    onClick={() => setSelectedResource(item)} 
                    className="w-full bg-indigo-600 text-white py-3 rounded-2xl font-bold disabled:bg-slate-300 disabled:cursor-not-allowed hover:bg-indigo-700 transition"
                  >
                    {item.available_quantity <= 0 ? 'Out of Stock' : 'Request'}
                  </button>
                </div>
              ))}
              {filteredResources.length === 0 && (
                <div className="col-span-3 text-center py-20 text-slate-400">
                  <p className="text-xl">No resources found matching "{searchTerm}"</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Manager View */}
        {view === "manager" && hasAccessToView('manager') && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Pending Requests</h2>
            <div className="bg-white rounded-3xl border overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="p-4">Employee</th>
                    <th className="p-4">Item</th>
                    <th className="p-4">Reason</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRequests.map(r => (
                    <tr key={r.id} className="border-b hover:bg-slate-50">
                      <td className="p-4 text-sm">{r.employee_email}</td>
                      <td className="p-4 font-bold">{r.resource_name}</td>
                      <td className="p-4 text-sm text-slate-600 max-w-xs truncate">{r.reason}</td>
                      <td className="p-4 text-right space-x-2">
                        <button onClick={() => handleManagerAction(r.id, 'approve')} disabled={loading} className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-700 disabled:opacity-50">Approve</button>
                        <button onClick={() => handleManagerAction(r.id, 'reject')} disabled={loading} className="bg-slate-200 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-300 disabled:opacity-50">Reject</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {pendingRequests.length === 0 && <p className="p-10 text-center text-slate-400">No pending approvals.</p>}
            </div>
          </div>
        )}

        {/* Store Manager View */}
        {view === "store" && hasAccessToView('store') && (
          <div className="space-y-8">
            <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
              <h2 className="p-4 md:p-6 text-lg font-bold border-b">Add New Inventory</h2>
              <form onSubmit={handleAddNewResource} className="flex gap-4">
                <input className="flex-1 border p-3 rounded-xl" placeholder="Item Name" value={newResName} onChange={e => setNewResName(e.target.value)} required minLength={3} disabled={loading} />
                <input className="w-24 border p-3 rounded-xl" type="number" min="1" value={newResQty} onChange={e => setNewResQty(e.target.value)} required disabled={loading} />
                <button className="bg-black text-white px-6 rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50" disabled={loading}>Add Item</button>
              </form>
            </div>
            
            <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
              <h2 className="p-6 text-lg font-bold border-b">Manage Current Inventory</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className='bg-slate-50 border-b'>
                    <tr>
                      <th className="p-3 md:p-4 text-[10px] md:text-xs font-black uppercase text-slate-400">Resource Name</th>
                      <th className="p-3 md:p-4 text-[10px] md:text-xs font-black uppercase text-slate-400">Current Stock</th>
                      <th className="p-3 md:p-4 text-[10px] text-xs font-black uppercase text-slate-400 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resources.map(item =>(
                      <tr key={item.id} className="border-b last:border-0 hover:bg-slate-50">
                        <td className="p-4 font-bold text-slate-700">{item.name}</td>
                        <td className="p-4 text-sm text-slate-500">{item.available_quantity} / {item.total_quantity}</td>
                        <td className="p-4 text-right">
                          <button onClick={() => handleDeleteResource(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition" title="Delete permanently">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                      </td>
                    </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-3xl border overflow-hidden">
              <h2 className="p-6 text-lg font-bold border-b">Approved Items to Issue</h2>
              <table className="w-full text-left">
                <tbody>
                  {approvedRequests.map(r => (
                    <tr key={r.id} className="border-b hover:bg-slate-50">
                      <td className="p-4"><div><p className="font-bold">{r.resource_name}</p><p className="text-sm text-slate-500">for {r.employee_email}</p></div></td>
                      <td className="p-4 text-right">
                        <button onClick={() => handleStoreFulfill(r.id)} disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-700 disabled:opacity-50">Issue Item</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {approvedRequests.length === 0 && <p className="p-10 text-center text-slate-400">Nothing to issue yet.</p>}
            </div>
          </div>
        )}

        {/* History View */}
        {view === "history" && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">My Request History</h2>
            <div className="space-y-4">
              {myRequests.map(r => (
                <div key={r.id} className="bg-white p-4 rounded-2xl border flex justify-between items-center hover:shadow-md transition">
                  <div>
                    <p className="font-bold">{r.resource_name}</p>
                    <p className="text-sm text-slate-500 mt-1">{r.reason}</p>
                    <p className="text-xs text-slate-400 mt-1">{new Date(r.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${
                    r.status === 'fulfilled' ? 'bg-emerald-100 text-emerald-700' :
                    r.status === 'manager_approved' ? 'bg-blue-100 text-blue-700' :
                    r.status === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {r.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
              {myRequests.length === 0 && <p className="text-center py-10 text-slate-400">No requests yet.</p>}
            </div>
          </div>
        )}
      </main>

      {selectedResource && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleRequestSubmit} className="bg-white md:p-8 rounded-[2rem] w-full max-w-[95%]md:max-w-md shadow-2xl">
            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-centre md:text-left">Requesting {selectedResource.name}</h2>
            <textarea className="w-full border p-4 rounded-2xl mb-2" placeholder="Reason (min 10 chars)" required minLength={10} maxLength={500} rows={4} value={reason} onChange={e => setReason(e.target.value)} disabled={loading} />
            <p className="text-xs text-slate-400 mb-4 ml-2">{reason.length}/500 characters</p>
            <div className="flex gap-4">
              <button type="submit" disabled={loading || reason.length < 10} className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 disabled:opacity-50">Submit Request</button>
              <button type="button" onClick={() => { setSelectedResource(null); setReason(""); }} className="flex-1 bg-slate-100 rounded-2xl font-bold">Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default App