import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { formatDateBR, formatDateTimeLocal } from '../utils/dateUtils';
import { API_URL } from '../config';

function RegistrarTrocaOleo({ veiculos, onSuccess }) {
  const { getAuthHeader } = useAuth();
  const [formData, setFormData] = useState({
    veiculoId: '',
    motoristaId: '',
    data: formatDateTimeLocal(),
    km: '',
    tipoOleo: '',
    quantidade: '',
    filtroOleo: false,
    filtroAr: false,
    filtroCombustivel: false,
    valorTotal: '',
    observacoes: ''
  });
  const [motoristas, setMotoristas] = useState([]);
  const [message, setMessage] = useState(null);
  const [trocasOleo, setTrocasOleo] = useState([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    carregarMotoristas();
    carregarTrocasOleo();
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
      const response = await fetch(`${API_URL}/api/motoristas?ativos=true`, { headers: getAuthHeader() });
      const data = await response.json();
      setMotoristas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao carregar motoristas:', error);
      setMotoristas([]);
    }
  };

  const carregarTrocasOleo = async () => {
    try {
      const response = await fetch(`${API_URL}/api/veiculos`);
      const veiculosAtualizados = await response.json();
      
      const todasTrocas = [];
      for (const veiculo of veiculosAtualizados) {
        if (veiculo.registros && veiculo.registros.trocasOleo) {
          veiculo.registros.trocasOleo.forEach((troca, index) => {
            todasTrocas.push({
              ...troca,
              veiculoId: veiculo.id,
              veiculoInfo: `${veiculo.marca} ${veiculo.modelo} - ${veiculo.placa}`,
              index
            });
          });
        }
      }
      todasTrocas.sort((a, b) => new Date(b.data) - new Date(a.data));
      setTrocasOleo(todasTrocas);
    } catch (error) {
      console.error('Erro ao carregar trocas de óleo:', error);
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
      const response = await fetch(`${API_URL}/api/veiculos/${formData.veiculoId}/troca-oleo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: formData.data,
          km: parseInt(formData.km),
          tipoOleo: formData.tipoOleo,
          quantidade: parseFloat(formData.quantidade),
          filtroOleo: formData.filtroOleo,
          filtroAr: formData.filtroAr,
          filtroCombustivel: formData.filtroCombustivel,
          valorTotal: parseFloat(formData.valorTotal),
          observacoes: formData.observacoes,
          motoristaId: formData.motoristaId
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: '✓ Troca de óleo registrada com sucesso!' });
        setFormData({
          veiculoId: formData.veiculoId,
          motoristaId: '',
          data: new Date().toISOString().split('T')[0],
          km: '',
          tipoOleo: '',
          quantidade: '',
          filtroOleo: false,
          filtroAr: false,
          filtroCombustivel: false,
          valorTotal: '',
          observacoes: ''
        });
        carregarTrocasOleo();
        setShowForm(false);
        onSuccess();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Erro ao registrar troca de óleo' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao conectar com o servidor' });
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const getMotoristaNome = (motoristaId) => {
    const motorista = motoristas.find(m => m.id === motoristaId);
    return motorista ? motorista.nome : 'Não informado';
  };

  const camposObrigatoriosPreenchidos = formData.veiculoId && formData.motoristaId && formData.data;

  const handleDelete = async (veiculoId, index, data) => {
    if (!window.confirm(`Tem certeza que deseja excluir a troca de óleo de ${data}?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/veiculos/${veiculoId}/troca-oleo/${index}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMessage({ type: 'success', text: '✓ Troca de óleo excluída com sucesso!' });
        carregarTrocasOleo();
        onSuccess();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Erro ao excluir troca de óleo' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao conectar com o servidor' });
    }
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>🛢️ Troca de Óleo</h2>
        <button 
          className="btn btn-success"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Ver Histórico' : '+ Nova Troca de Óleo'}
        </button>
      </div>
      
      {showForm && message && (
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

      {showForm ? (
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
                {v.marca} {v.modelo} - {v.placa}
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
              <option key={m.id} value={m.id}>{m.nome}</option>
            ))}
          </select>
        </div>

        <div className="form-row">
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

          <div className="form-group">
            <label>KM Atual *</label>
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
        </div>

        {!camposObrigatoriosPreenchidos && (
          <div className="alert alert-info" style={{ marginTop: '1rem', color: '#dc2626', fontWeight: '500' }}>
            INFORMAÇÃO Preencha o veículo, motorista, data e hora para continuar com os demais campos.
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label>Tipo de Óleo *</label>
            <input 
              type="text" 
              name="tipoOleo" 
              value={formData.tipoOleo} 
              onChange={handleChange}
              placeholder="Ex: 5W30 Sintético"
              required
              disabled={!camposObrigatoriosPreenchidos}
            />
          </div>

          <div className="form-group">
            <label>Quantidade (Litros) *</label>
            <input 
              type="number" 
              step="0.1"
              name="quantidade" 
              value={formData.quantidade} 
              onChange={handleChange}
              placeholder="Ex: 4.5"
              required
              disabled={!camposObrigatoriosPreenchidos}
            />
          </div>
        </div>

        <div className="form-group">
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Filtros Trocados</label>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                name="filtroOleo" 
                checked={formData.filtroOleo} 
                onChange={handleChange}
                style={{ marginRight: '0.5rem', cursor: 'pointer' }}
                disabled={!camposObrigatoriosPreenchidos}
              />
              Filtro de Óleo
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                name="filtroAr" 
                checked={formData.filtroAr} 
                onChange={handleChange}
                style={{ marginRight: '0.5rem', cursor: 'pointer' }}
                disabled={!camposObrigatoriosPreenchidos}
              />
              Filtro de Ar
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                name="filtroCombustivel" 
                checked={formData.filtroCombustivel} 
                onChange={handleChange}
                style={{ marginRight: '0.5rem', cursor: 'pointer' }}
                disabled={!camposObrigatoriosPreenchidos}
              />
              Filtro de Combustível
            </label>
          </div>
        </div>

        <div className="form-group">
          <label>Valor Total (R$) *</label>
          <input 
            type="number" 
            step="0.01"
            name="valorTotal" 
            value={formData.valorTotal} 
            onChange={handleChange}
            placeholder="Ex: 350.00"
            required
            disabled={!camposObrigatoriosPreenchidos}
          />
        </div>

        <div className="form-group">
          <label>Observações</label>
          <textarea 
            name="observacoes" 
            value={formData.observacoes} 
            onChange={handleChange}
            rows="3"
            placeholder="Observações adicionais sobre a revisão..."
            disabled={!camposObrigatoriosPreenchidos}
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={!camposObrigatoriosPreenchidos}>
          Registrar Troca de Óleo
        </button>
      </form>
      ) : (
        <div>
          <h3 style={{ marginBottom: '1rem' }}>Histórico de Trocas de Óleo</h3>
          {trocasOleo.length === 0 ? (
            <p style={{ color: '#718096', textAlign: 'center', padding: '2rem' }}>
              Nenhuma troca de óleo registrada. Clique em "Nova Troca de Óleo" para começar.
            </p>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {trocasOleo.map((troca, idx) => (
                <div key={idx} className="veiculo-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 0.5rem 0', color: '#2d3748' }}>
                        {troca.veiculoInfo}
                      </h4>
                      <p style={{ margin: '0.25rem 0', fontSize: '0.95rem' }}>
                        <strong>Data:</strong> {formatDateBR(troca.data)}
                      </p>
                      <p style={{ margin: '0.25rem 0', fontSize: '0.95rem' }}>
                        <strong>Motorista:</strong> {getMotoristaNome(troca.motoristaId)}
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <div>
                          <strong>KM:</strong> {troca.km.toLocaleString('pt-BR')}
                        </div>
                        <div>
                          <strong>Tipo de Óleo:</strong> {troca.tipoOleo}
                        </div>
                        <div>
                          <strong>Quantidade:</strong> {troca.quantidade}L
                        </div>
                        <div>
                          <strong>Valor:</strong> R$ {troca.valorTotal.toFixed(2)}
                        </div>
                      </div>
                      {(troca.filtroOleo || troca.filtroAr || troca.filtroCombustivel) && (
                        <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#f0f9ff', borderRadius: '4px', borderLeft: '3px solid #3b82f6' }}>
                          <strong>Filtros Trocados:</strong>{' '}
                          {[
                            troca.filtroOleo && 'Óleo',
                            troca.filtroAr && 'Ar',
                            troca.filtroCombustivel && 'Combustível'
                          ].filter(Boolean).join(', ')}
                        </div>
                      )}
                      {troca.observacoes && (
                        <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#f7fafc', borderRadius: '4px' }}>
                          <strong>Observações:</strong> {troca.observacoes}
                        </div>
                      )}
                    </div>
                    <button 
                      className="btn btn-danger"
                      onClick={() => handleDelete(troca.veiculoId, troca.index, formatDateBR(troca.data))}
                      style={{ marginLeft: '1rem' }}
                    >
                      🗑️ Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default RegistrarTrocaOleo;
