import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import '../../styles/admin-style/AdminTeams.css';

const AdminTeams = () => {
  const { token } = useAuth();
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: '', members: [], teamLead: '' });
  const [editedTeam, setEditedTeam] = useState({ name: '', members: [], teamLead: '' });
  const [editingTeamId, setEditingTeamId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) {
      fetchTeams();
      fetchUsers();
    }
  }, [token]);

  const fetchTeams = async () => {
    try {
      const res = await api.get('/teams', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeams(res.data);
    } catch {
      setError('❌ Failed to fetch teams');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch {
      setError('❌ Failed to fetch users');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleMemberSelect = (e) => {
    const selected = Array.from(e.target.selectedOptions, (opt) => opt.value);
    setForm({ ...form, members: selected });
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    const uniqueMembers = form.members.filter((id) => id !== form.teamLead);

    try {
      await api.post('/teams', {
        name: form.name,
        teamLead: form.teamLead || null,
        members: uniqueMembers,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setForm({ name: '', members: [], teamLead: '' });
      setMessage('✅ Team created successfully');
      fetchTeams();
    } catch (err) {
      setError(err.response?.data?.message || '❌ Failed to create team');
    }
  };

  const startEditing = (team) => {
    setEditingTeamId(team._id);
    setEditedTeam({
      name: team.name,
      members: team.members.map((m) => m._id),
      teamLead: team.teamLead?._id || '',
    });
  };

  const cancelEditing = () => {
    setEditingTeamId(null);
    setEditedTeam({ name: '', members: [], teamLead: '' });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedTeam({ ...editedTeam, [name]: value });
  };

  const handleEditMemberSelect = (e) => {
    const selected = Array.from(e.target.selectedOptions, (opt) => opt.value);
    setEditedTeam({ ...editedTeam, members: selected });
  };

  const saveTeamUpdate = async (id) => {
    const uniqueMembers = editedTeam.members.filter((id) => id !== editedTeam.teamLead);

    try {
      await api.put(`/teams/${id}`, {
        name: editedTeam.name,
        teamLead: editedTeam.teamLead || null,
        members: uniqueMembers,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('✅ Team updated successfully');
      fetchTeams();
    } catch (err) {
      setError(err.response?.data?.message || '❌ Failed to update team');
    } finally {
      cancelEditing();
    }
  };

  const handleDeleteTeam = async (id) => {
    if (!window.confirm('Are you sure you want to delete this team?')) return;

    try {
      await api.delete(`/teams/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('🗑️ Team deleted successfully.');
      setTeams((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || '❌ Failed to delete team');
    }
  };

  return (
    <div className="admin-teams-wrapper">
      <div className="admin-teams-container">
        <h1 className='team-h1'> Manage Teams</h1>

        <form onSubmit={handleCreateTeam} className="admin-teams-form">
          <h2 className='team-h2'>Create New Team</h2>
          {message && <p className="success-msg">{message}</p>}
          {error && <p className="error-msg">{error}</p>}

          <div className="scrollable-select-wrapper">
            <select name="teamLead" value={form.teamLead} onChange={handleChange} className="scrollable-select">
              <option value="">Select Team Lead</option>
              {users.filter((u) => u.role === 'TeamLead').map((u) => (
                <option key={u._id} value={u._id}>{u.name}</option>
              ))}
            </select>
          </div>

          <input className='input' name="name" value={form.name} onChange={handleChange} required placeholder="Team Name" />

          <select className='member' multiple value={form.members} onChange={handleMemberSelect}>
            {users
              .filter((u) => u.role === 'Member' && u._id !== form.teamLead)
              .map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.role})
                </option>
              ))}
          </select>

          <button type="submit"> Create Team</button>
        </form>

        {loading ? (
          <p>Loading teams...</p>
        ) : (
          <div className="team-card-grid">
            {teams.map((team) => (
              <div key={team._id} className="team-card">
                {editingTeamId === team._id ? (
                  <>
                    <div className="scrollable-select-wrapper">
                      <select name="teamLead" value={editedTeam.teamLead} onChange={handleEditChange} className="scrollable-select">
                        <option value="">Select Team Lead</option>
                        {users.filter((u) => u.role === 'TeamLead').map((u) => (
                          <option key={u._id} value={u._id}>{u.name}</option>
                        ))}
                      </select>
                    </div>

                    <input name="name" value={editedTeam.name} onChange={handleEditChange} />

                    <select multiple value={editedTeam.members} onChange={handleEditMemberSelect}>
                      {users
                        .filter((u) => u.role === 'Member' && u._id !== editedTeam.teamLead)
                        .map((u) => (
                          <option key={u._id} value={u._id}>
                            {u.name} ({u.role})
                          </option>
                        ))}
                    </select>

                    <div className="action-buttons">
                      <button onClick={() => saveTeamUpdate(team._id)}>Save</button>
                      <button onClick={cancelEditing}>Cancel</button>
                    </div>
                  </>
                ) : (
                  <>
                    <h3>{team.name}</h3>
                    <p><strong>Lead:</strong> {team.teamLead?.name || '—'}</p>
                    <p><strong>Members:</strong> {team.members.filter((m) => m._id !== team.teamLead?._id).map((m) => m.name).join(', ') || '—'}</p>
                    <div className="action-buttons">
                      <button onClick={() => startEditing(team)}>Edit</button>
                      <button onClick={() => handleDeleteTeam(team._id)}>Delete</button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTeams;
