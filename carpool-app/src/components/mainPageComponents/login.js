import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './login.css'
import { login } from '../../Routes/api'
import { useAsync } from '../../hooks/useAsync'

function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [submitLogin, isLoading, submitError] = useAsync(login)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess(false)
        
        // Basic validation
        if (!email.trim() || !password) {
            setError('Please enter both email and password')
            return
        }

        try {
            const response = await submitLogin(email, password)
            
            // Store the JWT token
            if (response?.access_token) {
                localStorage.setItem('access_token', response.access_token)
                setSuccess(true)
                
                // Navigate to SearchCars page after successful login
                setTimeout(() => {
                    navigate('/searchCars')
                }, 600)
            } else {
                setError('Login successful but no token received')
            }
        } catch (err) {
            setError(err?.message || 'Login failed. Please check your credentials.')
        }
    }

    return (
        <div className="login-page">
            <div className="card" role="region" aria-label="Login form">
                <h2 className="title">Welcome back</h2>
                <p className="sub">Sign in to continue to Carpool App</p>

                <form onSubmit={handleSubmit} className="form" noValidate>
                    <label className="label">
                        <span className="label-text">Email</span>
                        <input
                            className="input"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@company.com"
                            required
                            aria-required="true"
                        />
                    </label>

                    <label className="label">
                        <span className="label-text">Password</span>
                        <div className="password-row">
                            <input
                                className="input"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                                aria-required="true"
                            />
                            <button
                                type="button"
                                className="toggle"
                                onClick={() => setShowPassword((s) => !s)}
                                aria-pressed={showPassword}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? 'Hide' : 'Show'}
                            </button>
                        </div>
                    </label>

                    {error && <div className="error" role="alert">{error}</div>}
                    {success && <div className="success" role="alert">Login successful! Redirecting...</div>}

                    <button className="submit" type="submit" disabled={isLoading}>
                        {isLoading ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>

                <div className="foot">Don't have an account? <Link to="/signup">Sign up</Link></div>
            </div>

            {/* styles are moved to login.css */}
        </div>
    )
}

export default Login