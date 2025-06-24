import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const statuses = ['To Do', 'In Progress', 'Done'];

const TeamLeadTaskBoard = () => {
  const { token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newTask, setNewTask] = useState({ title: '', description: '', status: 'To Do' });
  const [creating, setCreating] = useState(false);

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks/team', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(res.data);
    } catch {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchTasks();
  }, [token]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      await api.post('/tasks', newTask, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewTask({ title: '', description: '', status: 'To Do' });
      fetchTasks();
    } catch {
      setError('Failed to create task');
    } finally {
      setCreating(false);
    }
  };

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const newStatus = destination.droppableId;

    try {
      await api.put(`/tasks/${draggableId}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTasks();
    } catch {
      setError('Failed to update task status');
    }
  };

  const tasksByStatus = {};
  statuses.forEach((status) => {
    tasksByStatus[status] = tasks.filter((task) => task.status === status);
  });

  // Inline styles
  const styles = {
    wrapper: {
      minHeight: '100vh',
      padding: '3rem 1rem',
      background: 'linear-gradient(135deg, #0f172a, #1e40af, #9333ea, #ec4899)',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 15s ease infinite',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'start',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    container: {
      background: 'rgba(255, 255, 255, 0.75)',
      backdropFilter: 'blur(12px)',
      borderRadius: '1.5rem',
      padding: '2rem',
      width: '100%',
      maxWidth: '1000px',
      boxShadow: '0 15px 30px rgba(0, 0, 0, 0.25)',
    },
    heading: {
      fontSize: '2rem',
      color: '#1e293b',
      marginBottom: '1.5rem',
    },
    form: {
      marginBottom: '2rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
    },
    formTitle: {
      fontSize: '1.5rem',
      color: '#1e293b',
      marginBottom: '0.75rem',
    },
    input: {
      padding: '0.75rem 1rem',
      fontSize: '1rem',
      borderRadius: '0.5rem',
      border: '1px solid #cbd5e1',
      outline: 'none',
      resize: 'vertical',
    },
    button: {
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      padding: '0.75rem 1.5rem',
      fontSize: '1rem',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      marginTop: '1rem',
      transition: 'background-color 0.2s',
    },
    buttonDisabled: {
      backgroundColor: '#93c5fd',
      cursor: 'not-allowed',
    },
    error: {
      color: '#b91c1c',
      fontWeight: 'bold',
      marginBottom: '0.5rem',
    },
    kanbanBoard: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
    },
    kanbanColumn: {
      backgroundColor: '#f1f5f9',
      borderRadius: '1rem',
      flex: '1 1 300px',
      padding: '1rem',
      minHeight: '300px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      display: 'flex',
      flexDirection: 'column',
    },
    columnHeader: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '1rem',
      textAlign: 'center',
      borderBottom: '2px solid #3b82f6',
      paddingBottom: '0.5rem',
    },
    taskList: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
      flexGrow: 1,
      overflowY: 'auto',
    },
    taskCard: {
      backgroundColor: 'white',
      borderRadius: '0.75rem',
      padding: '1rem',
      marginBottom: '0.75rem',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      cursor: 'grab',
      userSelect: 'none',
    },
  };

  return (
    <div style={styles.wrapper}>
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      <div style={styles.container}>
        <h1 style={styles.heading}>📝 Team Lead Task Board</h1>

        <form onSubmit={handleCreateTask} style={styles.form}>
          <h2 style={styles.formTitle}>Create New Task</h2>
          {error && <p style={styles.error}>{error}</p>}
          <input
            type="text"
            placeholder="Task Title"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            required
            style={styles.input}
          />
          <textarea
            placeholder="Description"
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            style={{ ...styles.input, minHeight: '80px' }}
          />
          <button
            type="submit"
            disabled={creating}
            style={creating ? { ...styles.button, ...styles.buttonDisabled } : styles.button}
          >
            {creating ? 'Creating...' : 'Create Task'}
          </button>
        </form>

        {loading ? (
          <p style={{ color: '#475569' }}>Loading tasks...</p>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <div style={styles.kanbanBoard}>
              {statuses.map((status) => (
                <Droppable key={status} droppableId={status}>
                  {(provided) => (
                    <div
                      style={styles.kanbanColumn}
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      <h3 style={styles.columnHeader}>{status}</h3>
                      <ul style={styles.taskList}>
                        {tasksByStatus[status].map((task, index) => (
                          <Draggable key={task._id} draggableId={task._id} index={index}>
                            {(provided) => (
                              <li
                                style={styles.taskCard}
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <strong>{task.title}</strong>
                                <p>{task.description}</p>
                              </li>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </ul>
                    </div>
                  )}
                </Droppable>
              ))}
            </div>
          </DragDropContext>
        )}
      </div>
    </div>
  );
};

export default TeamLeadTaskBoard;
