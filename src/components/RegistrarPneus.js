import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { formatDateBR, formatDateTimeLocal } from '../utils/dateUtils';
import { API_URL } from '../config';

function RegistrarPneus({ veiculos, onSuccess }) {
  const { getAuthHeader } = useAuth();
  const [formData, setFormData] = useState({
    veiculoId: '',
    motoristaId: '',
    data: formatDateTimeLocal(),
    km: '',
    eixo: '',
    posicao: '',
    quantidade: '2',
    valorTotal: '',
    tipo: ''
  });
  const [motoristas, setMotoristas] = useState([]);
  const [message, setMessage] = useState(null);
  const [trocasPneus, setTrocasPneus] = useState([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    carregarMotoristas();
    carregarTrocasPneus();
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

  const carregarTrocasPneus = async () => {
    try {
      const response = await fetch(`${API_URL}/api/veiculos`);
      const veiculosAtualizados = await response.json();
      
      const todasTrocas = [];
      for (const veiculo of veiculosAtualizados) {
        if (veiculo.registros && veiculo.registros.trocaPneus) {
          veiculo.registros.trocaPneus.forEach((troca, index) => {
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
      setTrocasPneus(todasTrocas);
    } catch (error) {
      console.error('Erro ao carregar trocas de pneus:', error);
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
      const response = await fetch(`${API_URL}/api/veiculos/${formData.veiculoId}/pneus`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: formData.data,
          km: parseInt(formData.km),
          eixo: formData.eixo,
          posicao: formData.posicao,
          quantidade: parseInt(formData.quantidade),
          valorTotal: parseFloat(formData.valorTotal),
          tipo: formData.tipo,
          motoristaId: formData.motoristaId
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: '✓ Troca de pneus registrada com sucesso!' });
        setFormData({
          veiculoId: formData.veiculoId,
          motoristaId: '',
          data: new Date().toISOString().split('T')[0],
          km: '',
          eixo: '',
          posicao: '',
          quantidade: '2',
          valorTotal: '',
          tipo: ''
        });
        carregarTrocasPneus();
        setShowForm(false);
        onSuccess();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Erro ao registrar troca de pneus' });
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

  const calcularValorPorPneu = () => {
    if (formData.quantidade && formData.valorTotal) {
      return (parseFloat(formData.valorTotal) / parseInt(formData.quantidade)).toFixed(2);
    }
    return '0.00';
  };

  const getMotoristaNome = (motoristaId) => {
    const motorista = motoristas.find(m => m.id === motoristaId);
    return motorista ? motorista.nome : 'Não informado';
  };

  const camposObrigatoriosPreenchidos = formData.veiculoId && formData.motoristaId && formData.data;

  const handleDelete = async (veiculoId, index, data) => {
    if (!window.confirm(`Tem certeza que deseja excluir a troca de pneus de ${data}?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/veiculos/${veiculoId}/pneus/${index}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMessage({ type: 'success', text: '✓ Troca de pneus excluída com sucesso!' });
        carregarTrocasPneus();
        onSuccess();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Erro ao excluir troca de pneus' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao conectar com o servidor' });
    }
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>🛞 Trocas de Pneus</h2>
        <button 
          className="btn btn-success"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Ver Histórico' : '+ Nova Troca de Pneus'}
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

        <div className="form-row">
          <div className="form-group">
            <label>Eixo *</label>
            <select 
              name="eixo" 
              value={formData.eixo} 
              onChange={handleChange}
              required
              disabled={!camposObrigatoriosPreenchidos}
            >
              <option value="">Selecione o eixo</option>
              <option value="Dianteiro">Dianteiro</option>
              <option value="Traseiro">Traseiro</option>
              <option value="Traseiro 1">Traseiro 1 (Truck/Carreta)</option>
              <option value="Traseiro 2">Traseiro 2 (Truck/Carreta)</option>
              <option value="Traseiro 3">Traseiro 3 (Carreta)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Posição *</label>
            <select 
              name="posicao" 
              value={formData.posicao} 
              onChange={handleChange}
              required
              disabled={!camposObrigatoriosPreenchidos}
            >
              <option value="">Selecione a posição</option>
              <option value="Esquerdo">Lado Esquerdo</option>
              <option value="Direito">Lado Direito</option>
              <option value="Ambos">Ambos os Lados</option>
              <option value="Interno Esquerdo">Interno Esquerdo (Duplo)</option>
              <option value="Interno Direito">Interno Direito (Duplo)</option>
              <option value="Externo Esquerdo">Externo Esquerdo (Duplo)</option>
              <option value="Externo Direito">Externo Direito (Duplo)</option>
              <option value="Completo">Completo (Todos)</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Quantidade de Pneus *</label>
          <select 
            name="quantidade" 
            value={formData.quantidade} 
            onChange={handleChange}
            required
            disabled={!camposObrigatoriosPreenchidos}
          >
            <option value="1">1 pneu</option>
            <option value="2">2 pneus</option>
            <option value="4">4 pneus</option>
            <option value="6">6 pneus</option>
            <option value="8">8 pneus</option>
            <option value="10">10 pneus</option>
          </select>
        </div>

        <div className="form-group">
          <label>Tipo/Modelo do Pneu *</label>
          <input 
            type="text" 
            name="tipo" 
            value={formData.tipo} 
            onChange={handleChange}
            placeholder="Ex: Michelin 205/55R16"
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
            placeholder="Ex: 1200.00"
            required
            disabled={!camposObrigatoriosPreenchidos}
          />
        </div>

        {formData.quantidade && formData.valorTotal && (
          <div className="alert alert-success">
            <strong>Valor por pneu:</strong> R$ {calcularValorPorPneu()}
          </div>
        )}

        <button type="submit" className="btn btn-primary" disabled={!camposObrigatoriosPreenchidos}>
          Registrar Troca de Pneus
        </button>
      </form>
      ) : (
        <div>
          <h3 style={{ marginBottom: '1rem' }}>Histórico de Trocas de Pneus</h3>
          {trocasPneus.length === 0 ? (
            <p style={{ color: '#718096', textAlign: 'center', padding: '2rem' }}>
              Nenhuma troca de pneus registrada. Clique em "Nova Troca de Pneus" para começar.
            </p>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {trocasPneus.map((troca, idx) => (
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
                          <strong>Eixo:</strong> {troca.eixo || 'N/A'}
                        </div>
                        <div>
                          <strong>Posição:</strong> {troca.posicao || 'N/A'}
                        </div>
                        <div>
                          <strong>Quantidade:</strong> {troca.quantidade} pneu{troca.quantidade > 1 ? 's' : ''}
                        </div>
                        <div>
                          <strong>Tipo:</strong> {troca.tipo}
                        </div>
                        <div>
                          <strong>Valor Total:</strong> R$ {troca.valorTotal.toFixed(2)}
                        </div>
                        <div>
                          <strong>Valor/Pneu:</strong> R$ {(troca.valorTotal / troca.quantidade).toFixed(2)}
                        </div>
                      </div>
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

export default RegistrarPneus;
