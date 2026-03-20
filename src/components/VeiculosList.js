import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../config';

function VeiculosList({ veiculos, onRefresh }) {
  const { getAuthHeader } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editandoVeiculo, setEditandoVeiculo] = useState(null);
  const [formData, setFormData] = useState({
    marca: '',
    modelo: '',
    placa: '',
    ano: '',
    kmAtual: ''
  });
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = editandoVeiculo 
        ? `${API_URL}/api/veiculos/${editandoVeiculo.id}`
        : `${API_URL}/api/veiculos`;
      
      const method = editandoVeiculo ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({
          marca: formData.marca,
          modelo: formData.modelo,
          placa: formData.placa.toUpperCase(),
          ano: parseInt(formData.ano),
          kmAtual: parseInt(formData.kmAtual)
        }),
      });

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: editandoVeiculo ? '✓ Veículo atualizado com sucesso!' : '✓ Veículo cadastrado com sucesso!' 
        });
        setFormData({
          marca: '',
          modelo: '',
          placa: '',
          ano: '',
          kmAtual: ''
        });
        setShowForm(false);
        setEditandoVeiculo(null);
        onRefresh();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Erro ao salvar veículo' });
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

  const handleEditar = (veiculo) => {
    setEditandoVeiculo(veiculo);
    setFormData({
      marca: veiculo.marca,
      modelo: veiculo.modelo,
      placa: veiculo.placa,
      ano: veiculo.ano.toString(),
      kmAtual: veiculo.kmAtual.toString()
    });
    setShowForm(true);
  };

  const handleCancelar = () => {
    setShowForm(false);
    setEditandoVeiculo(null);
    setFormData({
      marca: '',
      modelo: '',
      placa: '',
      ano: '',
      kmAtual: ''
    });
  };

  const handleDelete = async (id, placa) => {
    console.log(`🗑️ Tentando excluir veículo ID: ${id}, Placa: ${placa}`);
    
    if (window.confirm(`Tem certeza que deseja excluir o veículo ${placa}? Esta ação não pode ser desfeita.`)) {
      console.log(`✅ Confirmação aceita, enviando requisição DELETE...`);
      try {
        const response = await fetch(`http://localhost:3001/api/veiculos/${id}`, {
          method: 'DELETE'
        });

        console.log(`📡 Resposta recebida: Status ${response.status}`);

        if (response.ok) {
          const data = await response.json();
          console.log(`✅ Sucesso:`, data);
          setMessage({ type: 'success', text: '✓ Veículo excluído com sucesso!' });
          onRefresh();
        } else {
          const error = await response.json();
          console.log(`❌ Erro:`, error);
          setMessage({ type: 'error', text: error.error || 'Erro ao excluir veículo' });
        }
      } catch (error) {
        console.log(`❌ Erro de conexão:`, error);
        setMessage({ type: 'error', text: 'Erro ao conectar com o servidor' });
      }
    } else {
      console.log(`❌ Exclusão cancelada pelo usuário`);
    }
  };

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>🚙 Veículos Cadastrados</h2>
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
            {showForm ? 'Cancelar' : '+ Novo Veículo'}
          </button>
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
              {editandoVeiculo ? '✏️ Editar Veículo' : '➕ Cadastrar Novo Veículo'}
            </h3>
            
            <div className="form-group">
              <label>Marca *</label>
              <input 
                type="text" 
                name="marca" 
                value={formData.marca} 
                onChange={handleChange}
                placeholder="Ex: Toyota"
                required
              />
            </div>

            <div className="form-group">
              <label>Modelo *</label>
              <input 
                type="text" 
                name="modelo" 
                value={formData.modelo} 
                onChange={handleChange}
                placeholder="Ex: Corolla"
                required
              />
            </div>

            <div className="form-group">
              <label>Placa *</label>
              <input 
                type="text" 
                name="placa" 
                value={formData.placa} 
                onChange={handleChange}
                placeholder="Ex: ABC1234"
                maxLength="7"
                required
              />
            </div>

            <div className="form-group">
              <label>Ano *</label>
              <input 
                type="number" 
                name="ano" 
                value={formData.ano} 
                onChange={handleChange}
                placeholder="Ex: 2020"
                min="1900"
                max={new Date().getFullYear() + 1}
                required
              />
            </div>

            <div className="form-group">
              <label>KM Atual *</label>
              <input 
                type="number" 
                name="kmAtual" 
                value={formData.kmAtual} 
                onChange={handleChange}
                placeholder="Ex: 50000"
                min="0"
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn btn-success">
                {editandoVeiculo ? 'Atualizar Veículo' : 'Cadastrar Veículo'}
              </button>
              {editandoVeiculo && (
                <button type="button" onClick={handleCancelar} className="btn btn-secondary">
                  Cancelar Edição
                </button>
              )}
            </div>
          </form>
        )}

        {veiculos.length === 0 ? (
          <p style={{ color: '#718096', textAlign: 'center', padding: '2rem' }}>
            Nenhum veículo cadastrado. Clique em "Novo Veículo" para começar.
          </p>
        ) : (
          <div>
            {veiculos.map(v => (
              <div key={v.id} className="veiculo-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <h3>{v.marca} {v.modelo}</h3>
                    <p>
                      <strong>Placa:</strong> {v.placa} | 
                      <strong> Ano:</strong> {v.ano} | 
                      <strong> KM:</strong> {v.kmAtual.toLocaleString('pt-BR')}
                    </p>
                    <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                      <strong>Abastecimentos:</strong> {v.registros.abastecimentos.length} | 
                      <strong> Manutenções:</strong> {v.registros.manutencoes.length} | 
                      <strong> Trocas de Pneus:</strong> {v.registros.trocaPneus.length}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => handleEditar(v)}
                    >
                      ✏️ Editar
                    </button>
                    <button 
                      className="btn btn-danger"
                      onClick={() => handleDelete(v.id, v.placa)}
                    >
                      🗑️ Excluir
                    </button>
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

export default VeiculosList;
