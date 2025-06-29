import { useState } from 'react';
import '../styles/PasswordInput.css'; // Your custom styles for the password input

const PasswordInput = ({
  value,
  onChange,
  name,
  placeholder = "Password",
  wrapperClass = "password-input-wrapper",
  inputClass = "password-input"
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={wrapperClass}>
      <input
        className={inputClass}
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        name={name}
        placeholder={placeholder}
        required
      />
      <span
        className="password-eye-icon"
        onClick={() => setShowPassword(!showPassword)}
        aria-label="Toggle password visibility"
      >
        {showPassword ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 1l22 22" />
            <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-5 0-9.27-3.11-11-7 1.21-2.61 3.36-4.75 5.94-5.94M9.53 9.53A3.5 3.5 0 0 0 12 15.5a3.5 3.5 0 0 0 2.47-5.97" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </span>
    </div>
  );
};

export default PasswordInput;
