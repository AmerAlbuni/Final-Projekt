import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Select from 'react-select';
import PasswordInput from '../../components/PasswordInput.jsx';
import "../../styles/admin-style/AdminUsers.css";

const AdminUsers = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editedUser, setEditedUser] = useState({ role: '', team: '' });
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Member' });
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const res = await api.get('/teams/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeams(res.data);
    } catch (err) {
      console.error('Failed to fetch teams:', err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUsers();
      fetchTeams();
    }
  }, [token]);

  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => {
        setMessage('');
        setError('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, error]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setFormLoading(true);
    try {
      await api.post('/users', form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setForm({ name: '', email: '', password: '', role: 'Member' });
      setMessage('✅ User added successfully');
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding user');
    } finally {
      setFormLoading(false);
    }
  };

  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await api.delete(`/users/${userToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) => prev.filter((u) => u._id !== userToDelete._id));
      setMessage('🗑️ User deleted successfully.');
    } catch (err) {
      setError(err.response?.data?.message || '❌ Failed to delete user');
    } finally {
      closeDeleteModal();
    }
  };

  const startEditing = (user) => {
    setEditingUserId(user._id);
    setEditedUser({ role: user.role, team: user.team?._id || '' });
  };

  const cancelEditing = () => {
    setEditingUserId(null);
    setEditedUser({ role: '', team: '' });
  };

  const saveUserUpdate = async (id) => {
    try {
      await api.put(`/users/${id}`, editedUser, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('✅ User updated');
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user');
    } finally {
      cancelEditing();
    }
  };

  return (
    <div className="admin-users-wrapper">
      <div className="admin-users-container">
        <h1 className='user-h1'> Manage Users</h1>

        {/* ✅ Wrapped form inside form-container */}
        <div className="form-container">
          <form onSubmit={handleAddUser}>
            <div className='user-form'>
              <h2>Add New User</h2>
              {message && <p>{message}</p>}
              {error && <p>{error}</p>}

              <input
                className='admin-input'
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Name"
              />

              <input
                className='admin-input'
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                type="email"
                placeholder="Email"
              />

              <PasswordInput
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Password"
              />

              <Select
                classNamePrefix="react-select"
                options={[
                  { value: 'Admin', label: 'Admin' },
                  { value: 'TeamLead', label: 'TeamLead' },
                  { value: 'Member', label: 'Member' },
                ]}
                value={{ value: form.role, label: form.role }}
                onChange={(selected) => setForm({ ...form, role: selected.value })}
                placeholder="Select Role"
                menuPosition="fixed"
                menuPlacement="auto"
              />

              <button className='add-button' type="submit" disabled={formLoading}>
                {formLoading ? 'Creating...' : ' Add User'}
              </button>
            </div>
          </form>
        </div>

        {loading ? (
          <p>Loading users...</p>
        ) : (
          <div className="user-grid">
            {users.map((user) => (
              <div className="user-card" key={user._id}>
                <h3>{user.name}</h3>
                <p><strong>Email:</strong> {user.email}</p>
                <p>
                  <strong>Role:</strong>{' '}
                  {editingUserId === user._id ? (
                    <Select
                      classNamePrefix="react-select"
                      options={[
                        { value: 'Admin', label: 'Admin' },
                        { value: 'TeamLead', label: 'TeamLead' },
                        { value: 'Member', label: 'Member' },
                      ]}
                      value={{ value: editedUser.role, label: editedUser.role }}
                      onChange={(selected) =>
                        setEditedUser({ ...editedUser, role: selected.value })
                      }
                      menuPosition="fixed"
                      menuPlacement="auto"
                    />
                  ) : (
                    user.role
                  )}
                </p>
                <p>
                  <strong>Team:</strong>{' '}
                  {editingUserId === user._id ? (
                    <Select
                      classNamePrefix="react-select"
                      options={teams.map((team) => ({
                        value: team._id,
                        label: team.name,
                      }))}
                      value={teams.find((t) => t._id === editedUser.team) ? {
                        value: editedUser.team,
                        label: teams.find((t) => t._id === editedUser.team)?.name
                      } : null}
                      onChange={(selected) =>
                        setEditedUser({ ...editedUser, team: selected?.value || '' })
                      }
                      placeholder="Select Team"
                      menuPosition="fixed"
                      menuPlacement="auto"
                    />
                  ) : (
                    user.team?.name || '—'
                  )}
                </p>

                <div className="user-actions">
                  {editingUserId === user._id ? (
                    <>
                      <button onClick={() => saveUserUpdate(user._id)}>💾 Save</button>
                      <button onClick={cancelEditing}>✖ Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEditing(user)}>✏️ Edit</button>
                      <button onClick={() => openDeleteModal(user)}>🗑️ Delete</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {showDeleteModal && (
          <div className="modal-backdrop">
            <div className="modal">
              <h3>Delet User</h3>
              <p> Do you want to Delete <strong>{userToDelete?.name}</strong> as a User ? </p>
              <div className="modal-actions">
                <button onClick={confirmDelete} className="delete-btn">Delete </button>
                <button className="cancel-btn" onClick={closeDeleteModal}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
