import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { formatDateBR } from '../utils/dateUtils';
import { API_URL } from '../config';

function RegistrarViagem({ veiculos, onSuccess }) {
  const { getAuthHeader } = useAuth();
  const [formData, setFormData] = useState({
    veiculoId: '',
    motoristaId: '',
    dataHoraSaida: '',
    dataHoraChegada: '',
    kmSaida: '',
    kmChegada: ''
  });
  const [motoristas, setMotoristas] = useState([]);
  const [viagens, setViagens] = useState([]);
  const [message, setMessage] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filtros, setFiltros] = useState({
    veiculoId: '',
    motoristaId: ''
  });

  useEffect(() => {
    carregarMotoristas();
    carregarViagens();
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
      
      if (!response.ok) throw new Error('Erro ao carregar');
      
      const data = await response.json();
      setMotoristas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao carregar motoristas:', error);
      setMotoristas([]);
    }
  };

  const carregarViagens = async () => {
    try {
      const response = await fetch(`${API_URL}/api/viagens`, {
        headers: getAuthHeader()
      });
      
      if (!response.ok) throw new Error('Erro ao carregar');
      
      const data = await response.json();
      setViagens(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao carregar viagens:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (parseFloat(formData.kmChegada) < parseFloat(formData.kmSaida)) {
      setMessage({ type: 'error', text: 'Quilometragem de chegada deve ser maior que a de saída!' });
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/viagens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: '✓ Viagem registrada com sucesso!' });
        setFormData({
          veiculoId: '',
          motoristaId: '',
          dataHoraSaida: '',
          dataHoraChegada: '',
          kmSaida: '',
          kmChegada: ''
        });
        setShowForm(false);
        carregarViagens();
        if (onSuccess) onSuccess();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Erro ao registrar viagem' });
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

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta viagem?')) {
      try {
        const response = await fetch(`${API_URL}/api/viagens/${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setMessage({ type: 'success', text: '✓ Viagem excluída com sucesso!' });
          carregarViagens();
        } else {
          const error = await response.json();
          setMessage({ type: 'error', text: error.error || 'Erro ao excluir viagem' });
        }
      } catch (error) {
        setMessage({ type: 'error', text: 'Erro ao conectar com o servidor' });
      }
    }
  };

  const getMotoristaNome = (id) => {
    const motorista = motoristas.find(m => m.id === id);
    return motorista ? motorista.nome : 'N/A';
  };

  const getVeiculoInfo = (id) => {
    const veiculo = veiculos.find(v => v.id === id);
    return veiculo ? `${veiculo.marca} ${veiculo.modelo} - ${veiculo.placa}` : 'N/A';
  };

  const calcularDuracao = (dataHoraSaida, dataHoraChegada) => {
    const saida = new Date(dataHoraSaida);
    const chegada = new Date(dataHoraChegada);
    
    const diffMs = chegada - saida;
    const diffMins = Math.floor(diffMs / 60000);
    
    const horas = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    
    return `${horas}h ${mins}min`;
  };

  const formatarDataHora = (dataHora) => {
    if (!dataHora) return 'N/A';
    const dt = new Date(dataHora);
    return dt.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const camposObrigatoriosPreenchidos = formData.veiculoId && formData.motoristaId && formData.dataHoraSaida;

  const handleFiltroChange = (e) => {
    setFiltros({
      ...filtros,
      [e.target.name]: e.target.value
    });
  };

  const limparFiltros = () => {
    setFiltros({
      veiculoId: '',
      motoristaId: ''
    });
  };

  const viagensFiltradas = viagens.filter(viagem => {
    if (filtros.veiculoId && viagem.veiculoId !== parseInt(filtros.veiculoId)) {
      return false;
    }
    if (filtros.motoristaId && viagem.motoristaId !== parseInt(filtros.motoristaId)) {
      return false;
    }
    return true;
  });

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2>🚗 Registro de Viagens</h2>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button 
              className="btn btn-primary" 
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? 'Cancelar' : '+ Nova Viagem'}
            </button>
          </div>
        </div>

        {!showForm && (
          <div style={{ background: '#f7fafc', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', color: '#2d3748', fontSize: '1.1rem' }}>🔍 Pesquisar Viagens</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Filtrar por Veículo</label>
                <select 
                  name="veiculoId" 
                  value={filtros.veiculoId} 
                  onChange={handleFiltroChange}
                >
                  <option value="">Todos os veículos</option>
                  {veiculos.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.marca} {v.modelo} - {v.placa}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Filtrar por Motorista</label>
                <select 
                  name="motoristaId" 
                  value={filtros.motoristaId} 
                  onChange={handleFiltroChange}
                >
                  <option value="">Todos os motoristas</option>
                  {motoristas.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {(filtros.veiculoId || filtros.motoristaId) && (
              <div style={{ marginTop: '1rem' }}>
                <button 
                  className="btn btn-secondary" 
                  onClick={limparFiltros}
                  style={{ backgroundColor: '#718096', color: 'white' }}
                >
                  ✕ Limpar Filtros
                </button>
                <span style={{ marginLeft: '1rem', color: '#718096' }}>
                  {viagensFiltradas.length} viagem{viagensFiltradas.length !== 1 ? 'ns' : ''} encontrada{viagensFiltradas.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        )}

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
            <h3 style={{ marginBottom: '1rem' }}>Registrar Nova Viagem</h3>
            
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
                  <option key={m.id} value={m.id}>
                    {m.nome} - CNH: {m.cnh}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Data e Hora de Saída *</label>
                <input 
                  type="datetime-local" 
                  name="dataHoraSaida" 
                  value={formData.dataHoraSaida} 
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Data e Hora de Chegada *</label>
                <input 
                  type="datetime-local" 
                  name="dataHoraChegada" 
                  value={formData.dataHoraChegada} 
                  onChange={handleChange}
                  required
                  disabled={!camposObrigatoriosPreenchidos}
                />
              </div>
            </div>

            {!camposObrigatoriosPreenchidos && (
              <div className="alert alert-info" style={{ marginTop: '1rem', color: '#dc2626', fontWeight: '500' }}>
                INFORMAÇÃO Preencha o veículo, motorista, data e hora de saída para continuar com os demais campos.
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label>KM de Saída *</label>
                <input 
                  type="number" 
                  name="kmSaida" 
                  value={formData.kmSaida} 
                  onChange={handleChange}
                  placeholder="Ex: 50000"
                  step="0.1"
                  min="0"
                  required
                  disabled={!camposObrigatoriosPreenchidos}
                />
              </div>

              <div className="form-group">
                <label>KM de Chegada *</label>
                <input 
                  type="number" 
                  name="kmChegada" 
                  value={formData.kmChegada} 
                  onChange={handleChange}
                  placeholder="Ex: 50150"
                  step="0.1"
                  min="0"
                  required
                  disabled={!camposObrigatoriosPreenchidos}
                />
              </div>
            </div>

            {formData.kmSaida && formData.kmChegada && parseFloat(formData.kmChegada) > parseFloat(formData.kmSaida) && (
              <div className="alert alert-success">
                <strong>KM Percorridos:</strong> {(parseFloat(formData.kmChegada) - parseFloat(formData.kmSaida)).toFixed(1)} km
              </div>
            )}

            <button type="submit" className="btn btn-success" disabled={!camposObrigatoriosPreenchidos}>
              Registrar Viagem
            </button>
          </form>
        )}

        {viagens.length === 0 ? (
          <p style={{ color: '#718096', textAlign: 'center', padding: '2rem' }}>
            Nenhuma viagem registrada. Clique em "Nova Viagem" para começar.
          </p>
        ) : (
          <div>
            <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>
              {filtros.veiculoId || filtros.motoristaId ? 'Resultados da Pesquisa' : 'Viagens Registradas'}
            </h3>
            {viagensFiltradas.length === 0 ? (
              <p style={{ color: '#718096', textAlign: 'center', padding: '2rem', background: '#f7fafc', borderRadius: '8px' }}>
                Nenhuma viagem encontrada com os filtros selecionados.
              </p>
            ) : (
              viagensFiltradas.sort((a, b) => {
                const dateA = new Date(a.dataHoraSaida || a.data);
                const dateB = new Date(b.dataHoraSaida || b.data);
                return dateB - dateA;
              }).map(viagem => (
              <div key={viagem.id} className="veiculo-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#2d3748' }}>
                      {getVeiculoInfo(viagem.veiculoId)}
                    </h4>
                    <p style={{ margin: '0.25rem 0', fontSize: '0.95rem' }}>
                      <strong>Motorista:</strong> {getMotoristaNome(viagem.motoristaId)}
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <div>
                        <strong>Saída:</strong> {formatarDataHora(viagem.dataHoraSaida)}
                      </div>
                      <div>
                        <strong>Chegada:</strong> {formatarDataHora(viagem.dataHoraChegada)}
                      </div>
                      <div>
                        <strong>Duração:</strong> {calcularDuracao(viagem.dataHoraSaida, viagem.dataHoraChegada)}
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <div>
                        <strong>KM Saída:</strong> {viagem.kmSaida.toLocaleString('pt-BR')}
                      </div>
                      <div>
                        <strong>KM Chegada:</strong> {viagem.kmChegada.toLocaleString('pt-BR')}
                      </div>
                      <div style={{ color: '#ff6b35', fontWeight: '600' }}>
                        <strong>KM Percorridos:</strong> {viagem.kmPercorridos.toFixed(1)} km
                      </div>
                    </div>
                  </div>
                  <button 
                    className="btn btn-danger"
                    onClick={() => handleDelete(viagem.id)}
                    style={{ marginLeft: '1rem' }}
                  >
                    🗑️ Excluir
                  </button>
                </div>
              </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default RegistrarViagem;
