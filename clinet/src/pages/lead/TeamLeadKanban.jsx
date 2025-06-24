import { useEffect, useState } from 'react';
import { fetchTasksByProject, updateTaskStatus } from '../../services/taskService';
import api from '../../services/api';
import CreateTaskModal from '../../components/CreateTaskModal';
import CommentModal from '../../components/CommentModal';
import { useAuth } from '../../context/AuthContext';
import socket from '../../socket';
import '../../styles/lead-style/TeamLeadKanban.css';

const TeamLeadKanban = () => {
  const { token } = useAuth();
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState('');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [projectError, setProjectError] = useState('');

  const statuses = ['To Do', 'In Progress', 'Done'];

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get('/projects', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProjects(res.data);
        if (res.data.length > 0) {
          setProjectId(res.data[0]._id);
          setProjectError('');
        } else {
          setProjectError('⚠️ No projects found. Please create one first.');
        }
      } catch (err) {
        console.error('Failed to load projects', err);
        setProjectError('❌ Failed to fetch projects.');
      }
    };
    fetchProjects();
  }, [token]);

  useEffect(() => {
    if (!projectId) return;
    const fetchTasks = async () => {
      try {
        const data = await fetchTasksByProject(projectId, token);
        setTasks(data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load tasks', err);
      }
    };
    fetchTasks();
  }, [projectId, token]);

  useEffect(() => {
    if (!projectId) return;

    socket.emit('joinProject', projectId);

    socket.on('taskUpdated', updatedTask => {
      setTasks(prev => prev.map(task => task._id === updatedTask._id ? updatedTask : task));
    });

    socket.on('taskCreated', newTask => {
      setTasks(prev => [...prev, newTask]);
    });

    return () => {
      socket.emit('leaveProject', projectId);
      socket.off('taskUpdated');
      socket.off('taskCreated');
    };
  }, [projectId]);

  const refreshTasks = async () => {
    if (!projectId) return;
    const data = await fetchTasksByProject(projectId, token);
    setTasks(data);
  };

  const handleDrop = async (e, newStatus) => {
    const taskId = e.dataTransfer.getData('taskId');
    try {
      await updateTaskStatus(taskId, newStatus, token);
      setTasks(prev => prev.map(t => (t._id === taskId ? { ...t, status: newStatus } : t)));
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
  };

  const openModal = () => {
    if (!projectId) {
      alert('Please select a project first.');
      return;
    }
    setShowModal(true);
  };

  return (
    <div className="kanban-wrapper">
      <div className="kanban-container">
        <div className="kanban-header">
          <h2>🧠 Project Tasks (Kanban)</h2>
          <button onClick={openModal} className="btn-primary">+ New Task</button>
        </div>

        {projectError && <p className="error-msg">{projectError}</p>}

        <select
          className="project-select"
          value={projectId}
          onChange={e => setProjectId(e.target.value)}
        >
          <option value="">-- Select a Project --</option>
          {projects.map(project => (
            <option key={project._id} value={project._id}>{project.title}</option>
          ))}
        </select>

        {loading ? (
          <p>Loading tasks...</p>
        ) : (
          <div className="kanban-board">
            {statuses.map(status => (
              <div
                key={status}
                className="kanban-column"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.add('drag-over');
                }}
                onDragLeave={(e) => {
                  e.currentTarget.classList.remove('drag-over');
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('drag-over');
                  handleDrop(e, status);
                }}
              >
                <h3>{status}</h3>
                <div className="task-list">
                  {tasks
                    .filter(task => task.status === status)
                    .map(task => (
                      <div
                        key={task._id}
                        className="task-card"
                        draggable
                        onDragStart={e => e.dataTransfer.setData('taskId', task._id)}
                        onClick={() => handleTaskClick(task)}
                      >
                        <h4>{task.title}</h4>
                        <p>{task.assignee?.name || 'Unassigned'}</p>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && projectId && (
          <CreateTaskModal
            projectId={projectId}
            onClose={() => setShowModal(false)}
            onTaskCreated={refreshTasks}
          />
        )}

        {selectedTask && (
          <CommentModal
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
          />
        )}
      </div>
    </div>
  );
};

export default TeamLeadKanban;
