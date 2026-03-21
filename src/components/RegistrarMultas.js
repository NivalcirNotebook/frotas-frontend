import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { formatDateTimeLocal } from '../utils/dateUtils';
import { API_URL } from '../config';

function RegistrarMultas({ veiculos, onSuccess }) {
  const { getAuthHeader, isAdmin } = useAuth();
  const [formData, setFormData] = useState({
    veiculoId: '',
    motoristaId: '',
    dataInfracao: '',
    tipoMulta: '',
    descricao: '',
    valorMulta: '',
    pontosCNH: '0',
    numeroAuto: '',
    local: '',
    dataVencimento: '',
    status: 'PENDENTE',
    dataPagamento: '',
    valorPago: '',
    observacoes: ''
  });
  const [motoristas, setMotoristas] = useState([]);
  const [multas, setMultas] = useState([]);
  const [message, setMessage] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filtros, setFiltros] = useState({
    veiculoId: '',
    motoristaId: '',
    status: ''
  });
  const [sugestaoMotorista, setSugestaoMotorista] = useState(null);
  const [carregandoSugestao, setCarregandoSugestao] = useState(false);

  const tiposMulta = [
    'Excesso de velocidade',
    'Estacionamento irregular',
    'Avanço de sinal vermelho',
    'Uso de celular ao dirigir',
    'Falta de cinto de segurança',
    'Dirigir sem CNH',
    'Ultrapassagem indevida',
    'Outro'
  ];

  useEffect(() => {
    carregarMotoristas();
    carregarMultas();
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
      if (!response.ok) throw new Error('Erro ao carregar');
      const data = await response.json();
      setMotoristas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao carregar motoristas:', error);
      setMotoristas([]);
    }
  };

  const carregarMultas = async () => {
    try {
      const response = await fetch(`${API_URL}/api/multas`, {
        headers: getAuthHeader()
      });
      if (!response.ok) throw new Error('Erro ao carregar');
      const data = await response.json();
      setMultas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao carregar multas:', error);
    }
  };

  const sugerirMotorista = async () => {
    if (!formData.veiculoId || !formData.dataInfracao) {
      setMessage({ type: 'error', text: 'Selecione um veículo e a data da infração primeiro' });
      return;
    }

    setCarregandoSugestao(true);
    try {
      const response = await fetch(
        `${API_URL}/api/multas/sugerir-motorista/${formData.veiculoId}?dataInfracao=${formData.dataInfracao}`,
        { headers: getAuthHeader() }
      );
      const data = await response.json();
      
      if (data.success && data.motorista) {
        setSugestaoMotorista(data.motorista);
        setFormData({ ...formData, motoristaId: data.motoristaId.toString() });
        setMessage({ 
          type: 'success', 
          text: `Motorista sugerido: ${data.motorista.nome} (baseado em viagens recentes)` 
        });
      } else {
        setSugestaoMotorista(null);
        setMessage({ type: 'info', text: 'Nenhuma viagem encontrada próxima a esta data' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao buscar sugestão de motorista' });
    } finally {
      setCarregandoSugestao(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = editingId 
        ? `${API_URL}/api/multas/${editingId}`
        : `${API_URL}/api/multas`;
      
      const method = editingId ? 'PUT' : 'POST';

      const payload = {
        veiculoId: parseInt(formData.veiculoId),
        motoristaId: formData.motoristaId ? parseInt(formData.motoristaId) : null,
        dataInfracao: formData.dataInfracao,
        tipoMulta: formData.tipoMulta,
        descricao: formData.descricao,
        valorMulta: parseFloat(formData.valorMulta),
        pontosCNH: parseInt(formData.pontosCNH),
        numeroAuto: formData.numeroAuto,
        local: formData.local,
        dataVencimento: formData.dataVencimento,
        status: formData.status,
        observacoes: formData.observacoes
      };

      if (formData.status === 'PAGA' && formData.dataPagamento && formData.valorPago) {
        payload.dataPagamento = formData.dataPagamento;
        payload.valorPago = parseFloat(formData.valorPago);
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: editingId ? '✓ Multa atualizada com sucesso!' : '✓ Multa registrada com sucesso!' 
        });
        resetForm();
        carregarMultas();
        if (onSuccess) onSuccess();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Erro ao salvar multa' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao conectar com o servidor' });
    }
  };

  const resetForm = () => {
    setFormData({
      veiculoId: '',
      motoristaId: '',
      dataInfracao: '',
      tipoMulta: '',
      descricao: '',
      valorMulta: '',
      pontosCNH: '0',
      numeroAuto: '',
      local: '',
      dataVencimento: '',
      status: 'PENDENTE',
      dataPagamento: '',
      valorPago: '',
      observacoes: ''
    });
    setEditingId(null);
    setShowForm(false);
    setSugestaoMotorista(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    if (name === 'status' && value !== 'PAGA') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        dataPagamento: '',
        valorPago: ''
      }));
    }
  };

  const handleEdit = (multa) => {
    setFormData({
      veiculoId: multa.veiculoId.toString(),
      motoristaId: multa.motoristaId ? multa.motoristaId.toString() : '',
      dataInfracao: multa.dataInfracao,
      tipoMulta: multa.tipoMulta,
      descricao: multa.descricao,
      valorMulta: multa.valorMulta.toString(),
      pontosCNH: multa.pontosCNH.toString(),
      numeroAuto: multa.numeroAuto,
      local: multa.local,
      dataVencimento: multa.dataVencimento,
      status: multa.status,
      dataPagamento: multa.dataPagamento || '',
      valorPago: multa.valorPago ? multa.valorPago.toString() : '',
      observacoes: multa.observacoes || ''
    });
    setEditingId(multa.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta multa?')) {
      try {
        const response = await fetch(`${API_URL}/api/multas/${id}`, {
          method: 'DELETE',
          headers: getAuthHeader()
        });

        if (response.ok) {
          setMessage({ type: 'success', text: '✓ Multa excluída com sucesso!' });
          carregarMultas();
        } else {
          const error = await response.json();
          setMessage({ type: 'error', text: error.error || 'Erro ao excluir multa' });
        }
      } catch (error) {
        setMessage({ type: 'error', text: 'Erro ao conectar com o servidor' });
      }
    }
  };

  const handleMarcarComoPaga = async (multa) => {
    const dataPagamento = prompt('Data do pagamento (AAAA-MM-DD):', new Date().toISOString().split('T')[0]);
    if (!dataPagamento) return;

    const valorPago = prompt('Valor pago:', multa.valorMulta);
    if (!valorPago) return;

    try {
      const response = await fetch(`${API_URL}/api/multas/${multa.id}/pagar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({
          dataPagamento,
          valorPago: parseFloat(valorPago)
        })
      });

      if (response.ok) {
        setMessage({ type: 'success', text: '✓ Multa marcada como paga!' });
        carregarMultas();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Erro ao marcar como paga' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao conectar com o servidor' });
    }
  };

  const getMotoristaNome = (id) => {
    const motorista = motoristas.find(m => m.id === id);
    return motorista ? motorista.nome : 'Não atribuído';
  };

  const getVeiculoInfo = (id) => {
    const veiculo = veiculos.find(v => v.id === id);
    return veiculo ? `${veiculo.marca} ${veiculo.modelo} - ${veiculo.placa}` : 'N/A';
  };

  const formatarData = (data) => {
    if (!data) return 'N/A';
    const dt = new Date(data + 'T00:00:00');
    return dt.toLocaleDateString('pt-BR');
  };

  const formatarDataHora = (dataHora) => {
    if (!dataHora) return 'N/A';
    const dt = new Date(dataHora);
    return dt.toLocaleString('pt-BR');
  };

  const handleFiltroChange = (e) => {
    setFiltros({
      ...filtros,
      [e.target.name]: e.target.value
    });
  };

  const limparFiltros = () => {
    setFiltros({
      veiculoId: '',
      motoristaId: '',
      status: ''
    });
  };

  const multasFiltradas = multas.filter(multa => {
    if (filtros.veiculoId && multa.veiculoId !== parseInt(filtros.veiculoId)) {
      return false;
    }
    if (filtros.motoristaId && multa.motoristaId !== parseInt(filtros.motoristaId)) {
      return false;
    }
    if (filtros.status && multa.status !== filtros.status) {
      return false;
    }
    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDENTE': return '#dc2626';
      case 'PAGA': return '#16a34a';
      case 'EM_RECURSO': return '#eab308';
      case 'CANCELADA': return '#6b7280';
      default: return '#3b82f6';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'PENDENTE': return 'Pendente';
      case 'PAGA': return 'Paga';
      case 'EM_RECURSO': return 'Em Recurso';
      case 'CANCELADA': return 'Cancelada';
      default: return status;
    }
  };

  const totalizadores = {
    valorPendente: multasFiltradas.filter(m => m.status === 'PENDENTE').reduce((sum, m) => sum + m.valorMulta, 0),
    valorPago: multasFiltradas.filter(m => m.status === 'PAGA').reduce((sum, m) => sum + (m.valorPago || m.valorMulta), 0),
    totalPontos: multasFiltradas.reduce((sum, m) => sum + m.pontosCNH, 0),
    totalMultas: multasFiltradas.length
  };

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2>🚨 Registro de Multas</h2>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button 
              className="btn btn-primary" 
              onClick={() => {
                if (showForm) {
                  resetForm();
                } else {
                  setShowForm(true);
                }
              }}
            >
              {showForm ? 'Cancelar' : '+ Nova Multa'}
            </button>
          </div>
        </div>

        {!showForm && (
          <>
            <div style={{ background: '#f7fafc', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem', color: '#2d3748', fontSize: '1.1rem' }}>🔍 Filtrar Multas</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Filtrar por Veículo</label>
                  <select name="veiculoId" value={filtros.veiculoId} onChange={handleFiltroChange}>
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
                  <select name="motoristaId" value={filtros.motoristaId} onChange={handleFiltroChange}>
                    <option value="">Todos os motoristas</option>
                    {motoristas.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Filtrar por Status</label>
                  <select name="status" value={filtros.status} onChange={handleFiltroChange}>
                    <option value="">Todos os status</option>
                    <option value="PENDENTE">Pendente</option>
                    <option value="PAGA">Paga</option>
                    <option value="EM_RECURSO">Em Recurso</option>
                    <option value="CANCELADA">Cancelada</option>
                  </select>
                </div>
              </div>
              
              {(filtros.veiculoId || filtros.motoristaId || filtros.status) && (
                <div style={{ marginTop: '1rem' }}>
                  <button className="btn btn-secondary" onClick={limparFiltros} style={{ backgroundColor: '#718096', color: 'white' }}>
                    ✕ Limpar Filtros
                  </button>
                  <span style={{ marginLeft: '1rem', color: '#718096' }}>
                    {multasFiltradas.length} multa{multasFiltradas.length !== 1 ? 's' : ''} encontrada{multasFiltradas.length !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ background: '#fee2e2', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #dc2626' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#991b1b' }}>Valor Pendente</h4>
                <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#dc2626' }}>
                  R$ {totalizadores.valorPendente.toFixed(2)}
                </p>
              </div>
              <div style={{ background: '#d1fae5', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #16a34a' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#065f46' }}>Valor Pago</h4>
                <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#16a34a' }}>
                  R$ {totalizadores.valorPago.toFixed(2)}
                </p>
              </div>
              <div style={{ background: '#dbeafe', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#1e40af' }}>Total de Pontos</h4>
                <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>
                  {totalizadores.totalPontos} pts
                </p>
              </div>
              <div style={{ background: '#f3f4f6', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #6b7280' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#374151' }}>Total de Multas</h4>
                <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#6b7280' }}>
                  {totalizadores.totalMultas}
                </p>
              </div>
            </div>
          </>
        )}

        {message && (
          <div className={`alert alert-${message.type}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} style={{ background: 'none', border: 'none', color: 'inherit', fontSize: '1.2rem', cursor: 'pointer', padding: '0 0.5rem' }}>
              ×
            </button>
          </div>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', padding: '1.5rem', background: '#f7fafc', borderRadius: '8px' }}>
            <h3 style={{ marginBottom: '1rem' }}>{editingId ? 'Editar Multa' : 'Registrar Nova Multa'}</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>Veículo *</label>
                <select name="veiculoId" value={formData.veiculoId} onChange={handleChange} required>
                  <option value="">Selecione um veículo</option>
                  {veiculos.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.marca} {v.modelo} - {v.placa}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Data da Infração *</label>
                <input type="datetime-local" name="dataInfracao" value={formData.dataInfracao} onChange={handleChange} required />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <button 
                type="button" 
                className="btn" 
                onClick={sugerirMotorista}
                disabled={!formData.veiculoId || !formData.dataInfracao || carregandoSugestao}
                style={{ backgroundColor: '#3b82f6', color: 'white' }}
              >
                {carregandoSugestao ? 'Buscando...' : '🔍 Sugerir Motorista (baseado em viagens)'}
              </button>
              {sugestaoMotorista && (
                <span style={{ marginLeft: '1rem', color: '#16a34a', fontWeight: '500' }}>
                  ✓ Sugerido: {sugestaoMotorista.nome}
                </span>
              )}
            </div>

            <div className="form-group">
              <label>Motorista</label>
              <select name="motoristaId" value={formData.motoristaId} onChange={handleChange}>
                <option value="">Não atribuído</option>
                {motoristas.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.nome} - CNH: {m.cnh}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Tipo de Multa *</label>
                <select name="tipoMulta" value={formData.tipoMulta} onChange={handleChange} required>
                  <option value="">Selecione o tipo</option>
                  {tiposMulta.map(tipo => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Número do Auto *</label>
                <input type="text" name="numeroAuto" value={formData.numeroAuto} onChange={handleChange} placeholder="Ex: 123456789" required />
              </div>
            </div>

            <div className="form-group">
              <label>Local da Infração *</label>
              <input type="text" name="local" value={formData.local} onChange={handleChange} placeholder="Ex: Av. Paulista, 1000 - SP" required />
            </div>

            <div className="form-group">
              <label>Descrição *</label>
              <textarea name="descricao" value={formData.descricao} onChange={handleChange} placeholder="Descreva a infração" rows="3" required />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Valor da Multa (R$) *</label>
                <input type="number" name="valorMulta" value={formData.valorMulta} onChange={handleChange} step="0.01" min="0" placeholder="Ex: 195.23" required />
              </div>

              <div className="form-group">
                <label>Pontos na CNH *</label>
                <input type="number" name="pontosCNH" value={formData.pontosCNH} onChange={handleChange} min="0" max="7" required />
              </div>

              <div className="form-group">
                <label>Data de Vencimento *</label>
                <input type="date" name="dataVencimento" value={formData.dataVencimento} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Status *</label>
                <select name="status" value={formData.status} onChange={handleChange} required>
                  <option value="PENDENTE">Pendente</option>
                  <option value="PAGA">Paga</option>
                  <option value="EM_RECURSO">Em Recurso</option>
                  <option value="CANCELADA">Cancelada</option>
                </select>
              </div>

              {formData.status === 'PAGA' && (
                <>
                  <div className="form-group">
                    <label>Data de Pagamento</label>
                    <input type="date" name="dataPagamento" value={formData.dataPagamento} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Valor Pago (R$)</label>
                    <input type="number" name="valorPago" value={formData.valorPago} onChange={handleChange} step="0.01" min="0" placeholder="Ex: 156.18" />
                  </div>
                </>
              )}
            </div>

            <div className="form-group">
              <label>Observações</label>
              <textarea name="observacoes" value={formData.observacoes} onChange={handleChange} placeholder="Observações adicionais (opcional)" rows="2" />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn btn-success">
                {editingId ? 'Atualizar Multa' : 'Registrar Multa'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancelar
              </button>
            </div>
          </form>
        )}

        {multas.length === 0 ? (
          <p style={{ color: '#718096', textAlign: 'center', padding: '2rem' }}>
            Nenhuma multa registrada. Clique em "Nova Multa" para começar.
          </p>
        ) : (
          <div>
            <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>
              {filtros.veiculoId || filtros.motoristaId || filtros.status ? 'Resultados da Pesquisa' : 'Multas Registradas'}
            </h3>
            {multasFiltradas.length === 0 ? (
              <p style={{ color: '#718096', textAlign: 'center', padding: '2rem', background: '#f7fafc', borderRadius: '8px' }}>
                Nenhuma multa encontrada com os filtros selecionados.
              </p>
            ) : (
              multasFiltradas.sort((a, b) => new Date(b.dataInfracao) - new Date(a.dataInfracao)).map(multa => (
                <div key={multa.id} className="veiculo-item" style={{ borderLeft: `4px solid ${getStatusColor(multa.status)}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <h4 style={{ margin: 0, color: '#2d3748' }}>
                          {getVeiculoInfo(multa.veiculoId)}
                        </h4>
                        <span style={{ 
                          padding: '0.25rem 0.75rem', 
                          borderRadius: '12px', 
                          fontSize: '0.85rem', 
                          fontWeight: '600',
                          backgroundColor: getStatusColor(multa.status),
                          color: 'white'
                        }}>
                          {getStatusLabel(multa.status)}
                        </span>
                      </div>
                      
                      <p style={{ margin: '0.25rem 0', fontSize: '0.95rem' }}>
                        <strong>Motorista:</strong> {getMotoristaNome(multa.motoristaId)}
                      </p>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <div><strong>Data Infração:</strong> {formatarDataHora(multa.dataInfracao)}</div>
                        <div><strong>Tipo:</strong> {multa.tipoMulta}</div>
                        <div><strong>Auto:</strong> {multa.numeroAuto}</div>
                        <div><strong>Pontos CNH:</strong> {multa.pontosCNH}</div>
                      </div>
                      
                      <div style={{ marginTop: '0.5rem' }}>
                        <strong>Local:</strong> {multa.local}
                      </div>
                      
                      <div style={{ marginTop: '0.5rem' }}>
                        <strong>Descrição:</strong> {multa.descricao}
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <div style={{ color: '#dc2626', fontWeight: '600' }}>
                          <strong>Valor:</strong> R$ {multa.valorMulta.toFixed(2)}
                        </div>
                        <div><strong>Vencimento:</strong> {formatarData(multa.dataVencimento)}</div>
                        {multa.status === 'PAGA' && (
                          <>
                            <div style={{ color: '#16a34a' }}>
                              <strong>Pago em:</strong> {formatarData(multa.dataPagamento)}
                            </div>
                            <div style={{ color: '#16a34a' }}>
                              <strong>Valor Pago:</strong> R$ {(multa.valorPago || multa.valorMulta).toFixed(2)}
                            </div>
                          </>
                        )}
                      </div>
                      
                      {multa.observacoes && (
                        <div style={{ marginTop: '0.5rem', fontStyle: 'italic', color: '#6b7280' }}>
                          <strong>Obs:</strong> {multa.observacoes}
                        </div>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginLeft: '1rem' }}>
                      {multa.status === 'PENDENTE' && (
                        <button 
                          className="btn btn-success"
                          onClick={() => handleMarcarComoPaga(multa)}
                          style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                        >
                          💰 Pagar
                        </button>
                      )}
                      <button 
                        className="btn btn-primary"
                        onClick={() => handleEdit(multa)}
                        style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                      >
                        ✏️ Editar
                      </button>
                      {isAdmin() && (
                        <button 
                          className="btn btn-danger"
                          onClick={() => handleDelete(multa.id)}
                          style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                        >
                          🗑️ Excluir
                        </button>
                      )}
                    </div>
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

export default RegistrarMultas;
