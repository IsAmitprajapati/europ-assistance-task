import { useState } from 'react'
import { TextField, Button, Box, Typography, Alert, CircularProgress } from '@mui/material'
import AnimateButton from '../../component/AnimateButton'
import api from '../../utils/Axios';
import { endpoints } from '../../utils/endpoint';
import { useNavigate } from 'react-router-dom';
import { useProvider } from '../../context/Provider';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate()
    const { fetchCurrentUser } = useProvider()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await api.post(endpoints.login, {
                email,
                password
            });

            // Assume the response contains a token, handle login success here:
            // For example, save token to localStorage and redirect as needed
            if (response.data && response.data.token) {
                localStorage.setItem('token', response.data.token);
                // Redirect or reload, as needed in your app
                navigate('/dashboard')
                if(fetchCurrentUser){
                    fetchCurrentUser()
                }
            } else {
                setError('Invalid response from server');
            }

        } catch (error: any) {
            if (error.response && error.response.data && error.response.data.message) {
                setError(error.response.data.message);
            } else {
                setError('Login failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2,marginTop : 5 }}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
                label="Email"
                variant="outlined"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
            />
            <TextField
                label="Password"
                variant="outlined"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
            />
            <AnimateButton>
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading}
                    fullWidth
                    sx={{ mt: 1 }}
                >
                    {loading ? <CircularProgress size={24} /> : "Sign In"}
                </Button>
            </AnimateButton>
        </Box>
    );
}