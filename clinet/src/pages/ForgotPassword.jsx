import { useState } from 'react';
import api from '../services/api';
import '../styles/password/ForgotPassword.css'; // optional styling

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="forgot-password-wrapper">
      <div className="forgot-password-container">
        <h2 className='forgot-h2'> Forgot Password</h2>
        <form onSubmit={handleSubmit}>
          <input className='forgot-input'
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Send Reset Link</button>
        </form>
        {message && <p className="forgot-success-msg">{message}</p>}
        {error && <p className="error-msg">{error}</p>}
      </div>
    </div>
  );
};

export default ForgotPassword;
