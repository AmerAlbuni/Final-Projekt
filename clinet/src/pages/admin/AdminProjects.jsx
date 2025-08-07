import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Select from 'react-select';
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

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

  const openDeleteModal = (project) => {
    setProjectToDelete(project);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setProjectToDelete(null);
  };

  const confirmDelete = async () => {
    if (!projectToDelete) return;
    setError('');
    setMessage('');
    try {
      await api.delete(`/projects/${projectToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('🗑️ Project deleted successfully.');
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.message || '❌ Failed to delete project');
    } finally {
      closeDeleteModal();
    }
  };

  return (
    <div className="admin-projects-wrapper">
      <div className="admin-projects-container">
        <h1 className="project-h1"> Manage Projects</h1>

        <form className="create-form" onSubmit={handleCreate}>
          <h2>Create New Project</h2>
          {message && <p>{message}</p>}
          {error && <p>{error}</p>}

          <div className="input">
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
            <Select
              classNamePrefix="react-select"
              className="react-select"
              options={teams.map((team) => ({
                value: team._id,
                label: team.name,
              }))}
              value={
                teams.find((t) => t._id === teamId)
                  ? { value: teamId, label: teams.find((t) => t._id === teamId)?.name }
                  : null
              }
              onChange={(selected) => setTeamId(selected?.value)}
              placeholder="Select Team"
              required
            />
          </div>

          <button className='form-butten' type="submit" disabled={creating}>
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
                <p className="para">Description: {proj.description}</p>
                <p className="para">Deadline: {proj.deadline?.substring(0, 10) || '—'}</p>
                <p className="para">Team: {proj.team?.name || '—'}</p>
                <button onClick={() => openDeleteModal(proj)}>🗑️ Delete</button>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showDeleteModal && (
          <div className="modal-backdrop">
            <div className="modal">
              <h3>Delete project</h3>
              <p>Are you sure you want to delete the project <strong>{projectToDelete?.title}</strong>?</p>
              <div className="modal-actions">
                <button onClick={confirmDelete} className="delete-btn">Delete</button>
                <button onClick={closeDeleteModal} className="cancel-btn">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProjects;
