import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import '../../styles/lead-style/TeamLeadProjects.css';

const TeamLeadProjects = () => {
  const { token } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get('/projects/team', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProjects(res.data);
        setError('');
      } catch (err) {
        const msg = err?.response?.data?.message || 'Failed to load projects.';
        setError(msg);
        setProjects([]);
        console.warn('⚠️ Projects fetch warning:', msg);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [token]);

  return (
    <div className="teamlead-projects-wrapper">
      <div className="teamlead-projects-container">
        <div className="t-header">
          <h1>Your Projects</h1>
        </div>

        {loading ? (
          <p className="loading-msg">Loading projects...</p>
        ) : error ? (
          <p className="info-msg">
            {error === 'You are not assigned to a team.'
              ? 'You are not assigned to a team.'
              : error}
          </p>
        ) : projects.length === 0 ? (
          <p className="info-msg">Your team has no projects yet.</p>
        ) : (
          <div className="project-list-box">
            <div className="project-card-grid">
              {projects.map((project) => (
                <div key={project._id} className="project-card">
                  <h2>{project.title}</h2>
                  <p className="description">{project.description}</p>
                  <p className="deadline">
                    📅 {new Date(project.deadline).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamLeadProjects;
