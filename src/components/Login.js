import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../config';

function Login() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage({ type: 'success', text: data.message });
        setTimeout(() => {
          login(data.token, data.user);
        }, 500);
      } else {
        setMessage({ type: 'error', text: data.message || 'Erro ao fazer login' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao conectar com o servidor' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>🚗 Sistema de Gestão de Frotas</h1>
          <h2>Casa Linda</h2>
          <p>Faça login para acessar o sistema</p>
        </div>

        {message && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Usuário</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Digite seu usuário"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Senha</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Digite sua senha"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="login-footer">
          <p>© 2026 Casa Linda - Gestão de Frotas</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
