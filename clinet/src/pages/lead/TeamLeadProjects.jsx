import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import '../../styles/lead-style/TeamLeadProjects.css';

const TeamLeadProjects = () => {
  const { token, user } = useAuth();
  const [projects, setProjects] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get('/projects', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProjects(res.data);
      } catch (err) {
        console.error('❌ Failed to load projects:', err?.response?.data || err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [token]);

  

 

  return (
    <div className="teamlead-projects-wrapper">
      <div className="teamlead-projects-container">
        <div className="header">
          <h1>📁 Your Projects</h1>
         
        </div>

        {loading ? (
          <p className="loading-msg">Loading projects...</p>
        ) : (
          <div className="project-list-box">
            <div className="project-card-grid">
              {projects.map((project) => (
                <div key={project._id} className="project-card">
                  <h2>{project.title}</h2>
                  <p className="description">{project.description}</p>
                  <p className="deadline">📅 {new Date(project.deadline).toLocaleDateString()}</p>
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
