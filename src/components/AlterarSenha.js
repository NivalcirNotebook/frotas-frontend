import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../config';

function AlterarSenha({ usuario, onClose }) {
  const [formData, setFormData] = useState({
    novaSenha: '',
    confirmarSenha: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { getAuthHeader } = useAuth();

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

    if (formData.novaSenha.length < 6) {
      setError('Senha deve ter no mínimo 6 caracteres');
      setLoading(false);
      return;
    }

    if (formData.novaSenha !== formData.confirmarSenha) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/usuarios/${usuario.id}/senha`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({ novaSenha: formData.novaSenha })
      });

      const data = await response.json();

      if (response.ok) {
        onClose(true);
      } else {
        setError(data.error || 'Erro ao alterar senha');
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => onClose(false)}>
      <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🔑 Alterar Senha</h3>
          <button onClick={() => onClose(false)} className="modal-close">×</button>
        </div>

        <div className="modal-body">
          <p className="text-muted">
            Alterando senha de: <strong>{usuario?.nome}</strong>
          </p>

          <form onSubmit={handleSubmit} className="senha-form">
            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}

            <div className="form-group">
              <label>Nova Senha *</label>
              <input
                type="password"
                name="novaSenha"
                value={formData.novaSenha}
                onChange={handleChange}
                required
                minLength={6}
                placeholder="Mínimo 6 caracteres"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>Confirmar Senha *</label>
              <input
                type="password"
                name="confirmarSenha"
                value={formData.confirmarSenha}
                onChange={handleChange}
                required
                minLength={6}
                placeholder="Digite a senha novamente"
              />
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
                {loading ? 'Alterando...' : 'Alterar Senha'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AlterarSenha;
