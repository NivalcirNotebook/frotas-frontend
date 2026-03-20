import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../config';

function UsuarioForm({ usuario, onClose }) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    nome: '',
    email: '',
    role: 'MOTORISTA'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { getAuthHeader } = useAuth();

  useEffect(() => {
    if (usuario) {
      setFormData({
        username: usuario.username,
        password: '',
        nome: usuario.nome,
        email: usuario.email || '',
        role: usuario.role
      });
    }
  }, [usuario]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!usuario && formData.password.length < 6) {
      setError('Senha deve ter no mínimo 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      const url = usuario 
        ? `${API_URL}/api/usuarios/${usuario.id}`
        : `${API_URL}/api/usuarios`;
      
      const method = usuario ? 'PUT' : 'POST';
      
      const body = usuario 
        ? { nome: formData.nome, email: formData.email, role: formData.role }
        : formData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (response.ok) {
        onClose(true);
      } else {
        setError(data.error || 'Erro ao salvar usuário');
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => onClose(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{usuario ? 'Editar Usuário' : 'Novo Usuário'}</h3>
          <button onClick={() => onClose(false)} className="modal-close">×</button>
        </div>

        <form onSubmit={handleSubmit} className="usuario-form">
          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <div className="form-group">
            <label>Username *</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={!!usuario}
              placeholder="Digite o username"
            />
            {usuario && (
              <small className="form-text">Username não pode ser alterado</small>
            )}
          </div>

          {!usuario && (
            <div className="form-group">
              <label>Senha *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                placeholder="Mínimo 6 caracteres"
              />
              <small className="form-text">Mínimo 6 caracteres</small>
            </div>
          )}

          <div className="form-group">
            <label>Nome Completo *</label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
              placeholder="Digite o nome completo"
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="email@exemplo.com"
            />
          </div>

          <div className="form-group">
            <label>Papel *</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="MOTORISTA">Motorista</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>

          <div className="modal-footer">
            <button 
              type="button" 
              onClick={() => onClose(false)} 
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UsuarioForm;
