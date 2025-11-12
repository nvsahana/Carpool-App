import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './login.css'
import { signUp } from '../../Routes/api'
import { useAsync } from '../../hooks/useAsync'

function SignUp() {
    const [profile, setProfile] = useState(null)
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [phone, setPhone] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    // Company address
    const [officeName, setOfficeName] = useState('')
    const [companyStreet, setCompanyStreet] = useState('')
    const [companyCity, setCompanyCity] = useState('')
    const [companyZip, setCompanyZip] = useState('')

    // Home address
    const [homeStreet, setHomeStreet] = useState('')
    const [homeCity, setHomeCity] = useState('')
    const [homeZip, setHomeZip] = useState('')

    const [role, setRole] = useState('passenger') // 'driver' or 'passenger'

    // carpooler options (checkboxes) for drivers
    const carOptions = ['1', '2', '3', '4', '5']
    const [selectedCarpoolCounts, setSelectedCarpoolCounts] = useState([])

    const [hasLicense, setHasLicense] = useState(null) // true/false/null
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [submitSignup, isLoading, submitError] = useAsync(signUp)
    const [accountExists, setAccountExists] = useState(false)
    const navigate = useNavigate()

    const handleProfileChange = (e) => {
        const file = e.target.files && e.target.files[0]
        setProfile(file)
    }

    const toggleCarOption = (val) => {
        setSelectedCarpoolCounts((prev) => {
            if (prev.includes(val)) return prev.filter((p) => p !== val)
            return [...prev, val]
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess(false)
        
        // minimal validation
        if (!firstName.trim() || !lastName.trim() || !email.trim()) {
            setError('Please fill in first name, last name and email')
            return
        }
        
        if (!password || password.length < 8) {
            setError('Password must be at least 8 characters long')
            return
        }

        const formData = {
            profile, // File object (may be null)
            firstName,
            lastName,
            phone: phone || null,
            email,
            password,
            companyAddress: {
                officeName,
                street: companyStreet,
                city: companyCity,
                zipcode: companyZip,
            },
            homeAddress: {
                street: homeStreet || null,
                city: homeCity,
                zipcode: homeZip,
            },
            role,
            willingToTake: role === 'driver' ? selectedCarpoolCounts : [],
            hasDriversLicense: hasLicense,
        }

        try {
            // reset account exists flag
            setAccountExists(false)
            const response = await submitSignup(formData)
            setSuccess(true)
            
            // Store the JWT token if returned
            if (response?.access_token) {
                localStorage.setItem('access_token', response.access_token)
            }
            
            // Redirect to login after successful signup
            navigate('/login')
        } catch (err) {
            const msg = err?.message || 'Failed to create account. Please try again.'
            // detect duplicate-account case thrown by API client
            if (/already exists|account already exists|Account already exists/i.test(msg)) {
                setAccountExists(true)
                setError('Account already exists')
            } else {
                setError(msg)
            }
        }
    }

    return (
        <div className="login-page">
            <div className="card" role="region" aria-label="Sign up form">
                <h2 className="title">Create an account</h2>
                <p className="sub">Fill in your details to get started</p>

                <form onSubmit={handleSubmit} className="form" noValidate>

                    <label className="label">
                        <span className="label-text">Profile picture (optional)</span>
                        <input className="input" type="file" accept="image/*" onChange={handleProfileChange} />
                    </label>

                    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
                        <label className="label">
                            <span className="label-text">First name</span>
                            <input className="input" value={firstName} onChange={(e)=>setFirstName(e.target.value)} required />
                        </label>

                        <label className="label">
                            <span className="label-text">Last name</span>
                            <input className="input" value={lastName} onChange={(e)=>setLastName(e.target.value)} required />
                        </label>
                    </div>

                    <label className="label">
                        <span className="label-text">Phone number (optional)</span>
                        <input className="input" value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder="e.g. +1 555 5555" />
                    </label>

                    <label className="label">
                        <span className="label-text">Email address</span>
                        <input className="input" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
                    </label>

                    <label className="label">
                        <span className="label-text">Password</span>
                        <input 
                            className="input" 
                            type="password" 
                            value={password} 
                            onChange={(e)=>setPassword(e.target.value)} 
                            minLength={8}
                            required 
                            placeholder="Minimum 8 characters"
                        />
                    </label>

                    <fieldset style={{border:'none', padding:0, margin:0}}>
                        <legend style={{fontSize:13, color:'#42526e', marginBottom:8}}>Company address</legend>
                        <label className="label">
                            <span className="label-text">Office name</span>
                            <input className="input" value={officeName} onChange={(e)=>setOfficeName(e.target.value)} />
                        </label>
                        <label className="label">
                            <span className="label-text">Street address</span>
                            <input className="input" value={companyStreet} onChange={(e)=>setCompanyStreet(e.target.value)} />
                        </label>
                        <div style={{display:'grid', gridTemplateColumns:'1fr 120px', gap:12}}>
                            <label className="label">
                                <span className="label-text">City</span>
                                <input className="input" value={companyCity} onChange={(e)=>setCompanyCity(e.target.value)} />
                            </label>
                            <label className="label">
                                <span className="label-text">Zipcode</span>
                                <input className="input" value={companyZip} onChange={(e)=>setCompanyZip(e.target.value)} />
                            </label>
                        </div>
                    </fieldset>

                    <fieldset style={{border:'none', padding:0, marginTop:8}}>
                        <legend style={{fontSize:13, color:'#42526e', marginBottom:8}}>Home address</legend>
                        <label className="label">
                            <span className="label-text">Street address (optional)</span>
                            <input className="input" value={homeStreet} onChange={(e)=>setHomeStreet(e.target.value)} />
                        </label>
                        <div style={{display:'grid', gridTemplateColumns:'1fr 120px', gap:12}}>
                            <label className="label">
                                <span className="label-text">City</span>
                                <input className="input" value={homeCity} onChange={(e)=>setHomeCity(e.target.value)} />
                            </label>
                            <label className="label">
                                <span className="label-text">Zipcode</span>
                                <input className="input" value={homeZip} onChange={(e)=>setHomeZip(e.target.value)} />
                            </label>
                        </div>
                    </fieldset>

                    <fieldset style={{border:'none', padding:0}}>
                        <legend style={{fontSize:13, color:'#42526e', marginBottom:8}}>Are you a driver or passenger?</legend>
                        <label style={{display:'inline-flex', alignItems:'center', gap:8}}>
                            <input type="radio" name="role" value="driver" checked={role==='driver'} onChange={()=>setRole('driver')} />
                            Driver
                        </label>
                        <label style={{display:'inline-flex', alignItems:'center', gap:8, marginLeft:16}}>
                            <input type="radio" name="role" value="passenger" checked={role==='passenger'} onChange={()=>setRole('passenger')} />
                            Passenger
                        </label>
                    </fieldset>

                    {role === 'driver' && (
                        <fieldset style={{border:'none', padding:0}}>
                            <legend style={{fontSize:13, color:'#42526e', marginBottom:8}}>How many car poolers are you willing to have on your car? (select any)</legend>
                            <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
                                {carOptions.map((opt) => (
                                    <label key={opt} style={{display:'inline-flex', alignItems:'center', gap:6}}>
                                        <input type="checkbox" value={opt} checked={selectedCarpoolCounts.includes(opt)} onChange={()=>toggleCarOption(opt)} />
                                        {opt}
                                    </label>
                                ))}
                            </div>
                        </fieldset>
                    )}

                    <fieldset style={{border:'none', padding:0}}>
                        <legend style={{fontSize:13, color:'#42526e', marginBottom:8}}>Do you have a valid driver's license?</legend>
                        <label style={{display:'inline-flex', alignItems:'center', gap:8}}>
                            <input type="radio" name="license" value="yes" checked={hasLicense===true} onChange={()=>setHasLicense(true)} />
                            Yes
                        </label>
                        <label style={{display:'inline-flex', alignItems:'center', gap:8, marginLeft:12}}>
                            <input type="radio" name="license" value="no" checked={hasLicense===false} onChange={()=>setHasLicense(false)} />
                            No
                        </label>
                    </fieldset>

                    {error && <div className="error" role="alert">{error}</div>}
                    {accountExists && (
                        <div className="info" role="status" style={{marginTop:8}}>
                            Account already exists! <Link to="/login">Login Here</Link>
                        </div>
                    )}
                    {success && <div className="success" role="alert">Account created successfully!</div>}

                    <button className="submit" type="submit" disabled={isLoading}>
                        {isLoading ? 'Creating account...' : 'Sign up'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default SignUp
