import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { formatDateBR, formatDateTimeLocal } from '../utils/dateUtils';
import { API_URL } from '../config';

function RegistrarManutencao({ veiculos, onSuccess }) {
  const { getAuthHeader } = useAuth();
  const [formData, setFormData] = useState({
    veiculoId: '',
    motoristaId: '',
    data: formatDateTimeLocal(),
    km: '',
    tipo: 'Preventiva',
    descricao: '',
    valorTotal: ''
  });
  const [motoristas, setMotoristas] = useState([]);
  const [message, setMessage] = useState(null);
  const [manutencoes, setManutencoes] = useState([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    carregarMotoristas();
    carregarManutencoes();
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

  const carregarManutencoes = async () => {
    try {
      const response = await fetch(`${API_URL}/api/veiculos`);
      const veiculosAtualizados = await response.json();
      
      const todasManutencoes = [];
      for (const veiculo of veiculosAtualizados) {
        if (veiculo.registros && veiculo.registros.manutencoes) {
          veiculo.registros.manutencoes.forEach((man, index) => {
            todasManutencoes.push({
              ...man,
              veiculoId: veiculo.id,
              veiculoInfo: `${veiculo.marca} ${veiculo.modelo} - ${veiculo.placa}`,
              index
            });
          });
        }
      }
      todasManutencoes.sort((a, b) => new Date(b.data) - new Date(a.data));
      setManutencoes(todasManutencoes);
    } catch (error) {
      console.error('Erro ao carregar manutenções:', error);
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
      const response = await fetch(`${API_URL}/api/veiculos/${formData.veiculoId}/manutencao`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: formData.data,
          km: parseInt(formData.km),
          tipo: formData.tipo,
          descricao: formData.descricao,
          valorTotal: parseFloat(formData.valorTotal),
          motoristaId: formData.motoristaId
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: '✓ Manutenção registrada com sucesso!' });
        setFormData({
          veiculoId: formData.veiculoId,
          motoristaId: '',
          data: new Date().toISOString().split('T')[0],
          km: '',
          tipo: 'Preventiva',
          descricao: '',
          valorTotal: ''
        });
        carregarManutencoes();
        setShowForm(false);
        onSuccess();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Erro ao registrar manutenção' });
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

  const getMotoristaNome = (motoristaId) => {
    const motorista = motoristas.find(m => m.id === motoristaId);
    return motorista ? motorista.nome : 'Não informado';
  };

  const camposObrigatoriosPreenchidos = formData.veiculoId && formData.motoristaId && formData.data;

  const handleDelete = async (veiculoId, index, data) => {
    if (!window.confirm(`Tem certeza que deseja excluir a manutenção de ${data}?`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/veiculos/${veiculoId}/manutencao/${index}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMessage({ type: 'success', text: '✓ Manutenção excluída com sucesso!' });
        carregarManutencoes();
        onSuccess();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Erro ao excluir manutenção' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao conectar com o servidor' });
    }
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>🔧 Manutenções</h2>
        <button 
          className="btn btn-success"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Ver Histórico' : '+ Nova Manutenção'}
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
          <label>Tipo de Manutenção *</label>
          <select 
            name="tipo" 
            value={formData.tipo} 
            onChange={handleChange}
            required
            disabled={!camposObrigatoriosPreenchidos}
          >
            <option value="Preventiva">Preventiva</option>
            <option value="Corretiva">Corretiva</option>
            <option value="Revisão">Revisão</option>
            <option value="Troca de Óleo">Troca de Óleo</option>
            <option value="Outros">Outros</option>
          </select>
        </div>

        <div className="form-group">
          <label>Descrição *</label>
          <textarea 
            name="descricao" 
            value={formData.descricao} 
            onChange={handleChange}
            placeholder="Descreva o serviço realizado"
            rows="3"
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
            placeholder="Ex: 350.00"
            required
            disabled={!camposObrigatoriosPreenchidos}
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={!camposObrigatoriosPreenchidos}>
          Registrar Manutenção
        </button>
      </form>
      ) : (
        <div>
          <h3 style={{ marginBottom: '1rem' }}>Histórico de Manutenções</h3>
          {manutencoes.length === 0 ? (
            <p style={{ color: '#718096', textAlign: 'center', padding: '2rem' }}>
              Nenhuma manutenção registrada. Clique em "Nova Manutenção" para começar.
            </p>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {manutencoes.map((man, idx) => (
                <div key={idx} className="veiculo-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 0.5rem 0', color: '#2d3748' }}>
                        {man.veiculoInfo}
                      </h4>
                      <p style={{ margin: '0.25rem 0', fontSize: '0.95rem' }}>
                        <strong>Data:</strong> {formatDateBR(man.data)}
                      </p>
                      <p style={{ margin: '0.25rem 0', fontSize: '0.95rem' }}>
                        <strong>Motorista:</strong> {getMotoristaNome(man.motoristaId)}
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <div>
                          <strong>KM:</strong> {man.km.toLocaleString('pt-BR')}
                        </div>
                        <div>
                          <strong>Tipo:</strong> {man.tipo}
                        </div>
                        <div>
                          <strong>Valor:</strong> R$ {man.valorTotal.toFixed(2)}
                        </div>
                      </div>
                      <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#f7fafc', borderRadius: '4px' }}>
                        <strong>Descrição:</strong> {man.descricao}
                      </div>
                    </div>
                    <button 
                      className="btn btn-danger"
                      onClick={() => handleDelete(man.veiculoId, man.index, formatDateBR(man.data))}
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

export default RegistrarManutencao;
