import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { formatDateBR } from '../utils/dateUtils';
import { API_URL } from '../config';

function MotoristasList() {
  const { getAuthHeader } = useAuth();
  const [motoristas, setMotoristas] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editandoMotorista, setEditandoMotorista] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    cnh: '',
    telefone: '',
    email: ''
  });
  const [message, setMessage] = useState(null);
  const [mostrarInativos, setMostrarInativos] = useState(false);

  useEffect(() => {
    carregarMotoristas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mostrarInativos]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const carregarMotoristas = async () => {
    try {
      const url = mostrarInativos 
        ? `${API_URL}/api/motoristas` 
        : `${API_URL}/api/motoristas?ativos=true`;
      const response = await fetch(url, {
        headers: getAuthHeader()
      });
      const data = await response.json();
      setMotoristas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao carregar motoristas:', error);
      setMotoristas([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = editandoMotorista 
        ? `${API_URL}/api/motoristas/${editandoMotorista.id}`
        : `${API_URL}/api/motoristas`;
      
      const method = editandoMotorista ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: editandoMotorista ? '✓ Motorista atualizado com sucesso!' : '✓ Motorista cadastrado com sucesso!' 
        });
        setFormData({
          nome: '',
          cnh: '',
          telefone: '',
          email: ''
        });
        setShowForm(false);
        setEditandoMotorista(null);
        carregarMotoristas();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Erro ao salvar motorista' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao conectar com o servidor' });
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleEditar = (motorista) => {
    setEditandoMotorista(motorista);
    setFormData({
      nome: motorista.nome,
      cnh: motorista.cnh,
      telefone: motorista.telefone || '',
      email: motorista.email || ''
    });
    setShowForm(true);
  };

  const handleCancelar = () => {
    setShowForm(false);
    setEditandoMotorista(null);
    setFormData({
      nome: '',
      cnh: '',
      telefone: '',
      email: ''
    });
  };

  const desativarMotorista = async (id) => {
    if (!window.confirm('Deseja realmente desativar este motorista?')) return;

    try {
      const response = await fetch(`${API_URL}/api/motoristas/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });

      if (response.ok) {
        setMessage({ type: 'success', text: '✓ Motorista desativado com sucesso!' });
        carregarMotoristas();
      } else {
        setMessage({ type: 'error', text: 'Erro ao desativar motorista' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao conectar com o servidor' });
    }
  };

  const ativarMotorista = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/motoristas/${id}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ativo: true }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: '✓ Motorista reativado com sucesso!' });
        carregarMotoristas();
      } else {
        setMessage({ type: 'error', text: 'Erro ao reativar motorista' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao conectar com o servidor' });
    }
  };

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>👤 Motoristas Cadastrados</h2>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={mostrarInativos}
                onChange={(e) => setMostrarInativos(e.target.checked)}
              />
              <span style={{ fontSize: '0.9rem' }}>Mostrar inativos</span>
            </label>
            <button 
              className="btn btn-primary" 
              onClick={() => {
                if (showForm) {
                  handleCancelar();
                } else {
                  setShowForm(true);
                }
              }}
            >
              {showForm ? 'Cancelar' : '+ Novo Motorista'}
            </button>
          </div>
        </div>

        {message && (
          <div className={`alert alert-${message.type}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{message.text}</span>
            <button 
              onClick={() => setMessage(null)}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: 'inherit', 
                fontSize: '1.2rem', 
                cursor: 'pointer',
                padding: '0 0.5rem'
              }}
            >
              ×
            </button>
          </div>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', padding: '1rem', background: '#f7fafc', borderRadius: '8px' }}>
            <h3 style={{ marginBottom: '1rem' }}>
              {editandoMotorista ? '✏️ Editar Motorista' : '➕ Cadastrar Novo Motorista'}
            </h3>
            
            <div className="form-group">
              <label>Nome Completo *</label>
              <input 
                type="text" 
                name="nome" 
                value={formData.nome} 
                onChange={handleChange}
                placeholder="Ex: João da Silva"
                required
              />
            </div>

            <div className="form-group">
              <label>CNH (Número da Carteira) *</label>
              <input 
                type="text" 
                name="cnh" 
                value={formData.cnh} 
                onChange={handleChange}
                placeholder="Ex: 12345678900"
                maxLength="11"
                required
              />
            </div>

            <div className="form-group">
              <label>Telefone</label>
              <input 
                type="tel" 
                name="telefone" 
                value={formData.telefone} 
                onChange={handleChange}
                placeholder="Ex: (11) 98765-4321"
              />
            </div>

            <div className="form-group">
              <label>E-mail</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange}
                placeholder="Ex: joao@exemplo.com"
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn btn-success">
                {editandoMotorista ? 'Atualizar Motorista' : 'Cadastrar Motorista'}
              </button>
              {editandoMotorista && (
                <button type="button" onClick={handleCancelar} className="btn btn-secondary">
                  Cancelar Edição
                </button>
              )}
            </div>
          </form>
        )}

        {motoristas.length === 0 ? (
          <p style={{ color: '#718096', textAlign: 'center', padding: '2rem' }}>
            Nenhum motorista cadastrado. Clique em "Novo Motorista" para começar.
          </p>
        ) : (
          <div>
            <div style={{ marginBottom: '1rem', color: '#718096' }}>
              <strong>Total:</strong> {motoristas.length} motorista(s)
            </div>
            {motoristas.map(m => (
              <div 
                key={m.id} 
                className="veiculo-item"
                style={{ 
                  opacity: m.ativo ? 1 : 0.6,
                  borderLeftColor: m.ativo ? '#667eea' : '#cbd5e0'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {m.nome}
                      {!m.ativo && (
                        <span style={{ 
                          fontSize: '0.75rem', 
                          background: '#fed7d7', 
                          color: '#742a2a',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px'
                        }}>
                          INATIVO
                        </span>
                      )}
                    </h3>
                    <p>
                      <strong>CNH:</strong> {m.cnh}
                    </p>
                    {m.telefone && (
                      <p><strong>Telefone:</strong> {m.telefone}</p>
                    )}
                    {m.email && (
                      <p><strong>E-mail:</strong> {m.email}</p>
                    )}
                    <p style={{ fontSize: '0.85rem', color: '#a0aec0' }}>
                      Cadastrado em: {formatDateBR(m.dataCadastro)}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={() => handleEditar(m)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#a8dafc',
                        color: '#1e3a5f',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '600'
                      }}
                    >
                      ✏️ Editar
                    </button>
                    {m.ativo ? (
                      <button 
                        onClick={() => desativarMotorista(m.id)}
                        style={{
                          padding: '0.5rem 1rem',
                          background: '#fed7d7',
                          color: '#742a2a',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.875rem'
                        }}
                      >
                        Desativar
                      </button>
                    ) : (
                      <button 
                        onClick={() => ativarMotorista(m.id)}
                        style={{
                          padding: '0.5rem 1rem',
                          background: '#c6f6d5',
                          color: '#22543d',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.875rem'
                        }}
                      >
                        Reativar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MotoristasList;
