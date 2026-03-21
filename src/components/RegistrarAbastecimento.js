import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { formatDateBR, formatDateTimeLocal } from '../utils/dateUtils';
import { API_URL } from '../config';

function RegistrarAbastecimento({ veiculos, onSuccess }) {
  const { getAuthHeader } = useAuth();
  const [formData, setFormData] = useState({
    veiculoId: '',
    motoristaId: '',
    data: formatDateTimeLocal(),
    km: '',
    litros: '',
    valorTotal: ''
  });
  const [motoristas, setMotoristas] = useState([]);
  const [abastecimentos, setAbastecimentos] = useState([]);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    carregarMotoristas();
    carregarAbastecimentos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      const response = await fetch(`${API_URL}/api/motoristas?ativos=true`, {
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
    
    if (!formData.veiculoId) {
      setMessage({ type: 'error', text: 'Selecione um veículo' });
      return;
    }

    if (!formData.motoristaId) {
      setMessage({ type: 'error', text: 'Selecione um motorista' });
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/veiculos/${formData.veiculoId}/abastecimento`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: formData.data,
          km: parseInt(formData.km),
          litros: parseFloat(formData.litros),
          valorTotal: parseFloat(formData.valorTotal),
          motoristaId: formData.motoristaId || null
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: '✓ Abastecimento registrado com sucesso!' });
        setFormData({
          veiculoId: formData.veiculoId,
          motoristaId: '',
          data: formatDateTimeLocal(),
          km: '',
          litros: '',
          valorTotal: ''
        });
        carregarAbastecimentos();
        onSuccess();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Erro ao registrar abastecimento' });
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

  const carregarAbastecimentos = async () => {
    try {
      // Buscar veículos atualizados do servidor
      const response = await fetch('http://localhost:3001/api/veiculos');
      const veiculosAtualizados = await response.json();
      
      const todosAbastecimentos = [];
      for (const veiculo of veiculosAtualizados) {
        if (veiculo.registros && veiculo.registros.abastecimentos) {
          veiculo.registros.abastecimentos.forEach((ab, index) => {
            todosAbastecimentos.push({
              ...ab,
              veiculoId: veiculo.id,
              veiculoInfo: `${veiculo.marca} ${veiculo.modelo} - ${veiculo.placa}`,
              index
            });
          });
        }
      }
      todosAbastecimentos.sort((a, b) => new Date(b.data) - new Date(a.data));
      setAbastecimentos(todosAbastecimentos);
    } catch (error) {
      console.error('Erro ao carregar abastecimentos:', error);
    }
  };

  const handleDelete = async (veiculoId, index, data) => {
    if (window.confirm(`Tem certeza que deseja excluir o abastecimento de ${data}?`)) {
      try {
        const response = await fetch(`http://localhost:3001/api/veiculos/${veiculoId}/abastecimento/${index}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setMessage({ type: 'success', text: '✓ Abastecimento excluído com sucesso!' });
          carregarAbastecimentos();
          if (onSuccess) onSuccess();
        } else {
          const error = await response.json();
          setMessage({ type: 'error', text: error.error || 'Erro ao excluir abastecimento' });
        }
      } catch (error) {
        setMessage({ type: 'error', text: 'Erro ao conectar com o servidor' });
      }
    }
  };

  const calcularValorPorLitro = () => {
    if (formData.litros && formData.valorTotal) {
      return (parseFloat(formData.valorTotal) / parseFloat(formData.litros)).toFixed(2);
    }
    return '0.00';
  };

  const getMotoristaNome = (id) => {
    const motorista = motoristas.find(m => m.id === id);
    return motorista ? motorista.nome : 'N/A';
  };

  const camposObrigatoriosPreenchidos = formData.veiculoId && formData.motoristaId && formData.data;

  return (
    <div className="card">
      <h2>⛽ Registrar Abastecimento</h2>
      
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

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Veículo *</label>
          <select 
            name="veiculoId" 
            value={formData.veiculoId} 
            onChange={handleChange}
            required
          >
            <option value="">Selecione um veículo</option>
            {veiculos.map(v => (
              <option key={v.id} value={v.id}>
                {v.placa} - {v.marca} {v.modelo}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Motorista *</label>
          <select 
            name="motoristaId" 
            value={formData.motoristaId} 
            onChange={handleChange}
            required
          >
            <option value="">Selecione um motorista</option>
            {motoristas.map(m => (
              <option key={m.id} value={m.id}>
                {m.nome} - CNH: {m.cnh}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Data e Hora *</label>
          <input 
            type="datetime-local" 
            name="data" 
            value={formData.data} 
            onChange={handleChange}
            required
          />
        </div>

        {!camposObrigatoriosPreenchidos && (
          <div className="alert alert-info" style={{ marginTop: '1rem', color: '#dc2626', fontWeight: '500' }}>
            INFORMAÇÃO Preencha o veículo, motorista, data e hora para continuar com os demais campos.
          </div>
        )}

        <div className="form-group">
          <label>Quilometragem (KM) *</label>
          <input 
            type="number" 
            name="km" 
            value={formData.km} 
            onChange={handleChange}
            placeholder="Ex: 45000"
            required
            disabled={!camposObrigatoriosPreenchidos}
          />
        </div>

        <div className="form-group">
          <label>Litros Abastecidos *</label>
          <input 
            type="number" 
            step="0.01"
            name="litros" 
            value={formData.litros} 
            onChange={handleChange}
            placeholder="Ex: 40.5"
            required
            disabled={!camposObrigatoriosPreenchidos}
          />
        </div>

        <div className="form-group">
          <label>Valor Total (R$) *</label>
          <input 
            type="number" 
            step="0.01"
            name="valorTotal" 
            value={formData.valorTotal} 
            onChange={handleChange}
            placeholder="Ex: 250.00"
            required
            disabled={!camposObrigatoriosPreenchidos}
          />
        </div>

        {formData.litros && formData.valorTotal && (
          <div className="alert alert-success">
            <strong>Valor por litro:</strong> R$ {calcularValorPorLitro()}
          </div>
        )}

        <button type="submit" className="btn btn-primary" disabled={!camposObrigatoriosPreenchidos}>
          Registrar Abastecimento
        </button>
      </form>

      {abastecimentos.length > 0 && (
        <div style={{ marginTop: '3rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Histórico de Abastecimentos</h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {abastecimentos.map((ab, idx) => (
              <div key={idx} className="veiculo-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#2d3748' }}>
                      {ab.veiculoInfo}
                    </h4>
                    <p style={{ margin: '0.25rem 0', fontSize: '0.95rem' }}>
                      <strong>Data:</strong> {formatDateBR(ab.data)}
                    </p>
                    <p style={{ margin: '0.25rem 0', fontSize: '0.95rem' }}>
                      <strong>Motorista:</strong> {getMotoristaNome(ab.motoristaId)}
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <div>
                        <strong>KM:</strong> {ab.km.toLocaleString('pt-BR')}
                      </div>
                      <div>
                        <strong>Litros:</strong> {ab.litros.toFixed(2)}
                      </div>
                      <div>
                        <strong>Valor Total:</strong> R$ {ab.valorTotal.toFixed(2)}
                      </div>
                      <div>
                        <strong>R$/Litro:</strong> R$ {ab.valorPorLitro.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <button 
                    className="btn btn-danger"
                    onClick={() => handleDelete(ab.veiculoId, ab.index, formatDateBR(ab.data))}
                    style={{ marginLeft: '1rem' }}
                  >
                    🗑️ Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default RegistrarAbastecimento;
