import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../config';

function PerformanceMotorista() {
  const { getAuthHeader } = useAuth();
  const [motoristas, setMotoristas] = useState([]);
  const [motoristaSelecionado, setMotoristaSelecionado] = useState('');
  const [analise, setAnalise] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    carregarMotoristas();
  }, []);

  const carregarMotoristas = async () => {
    try {
      const response = await fetch(`${API_URL}/api/motoristas?ativos=true`, {
        headers: getAuthHeader()
      });
      
      if (!response.ok) {
        throw new Error('Erro ao carregar motoristas');
      }
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setMotoristas(data);
      } else {
        console.error('Dados retornados não são um array:', data);
        setMotoristas([]);
      }
    } catch (error) {
      console.error('Erro ao carregar motoristas:', error);
      setMotoristas([]);
    }
  };

  const carregarAnalise = async (motoristaId) => {
    if (!motoristaId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/analise/motorista/${motoristaId}`, {
        headers: getAuthHeader()
      });
      
      if (!response.ok) {
        throw new Error('Erro ao carregar análise');
      }
      
      const data = await response.json();
      setAnalise(data);
    } catch (error) {
      console.error('Erro ao carregar análise:', error);
      setAnalise(null);
    } finally {
      setLoading(false);
    }
  };

  const handleMotoristaChange = (e) => {
    const id = e.target.value;
    setMotoristaSelecionado(id);
    if (id) {
      carregarAnalise(id);
    } else {
      setAnalise(null);
    }
  };

  return (
    <div>
      <div className="card">
        <h2>👤 Performance por Motorista</h2>
        <p style={{ color: '#718096', marginBottom: '1.5rem' }}>
          Analise a performance individual de cada motorista e os veículos utilizados
        </p>

        <div className="form-group">
          <label>Selecione o Motorista *</label>
          <select 
            value={motoristaSelecionado} 
            onChange={handleMotoristaChange}
            style={{ fontSize: '1rem', padding: '0.75rem' }}
          >
            <option value="">-- Selecione um motorista --</option>
            {motoristas.map(m => (
              <option key={m.id} value={m.id}>
                {m.nome} - CNH: {m.cnh}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <div className="card">
          <p style={{ textAlign: 'center', color: '#718096' }}>Carregando análise...</p>
        </div>
      )}

      {!loading && analise && (
        <>
          <div className="card" style={{ marginTop: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', color: '#2d3748' }}>
              📊 Resumo Geral - {analise.motorista.nome}
            </h3>
            
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Veículos Utilizados</h3>
                <div className="value">{analise.resumo.veiculosUsados}</div>
              </div>

              <div className="stat-card">
                <h3>KM Rodados</h3>
                <div className="value">{analise.resumo.totalKmRodados.toLocaleString('pt-BR')}</div>
              </div>

              <div className="stat-card">
                <h3>Consumo Médio</h3>
                <div className="value">
                  {analise.resumo.consumoMedioGeral > 0 
                    ? analise.resumo.consumoMedioGeral.toFixed(2) + ' km/l'
                    : 'N/A'}
                </div>
              </div>

              <div className="stat-card">
                <h3>Gasto Total</h3>
                <div className="value">
                  R$ {analise.resumo.totalGasto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div className="stat-card">
                <h3>Custo por KM</h3>
                <div className="value">
                  R$ {analise.resumo.custoPorKm.toFixed(2)}
                </div>
              </div>

              <div className="stat-card">
                <h3>Abastecimentos</h3>
                <div className="value">{analise.resumo.totalAbastecimentos}</div>
              </div>

              <div className="stat-card">
                <h3>Manutenções</h3>
                <div className="value">{analise.resumo.totalManutencoes}</div>
              </div>

              <div className="stat-card">
                <h3>Trocas de Pneus</h3>
                <div className="value">{analise.resumo.totalTrocasPneus}</div>
              </div>

              <div className="stat-card">
                <h3>Viagens</h3>
                <div className="value">{analise.resumo.totalViagens || 0}</div>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginTop: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', color: '#2d3748' }}>
              🚗 Detalhamento por Veículo
            </h3>

            {analise.veiculos.length === 0 ? (
              <p style={{ color: '#718096', textAlign: 'center', padding: '2rem' }}>
                Este motorista ainda não possui registros em nenhum veículo.
              </p>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {analise.veiculos.map(v => (
                  <div key={v.id} className="veiculo-item">
                    <div style={{ borderLeft: '4px solid #ff6b35', paddingLeft: '1rem' }}>
                      <h4 style={{ margin: '0 0 0.5rem 0', color: '#2d3748' }}>
                        {v.marca} {v.modelo} - {v.placa}
                      </h4>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                        <div>
                          <strong>KM Rodados:</strong> {v.kmRodados.toLocaleString('pt-BR')}
                        </div>
                        <div>
                          <strong>Consumo Médio:</strong> {v.consumoMedio ? v.consumoMedio.toFixed(2) + ' km/l' : 'N/A'}
                        </div>
                        <div>
                          <strong>Gasto Total:</strong> R$ {v.gastoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem', marginTop: '1rem', fontSize: '0.9rem' }}>
                        <div>
                          <strong>⛽ Abastecimentos:</strong> {v.abastecimentos}
                        </div>
                        <div>
                          <strong>🔧 Manutenções:</strong> {v.manutencoes}
                        </div>
                        <div>
                          <strong>🛞 Troca de Pneus:</strong> {v.trocasPneus}
                        </div>
                        <div>
                          <strong>🗺️ Viagens:</strong> {v.viagens || 0}
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', marginTop: '1rem', fontSize: '0.85rem', color: '#718096' }}>
                        <div>
                          Abastecimento: R$ {v.gastoAbastecimento.toFixed(2)}
                        </div>
                        <div>
                          Manutenção: R$ {v.gastoManutencao.toFixed(2)}
                        </div>
                        <div>
                          Pneus: R$ {v.gastoPneus.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default PerformanceMotorista;
