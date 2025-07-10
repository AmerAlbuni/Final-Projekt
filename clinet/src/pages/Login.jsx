import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Login.css';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data;

      login(token, user);

      switch (user.role) {
        case 'Admin':
          navigate('/admin');
          break;
        case 'TeamLead':
          navigate('/lead');
          break;
        case 'Member':
          navigate('/member');
          break;
        default:
          navigate('/');
      }
    } catch (err) {
      console.error('❌ Login failed:', err);
      const message = err?.response?.data?.message;
      if (message) {
        setError(message);
      } else {
        setError('Login failed. Please try again.');
      }
    }
  };

  return (
    <div className="card">
      <div className="card2">
        <form className="form" onSubmit={handleSubmit}>
          <p id="heading">Welcome back!</p>

          {error && <p className="error-message">{error}</p>}

          {/* Email Field */}
          <div className="field">
            <svg viewBox="0 0 16 16" className="input-icon">
              <path d="M13.106 7.222c0-2.967-2.249-5.032-5.482-5.032-3.35 0-5.646 2.318-5.646 5.702 0 3.493 2.235 5.708 5.762 5.708.862 0 1.689-.123 2.304-.335v-.862c-.43.199-1.354.328-2.29.328-2.926 0-4.813-1.88-4.813-4.798 0-2.844 1.921-4.881 4.594-4.881 2.735 0 4.608 1.688 4.608 4.156 0 1.682-.554 2.769-1.416 2.769-.492 0-.772-.28-.772-.76V5.206H8.923v.834h-.11c-.266-.595-.881-.964-1.6-.964-1.4 0-2.378 1.162-2.378 2.823 0 1.737.957 2.906 2.379 2.906.8 0 1.415-.39 1.709-1.087h.11c.081.67.703 1.148 1.503 1.148 1.572 0 2.57-1.415 2.57-3.643zm-7.177.704c0-1.197.54-1.907 1.456-1.907.93 0 1.524.738 1.524 1.907S8.308 9.84 7.371 9.84c-.895 0-1.442-.725-1.442-1.914z" />
            </svg>
            <input
              type="email"
              className="input-field"
              placeholder="Email address"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password Field */}
          <div className="field">
            <span className="input-icon" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 1l22 22" />
                  <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-5 0-9.27-3.11-11-7 1.21-2.61 3.36-4.75 5.94-5.94M9.53 9.53A3.5 3.5 0 0 0 12 15.5a3.5 3.5 0 0 0 2.47-5.97" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              className="input-field"
              placeholder="Password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Forgot Password Link */}
          <div>
            <Link to="/forgot-password" className="btn2">
              Forgot Password?
            </Link>
          </div>

          {/* Submit */}
          <div className="btn">
            <button type="submit" className="button1">
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
