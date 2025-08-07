import { useEffect, useState } from 'react';
import Select from 'react-select';
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState(null);

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

  const openDeleteModal = (team) => {
    setTeamToDelete(team);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setTeamToDelete(null);
  };

  const handleDeleteTeam = async (id) => {
    try {
      await api.delete(`/teams/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('🗑️ Team deleted successfully.');
      setTeams((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || '❌ Failed to delete team');
    } finally {
      closeDeleteModal();
    }
  };

  const teamLeadOptions = users.filter(u => u.role === 'TeamLead').map(u => ({
    value: u._id,
    label: u.name
  }));

  const memberOptions = users.filter(u => u.role === 'Member').map(u => ({
    value: u._id,
    label: `${u.name} (${u.role})`
  }));

  return (
    <div className="admin-teams-wrapper">
      <div className="admin-teams-container">
        <h1 className='team-h1'> Manage Teams</h1>

        <form onSubmit={handleCreateTeam} className="admin-teams-form">
          <h2 className='team-h2'>Create New Team</h2>
          {message && <p className="success-msg">{message}</p>}
          {error && <p className="error-msg">{error}</p>}

          <Select
            placeholder="Select Team Lead"
            options={teamLeadOptions}
            value={teamLeadOptions.find(opt => opt.value === form.teamLead)}
            onChange={(selected) => setForm({ ...form, teamLead: selected?.value || '' })}
            className="react-select"
            classNamePrefix="react-select"
          />

          <input
            className='input'
            name="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            placeholder="Team Name"
          />

          <Select
            isMulti
            placeholder="Select Members"
            options={memberOptions.filter(opt => opt.value !== form.teamLead)}
            value={memberOptions.filter(opt => form.members.includes(opt.value))}
            onChange={(selected) => setForm({ ...form, members: selected.map(opt => opt.value) })}
            className="react-select"
            classNamePrefix="react-select"
          />

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
                    <Select
                      placeholder="Select Team Lead"
                      options={teamLeadOptions}
                      value={teamLeadOptions.find(opt => opt.value === editedTeam.teamLead)}
                      onChange={(selected) => setEditedTeam({ ...editedTeam, teamLead: selected?.value || '' })}
                      className="react-select"
                      classNamePrefix="react-select"
                    />

                    <input
                      name="name"
                      value={editedTeam.name}
                      onChange={(e) => setEditedTeam({ ...editedTeam, name: e.target.value })}
                    />

                    <Select
                      isMulti
                      placeholder="Select Members"
                      options={memberOptions.filter(opt => opt.value !== editedTeam.teamLead)}
                      value={memberOptions.filter(opt => editedTeam.members.includes(opt.value))}
                      onChange={(selected) => setEditedTeam({ ...editedTeam, members: selected.map(opt => opt.value) })}
                      className="react-select"
                      classNamePrefix="react-select"
                    />

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
                      <button onClick={() => openDeleteModal(team)}>Delete</button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
        {/* Modal */}
        {showDeleteModal && (
          <div className="modal-backdrop">
            <div className="modal">
              <h3>Delete Team</h3>
              <p>Are you sure you want to delete the team <strong>{teamToDelete?.name}</strong>?</p>
              <div className="modal-actions">
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteTeam(teamToDelete._id)}
                >
                  Delete
                </button>
                <button className="cancel-btn" onClick={closeDeleteModal}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTeams;
