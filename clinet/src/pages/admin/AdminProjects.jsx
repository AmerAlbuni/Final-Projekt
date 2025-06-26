import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import '../../styles/admin-style/AdminProjects.css';

const AdminProjects = () => {
  const { token } = useAuth();
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [teamId, setTeamId] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');



  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(res.data);
    } catch (err) {
      setError('❌ Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const res = await api.get('/teams', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeams(res.data);
    } catch (err) {
      setError('❌ Failed to load teams');
    }
  };

  useEffect(() => {
    if (token) {
      fetchProjects();
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

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    setMessage('');

    if (!teamId) {
      setError('Please select a team');
      setCreating(false);
      return;
    }

    try {
      await api.post(
        '/projects',
        { title, description, deadline, teamId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTitle('');
      setDescription('');
      setDeadline('');
      setTeamId('');
      setMessage('✅ Project created successfully');
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.message || '❌ Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    setError('');
    setMessage('');

    try {
      await api.delete(`/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('🗑️ Project deleted successfully.');
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.message || '❌ Failed to delete project');
    }
  };

  return (
    <div className="admin-projects-wrapper">
      <div className="admin-projects-container">
        <h1> Manage Projects</h1>

        <form className='create-form' onSubmit={handleCreate}>
          <h2>Create New Project</h2>
          {message && <p>{message}</p>}
          {error && <p>{error}</p>}

          <div className='input'>
            <input 
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoComplete="off"
            />
            <input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              autoComplete="off"
            />
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
            <select
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              required
            >
              <option value="">Select Team</option>
              {teams.map((team) => (
                <option key={team._id} value={team._id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" disabled={creating}>
            {creating ? 'Creating...' : 'Create'}
          </button>
        </form>

        {loading ? (
          <p>Loading projects...</p>
        ) : (
          <div className="project-grid">
            {projects.map((proj) => (
              <div className="project-card" key={proj._id}>
                <h3>{proj.title}</h3>
                <p className='para'>Description: {proj.description}</p>
                <p className='para'>Deadline:{proj.deadline?.substring(0, 10) || '—'}</p>
                <p className='para'>Team: {proj.team?.name || '—'}</p>
                <button onClick={() => handleDelete(proj._id)}>🗑️ Delete</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProjects;
