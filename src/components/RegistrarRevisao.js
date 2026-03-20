import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { formatDateBR } from '../utils/dateUtils';
import { API_URL } from '../config';

function RegistrarRevisao({ veiculos, onSuccess }) {
  const { getAuthHeader } = useAuth();
  const [formData, setFormData] = useState({
    veiculoId: '',
    motoristaId: '',
    data: new Date().toISOString().split('T')[0],
    km: '',
    tipoRevisao: 'Preventiva',
    itensRevisados: {
      freios: false,
      suspensao: false,
      direcao: false,
      pneus: false,
      luzes: false,
      fluidos: false,
      correias: false,
      bateria: false,
      outros: false
    },
    observacoes: '',
    valorTotal: '',
    proximaRevisao: ''
  });
  const [motoristas, setMotoristas] = useState([]);
  const [message, setMessage] = useState(null);
  const [revisoes, setRevisoes] = useState([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    carregarMotoristas();
    carregarRevisoes();
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

  const carregarRevisoes = async () => {
    try {
      const response = await fetch(`${API_URL}/api/veiculos`);
      const veiculosAtualizados = await response.json();
      
      const todasRevisoes = [];
      for (const veiculo of veiculosAtualizados) {
        if (veiculo.registros && veiculo.registros.revisoes) {
          veiculo.registros.revisoes.forEach((revisao, index) => {
            todasRevisoes.push({
              ...revisao,
              veiculoId: veiculo.id,
              veiculoInfo: `${veiculo.marca} ${veiculo.modelo} - ${veiculo.placa}`,
              index
            });
          });
        }
      }
      todasRevisoes.sort((a, b) => new Date(b.data) - new Date(a.data));
      setRevisoes(todasRevisoes);
    } catch (error) {
      console.error('Erro ao carregar revisões:', error);
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
      const response = await fetch(`${API_URL}/api/veiculos/${formData.veiculoId}/revisao`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: formData.data,
          km: parseInt(formData.km),
          tipoRevisao: formData.tipoRevisao,
          itensRevisados: formData.itensRevisados,
          observacoes: formData.observacoes,
          valorTotal: parseFloat(formData.valorTotal),
          proximaRevisao: formData.proximaRevisao,
          motoristaId: formData.motoristaId
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: '✓ Revisão registrada com sucesso!' });
        setFormData({
          veiculoId: formData.veiculoId,
          motoristaId: '',
          data: new Date().toISOString().split('T')[0],
          km: '',
          tipoRevisao: 'Preventiva',
          itensRevisados: {
            freios: false,
            suspensao: false,
            direcao: false,
            pneus: false,
            luzes: false,
            fluidos: false,
            correias: false,
            bateria: false,
            outros: false
          },
          observacoes: '',
          valorTotal: '',
          proximaRevisao: ''
        });
        carregarRevisoes();
        setShowForm(false);
        onSuccess();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Erro ao registrar revisão' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao conectar com o servidor' });
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('item_')) {
      const itemKey = name.replace('item_', '');
      setFormData({
        ...formData,
        itensRevisados: {
          ...formData.itensRevisados,
          [itemKey]: checked
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  const getMotoristaNome = (motoristaId) => {
    const motorista = motoristas.find(m => m.id === motoristaId);
    return motorista ? motorista.nome : 'Não informado';
  };

  const camposObrigatoriosPreenchidos = formData.veiculoId && formData.motoristaId && formData.data;

  const handleDelete = async (veiculoId, index, data) => {
    if (!window.confirm(`Tem certeza que deseja excluir a revisão de ${data}?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/veiculos/${veiculoId}/revisao/${index}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMessage({ type: 'success', text: '✓ Revisão excluída com sucesso!' });
        carregarRevisoes();
        onSuccess();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Erro ao excluir revisão' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao conectar com o servidor' });
    }
  };

  const getItensRevisadosTexto = (itens) => {
    const itensAtivos = [];
    if (itens.freios) itensAtivos.push('Freios');
    if (itens.suspensao) itensAtivos.push('Suspensão');
    if (itens.direcao) itensAtivos.push('Direção');
    if (itens.pneus) itensAtivos.push('Pneus');
    if (itens.luzes) itensAtivos.push('Luzes');
    if (itens.fluidos) itensAtivos.push('Fluidos');
    if (itens.correias) itensAtivos.push('Correias');
    if (itens.bateria) itensAtivos.push('Bateria');
    if (itens.outros) itensAtivos.push('Outros');
    return itensAtivos.length > 0 ? itensAtivos.join(', ') : 'Nenhum item especificado';
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>🔧 Revisão</h2>
        <button 
          className="btn btn-success"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Ver Histórico' : '+ Nova Revisão'}
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

        <div className="form-group">
          <label>Tipo de Revisão *</label>
          <select 
            name="tipoRevisao" 
            value={formData.tipoRevisao} 
            onChange={handleChange}
            required
            disabled={!camposObrigatoriosPreenchidos}
          >
            <option value="Preventiva">Preventiva</option>
            <option value="Corretiva">Corretiva</option>
            <option value="10.000 KM">10.000 KM</option>
            <option value="20.000 KM">20.000 KM</option>
            <option value="30.000 KM">30.000 KM</option>
            <option value="50.000 KM">50.000 KM</option>
            <option value="100.000 KM">100.000 KM</option>
          </select>
        </div>

        <div className="form-group">
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Itens Revisados</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                name="item_freios" 
                checked={formData.itensRevisados.freios} 
                onChange={handleChange}
                style={{ marginRight: '0.5rem', cursor: 'pointer' }}
                disabled={!camposObrigatoriosPreenchidos}
              />
              Freios
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                name="item_suspensao" 
                checked={formData.itensRevisados.suspensao} 
                onChange={handleChange}
                style={{ marginRight: '0.5rem', cursor: 'pointer' }}
                disabled={!camposObrigatoriosPreenchidos}
              />
              Suspensão
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                name="item_direcao" 
                checked={formData.itensRevisados.direcao} 
                onChange={handleChange}
                style={{ marginRight: '0.5rem', cursor: 'pointer' }}
                disabled={!camposObrigatoriosPreenchidos}
              />
              Direção
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                name="item_pneus" 
                checked={formData.itensRevisados.pneus} 
                onChange={handleChange}
                style={{ marginRight: '0.5rem', cursor: 'pointer' }}
                disabled={!camposObrigatoriosPreenchidos}
              />
              Pneus
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                name="item_luzes" 
                checked={formData.itensRevisados.luzes} 
                onChange={handleChange}
                style={{ marginRight: '0.5rem', cursor: 'pointer' }}
                disabled={!camposObrigatoriosPreenchidos}
              />
              Luzes
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                name="item_fluidos" 
                checked={formData.itensRevisados.fluidos} 
                onChange={handleChange}
                style={{ marginRight: '0.5rem', cursor: 'pointer' }}
                disabled={!camposObrigatoriosPreenchidos}
              />
              Fluidos
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                name="item_correias" 
                checked={formData.itensRevisados.correias} 
                onChange={handleChange}
                style={{ marginRight: '0.5rem', cursor: 'pointer' }}
                disabled={!camposObrigatoriosPreenchidos}
              />
              Correias
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                name="item_bateria" 
                checked={formData.itensRevisados.bateria} 
                onChange={handleChange}
                style={{ marginRight: '0.5rem', cursor: 'pointer' }}
                disabled={!camposObrigatoriosPreenchidos}
              />
              Bateria
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                name="item_outros" 
                checked={formData.itensRevisados.outros} 
                onChange={handleChange}
                style={{ marginRight: '0.5rem', cursor: 'pointer' }}
                disabled={!camposObrigatoriosPreenchidos}
              />
              Outros
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
          <label>Próxima Revisão (KM)</label>
          <input 
            type="number" 
            name="proximaRevisao" 
            value={formData.proximaRevisao} 
            onChange={handleChange}
            placeholder="Ex: 55000"
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
          Registrar Revisão
        </button>
      </form>
      ) : (
        <div>
          <h3 style={{ marginBottom: '1rem' }}>Histórico de Revisões</h3>
          {revisoes.length === 0 ? (
            <p style={{ color: '#718096', textAlign: 'center', padding: '2rem' }}>
              Nenhuma revisão registrada. Clique em "Nova Revisão" para começar.
            </p>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {revisoes.map((revisao, idx) => (
                <div key={idx} className="veiculo-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 0.5rem 0', color: '#2d3748' }}>
                        {revisao.veiculoInfo}
                      </h4>
                      <p style={{ margin: '0.25rem 0', fontSize: '0.95rem' }}>
                        <strong>Data:</strong> {formatDateBR(revisao.data)}
                      </p>
                      <p style={{ margin: '0.25rem 0', fontSize: '0.95rem' }}>
                        <strong>Motorista:</strong> {getMotoristaNome(revisao.motoristaId)}
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <div>
                          <strong>KM:</strong> {revisao.km.toLocaleString('pt-BR')}
                        </div>
                        <div>
                          <strong>Tipo:</strong> {revisao.tipoRevisao}
                        </div>
                        <div>
                          <strong>Valor:</strong> R$ {revisao.valorTotal.toFixed(2)}
                        </div>
                        {revisao.proximaRevisao && (
                          <div>
                            <strong>Próxima:</strong> {revisao.proximaRevisao.toLocaleString('pt-BR')} KM
                          </div>
                        )}
                      </div>
                      {revisao.itensRevisados && (
                        <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#f0fdf4', borderRadius: '4px', borderLeft: '3px solid #10b981' }}>
                          <strong>Itens Revisados:</strong> {getItensRevisadosTexto(revisao.itensRevisados)}
                        </div>
                      )}
                      {revisao.observacoes && (
                        <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#f7fafc', borderRadius: '4px' }}>
                          <strong>Observações:</strong> {revisao.observacoes}
                        </div>
                      )}
                    </div>
                    <button 
                      className="btn btn-danger"
                      onClick={() => handleDelete(revisao.veiculoId, revisao.index, formatDateBR(revisao.data))}
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

export default RegistrarRevisao;
