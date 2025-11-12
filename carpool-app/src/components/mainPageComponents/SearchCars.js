import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function SearchCars() {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            navigate('/login');
        }
    }, [navigate]);

    return (
        <div style={{
            minHeight: '60vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '12px',
            color: 'white',
            textAlign: 'center'
        }}>
            <h1 style={{
                fontSize: '2rem',
                fontWeight: 800,
                margin: 0,
                background: 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
            }}>Login successful</h1>
            <p style={{opacity: 0.9, margin: 0}}>Hello, welcome to SearchCars</p>
        </div>
    );
};

export default SearchCars;