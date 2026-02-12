import { useEffect, useState } from 'react'
import api, { getCurrentUser, logout as apiLogout, isAuthenticated } from './utils/api.js'
import AuthScreen from './components/AuthScreen.jsx'

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("employee") // 'employee', 'history', 'manager', 'store'
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

  // Check if user is already logged in on page load
  useEffect(() => {
    if (isAuthenticated()) {
      const savedUser = getCurrentUser();
      if (savedUser) {
        setUser(savedUser);
      }
    }
  }, []);

  // Fetch data based on view and user role
  const fetchData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const res = await api.get('/api/resources');
      // console.log("Full Response from Backend:", res);
      setResources(res.data || []);

      // Fetch pending requests for managers
      if (view === "manager" && (user.role === "manager")) {
        const pending = await api.get('/api/requests/pending');
        // console.log("Full Response from Backend:", res);
        setPendingRequests(pending.data || []);
      }

      // Fetch approved requests for store managers
      if (view === "store" && user.role === "store") {
        const approved = await api.get('/api/requests/approved');
        // console.log("Full Response from Backend:", res);
        setApprovedRequests(approved.data || []);
      }

      // Fetch user's own requests for history view
      if (view === "history") {
        const userEmail = user?.email
        const myReqs = await api.get(`/api/my-requests?email=${userEmail}`);
        console.log("Full Response from Backend:", myReqs);
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

  // Auto dismiss messages
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: "", type: "" });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [message])

  //handle logout
  const handleLogout = () => {
    apiLogout();
    setUser(null);
    setView("employee");
    setMessage({ text: "Logged out successfully", type: "success" });
  };

  //handle resource request submission
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
        employee_email: user.email //will be overridden by backend with authenticated user
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

  // Handle manager action (approve/reject)
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

  // Handle store manager fulfill action
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

  // Handle adding new resource
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

  // Check if user has access to a view
  const hasAccessToView = (viewName) => {
    if (!user) return false;
    
    switch (viewName) {
      case 'employee':
      case 'history':
        return true; // All users can access
      case 'manager':
        return user.role === 'manager' || user.role === 'store';
      case 'store':
        return user.role === 'store';
      default:
        return false;
    }
  }

  if (!user) {
    return <AuthScreen onLoginSuccess={setUser} setMessage={setMessage} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Navigation */}
      <nav className="bg-white border-b p-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-indigo-600">Store</h1>
          <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full">
            <span className="text-xs font-bold text-slate-500 uppercase">{user.role}</span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-600">{user.email}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-xl space-x-1">
            {['employee', 'history', 'manager', 'store'].map(v => (
              hasAccessToView(v) && (
                <button 
                  key={v} 
                  onClick={() => setView(v)} 
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
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
          
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-xl text-xs font-bold uppercase tracking-wider transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-8">
        {/* Message Toast */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl border ${
            message.type === 'success' 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : 'bg-red-50 text-red-700 border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="mb-6 p-4 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-2">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading...
          </div>
        )}

        {/* Employee View */}
        {view === "employee" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Available Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {resources.map(item => (
                <div key={item.id} className="bg-white p-6 rounded-3xl border shadow-sm">
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
              {resources.length === 0 && (
                <div className="col-span-3 text-center py-10 text-slate-400">
                  No resources available
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
                        <button 
                          onClick={() => handleManagerAction(r.id, 'approve')} 
                          disabled={loading}
                          className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-700 disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleManagerAction(r.id, 'reject')} 
                          disabled={loading}
                          className="bg-slate-200 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-300 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {pendingRequests.length === 0 && (
                <p className="p-10 text-center text-slate-400">No pending approvals.</p>
              )}
            </div>
          </div>
        )}

        {/* Store Manager View */}
        {view === "store" && hasAccessToView('store') && (
          <div>
            <div className="bg-white p-6 rounded-3xl border mb-8">
              <h2 className="text-lg font-bold mb-4">Add New Inventory</h2>
              <form onSubmit={handleAddNewResource} className="flex gap-4">
                <input 
                  className="flex-1 border p-3 rounded-xl" 
                  placeholder="Item Name" 
                  value={newResName} 
                  onChange={e => setNewResName(e.target.value)} 
                  required 
                  minLength={3}
                  disabled={loading}
                />
                <input 
                  className="w-24 border p-3 rounded-xl" 
                  type="number" 
                  min="1"
                  value={newResQty} 
                  onChange={e => setNewResQty(e.target.value)} 
                  required 
                  disabled={loading}
                />
                <button 
                  className="bg-black text-white px-6 rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50"
                  disabled={loading}
                >
                  Add Item
                </button>
              </form>
            </div>

            <div className="bg-white rounded-3xl border overflow-hidden">
              <h2 className="p-6 text-lg font-bold border-b">Approved Items to Issue</h2>
              <table className="w-full text-left">
                <tbody>
                  {approvedRequests.map(r => (
                    <tr key={r.id} className="border-b hover:bg-slate-50">
                      <td className="p-4">
                        <div>
                          <p className="font-bold">{r.resource_name}</p>
                          <p className="text-sm text-slate-500">for {r.employee_email}</p>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => handleStoreFulfill(r.id)} 
                          disabled={loading}
                          className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-700 disabled:opacity-50"
                        >
                          Issue Item
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {approvedRequests.length === 0 && (
                <p className="p-10 text-center text-slate-400">Nothing to issue yet.</p>
              )}
            </div>
          </div>
        )}

        {/* Request History View */}
        {view === "history" && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">My Request History</h2>
            <div className="space-y-4">
              {myRequests.map(r => (
                <div key={r.id} className="bg-white p-4 rounded-2xl border flex justify-between items-center hover:shadow-md transition">
                  <div>
                    <p className="font-bold">{r.resource_name}</p>
                    <p className="text-sm text-slate-500 mt-1">{r.reason}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(r.created_at).toLocaleDateString()}
                    </p>
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
              {myRequests.length === 0 && (
                <p className="text-center py-10 text-slate-400">No requests yet. Request a resource to get started!</p>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Request Modal */}
      {selectedResource && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleRequestSubmit} className="bg-white p-8 rounded-[2rem] max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Requesting {selectedResource.name}</h2>
            
            <textarea 
              className="w-full border p-4 rounded-2xl mb-2" 
              placeholder="Reason for request (minimum 10 characters)" 
              required 
              minLength={10}
              maxLength={500}
              rows={4}
              value={reason} 
              onChange={e => setReason(e.target.value)}
              disabled={loading}
            />
            <p className="text-xs text-slate-400 mb-4 ml-2">
              {reason.length}/500 characters
            </p>
            
            <div className="flex gap-4">
              <button 
                type="submit" 
                disabled={loading || reason.length < 10}
                className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setSelectedResource(null);
                  setReason("");
                }} 
                disabled={loading}
                className="flex-1 bg-slate-100 rounded-2xl font-bold hover:bg-slate-200 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default App
