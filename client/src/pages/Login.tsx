import { useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { InteractionType } from '@azure/msal-browser';
import { useNavigate } from 'react-router-dom';
import logo from '../Logo/SLTMobitel_Logo.svg.png';
import { LogIn, User, Lock, AlertCircle, Mail, UserPlus } from 'lucide-react';

export function Login() {
  const { instance } = useMsal();
    // Azure AD login handler
    const handleAzureLogin = async () => {
      try {
        await instance.loginPopup({
          scopes: ["user.read"] // You can adjust scopes as needed
        });
        // On success, redirect to dashboard
        navigate('/dashboard');
      } catch (error) {
        setError('Azure login failed');
      }
    };
  const navigate = useNavigate();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userName', data.data.user.fullName);
        localStorage.setItem('authToken', data.data.token);
        localStorage.setItem('userRole', data.data.user.role);
        
        setTimeout(() => {
          setIsLoading(false);
          navigate('/dashboard');
        }, 800);
      } else {
        setIsLoading(false);
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setIsLoading(false);
      setError('Unable to connect to server');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    // Validate passwords match
    if (password !== confirmPassword) {
      setIsLoading(false);
      setError('Passwords do not match');
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setIsLoading(false);
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username, 
          password, 
          email, 
          fullName,
          role: 'admin' 
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Registration successful! You can now login.');
        setIsLoading(false);
        
        // Clear form and switch to login mode after 2 seconds
        setTimeout(() => {
          setIsRegisterMode(false);
          setUsername('');
          setPassword('');
          setEmail('');
          setFullName('');
          setConfirmPassword('');
          setSuccess('');
        }, 2000);
      } else {
        setIsLoading(false);
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setIsLoading(false);
      setError('Unable to connect to server');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <img src={logo} alt="MySLT Logo" className="mx-auto h-20 w-auto object-contain select-none mb-2" />
          <p className="text-slate-400">Admin Portal</p>
        </div>

        {/* Login Form */}
        <div className="bg-slate-800 rounded-xl p-8 shadow-2xl border border-slate-700">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              {isRegisterMode ? <UserPlus size={32} className="text-white" /> : <LogIn size={32} className="text-white" />}
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white text-center mb-6">
            {isRegisterMode ? 'Create Admin Account' : 'Sign In'}
          </h2>

          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500 rounded-lg flex items-center gap-3">
              <AlertCircle size={20} className="text-red-400" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-500/10 border border-green-500 rounded-lg flex items-center gap-3">
              <AlertCircle size={20} className="text-green-400" />
              <p className="text-green-400 text-sm">{success}</p>
            </div>
          )}

          <form onSubmit={isRegisterMode ? handleRegister : handleLogin} className="space-y-5">
            {/* Full Name Field (Register only) */}
            {isRegisterMode && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-11 pr-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            )}

            {/* Username Field */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full pl-11 pr-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Email Field (Register only) */}
            {isRegisterMode && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-11 pr-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            )}

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-11 pr-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Confirm Password Field (Register only) */}
            {isRegisterMode && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="w-full pl-11 pr-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center gap-2 disabled:bg-slate-600 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {isRegisterMode ? 'Creating account...' : 'Signing in...'}
                </>
              ) : (
                <>
                  {isRegisterMode ? <UserPlus size={20} /> : <LogIn size={20} />}
                  {isRegisterMode ? 'Create Account' : 'Sign In'}
                </>
              )}
            </button>

            {/* Azure AD Login Button (Login only) */}
            {!isRegisterMode && (
              <button
                type="button"
                onClick={handleAzureLogin}
                className="w-full py-3 bg-[#0078D4] text-white rounded-lg hover:bg-[#005A9E] transition-colors font-semibold flex items-center justify-center gap-2 mt-2"
              >
                {/*<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zm0 7.5L4.5 7.5 12 4l7.5 3.5L12 9.5zm0 2.5l10 5-10 5-10-5 10-5zm0 7.5l7.5-3.5L12 14l-7.5 3.5L12 19.5z" fill="#fff"/></svg>*/}
                Sign in with Azure
              </button>
            )}
          </form>

          {/* Toggle between Login and Register */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setError('');
                setSuccess('');
                setUsername('');
                setPassword('');
                setEmail('');
                setFullName('');
                setConfirmPassword('');
              }}
              className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
            >
              {isRegisterMode 
                ? 'Already have an account? Sign In' 
                : "Don't have an account? Register"}
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-sm mt-6">
          © 2025 MySLT Monitoring. All rights reserved.
        </p>
      </div>
    </div>
  );
}
