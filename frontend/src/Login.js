import React, { useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useHistory();

    const handleLogin = async () => {
        e.preventDefault();
        try {
            const reponse = await axios.post('http://localhost:5000/login', {
                username,
                password
            });
            if (Response.data.role === 'admin') {
                navigate('/admin');
            }else {
                navigate('/user');
            }
        }catch (error) {
                alert('Invalid login Credentials');
            }
    };

    return (
        <div>
            <h1>Login</h1>
            <form onSubmit={handleLogin}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default Login;