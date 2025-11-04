import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import './login.css'

function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()
        // Basic validation
        if (!email.trim() || !password) {
            setError('Please enter both email and password')
            return
        }
        setError('')
        console.log('LOGIN Successful')
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

                    <button className="submit" type="submit">Sign in</button>
                </form>

                <div className="foot">Don't have an account? <Link to="/signup">Sign up</Link></div>
            </div>

            {/* styles are moved to login.css */}
        </div>
    )
}

export default Login