import React, { useState, useEffect } from 'react';
import { formatDateBR } from '../utils/dateUtils';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../config';

function Analise({ veiculos, onNavigate }) {
  const { getAuthHeader } = useAuth();
  const [selectedVeiculo, setSelectedVeiculo] = useState('');
  const [analiseData, setAnaliseData] = useState(null);
  const [motoristas, setMotoristas] = useState([]);

  useEffect(() => {
    carregarMotoristas();
  }, []);

  useEffect(() => {
    if (selectedVeiculo) {
      carregarAnalise();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVeiculo]);

  const carregarMotoristas = async () => {
    try {
      const response = await fetch(`${API_URL}/api/motoristas`);
      const data = await response.json();
      setMotoristas(data);
    } catch (error) {
      console.error('Erro ao carregar motoristas:', error);
    }
  };

  const carregarAnalise = async () => {
    try {
      const response = await fetch(`${API_URL}/api/analise/veiculo/${selectedVeiculo}`, {
        headers: getAuthHeader()
      });
      const data = await response.json();
      setAnaliseData(data);
    } catch (error) {
      console.error('Erro ao carregar análise:', error);
    }
  };

  const getConsumoStatus = (consumo) => {
    if (!consumo) return { text: 'Sem dados', class: '' };
    if (consumo >= 12) return { text: 'Excelente', class: 'badge-success' };
    if (consumo >= 10) return { text: 'Bom', class: 'badge-success' };
    if (consumo >= 8) return { text: 'Regular', class: 'badge-warning' };
    return { text: 'Atenção', class: 'badge-error' };
  };

  const getCustoStatus = (custo) => {
    if (!custo) return { text: 'Sem dados', class: '' };
    if (custo <= 0.50) return { text: 'Econômico', class: 'badge-success' };
    if (custo <= 0.80) return { text: 'Moderado', class: 'badge-warning' };
    return { text: 'Alto', class: 'badge-error' };
  };

  const getMotoristaNome = (motoristaId) => {
    const motorista = motoristas.find(m => m.id === motoristaId);
    return motorista ? motorista.nome : 'N/A';
  };

  return (
    <div>
      <div className="card">
        <h2>📈 Análise de Performance</h2>
        
        <div className="form-group">
          <label>Selecione um Veículo</label>
          <select 
            value={selectedVeiculo} 
            onChange={(e) => setSelectedVeiculo(e.target.value)}
          >
            <option value="">Escolha um veículo para análise</option>
            {veiculos.map(v => (
              <option key={v.id} value={v.id}>
                {v.placa} - {v.marca} {v.modelo}
              </option>
            ))}
          </select>
        </div>

        {analiseData && (
          <div style={{ marginTop: '2rem' }}>
            <div style={{ background: '#f7fafc', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <h3 style={{ color: '#2d3748', marginBottom: '0.5rem' }}>
                {analiseData.veiculo.marca} {analiseData.veiculo.modelo}
              </h3>
              <p style={{ color: '#718096' }}>
                <strong>Placa:</strong> {analiseData.veiculo.placa} | 
                <strong> Ano:</strong> {analiseData.veiculo.ano} | 
                <strong> KM:</strong> {analiseData.veiculo.kmAtual.toLocaleString('pt-BR')}
              </p>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <h3>🛣️ KM Rodados</h3>
                <div className="value">
                  {analiseData.metricas.kmRodados 
                    ? `${analiseData.metricas.kmRodados.toLocaleString('pt-BR')} km`
                    : '0 km'}
                </div>
              </div>

              <div className="stat-card">
                <h3>⛽ Total de Litros</h3>
                <div className="value">
                  {analiseData.metricas.totalLitros 
                    ? `${analiseData.metricas.totalLitros.toFixed(2)} L`
                    : '0 L'}
                </div>
              </div>

              <div className="stat-card">
                <h3>📊 Consumo Médio</h3>
                <div className="value">
                  {analiseData.metricas.consumoMedio 
                    ? `${analiseData.metricas.consumoMedio.toFixed(2)} km/l`
                    : 'N/A'}
                </div>
                {analiseData.metricas.consumoMedio && (
                  <span className={`metric-badge ${getConsumoStatus(analiseData.metricas.consumoMedio).class}`}>
                    {getConsumoStatus(analiseData.metricas.consumoMedio).text}
                  </span>
                )}
              </div>

              <div className="stat-card">
                <h3>💰 Custo Total por KM</h3>
                <div className="value">
                  {analiseData.metricas.custoPorKm 
                    ? `R$ ${analiseData.metricas.custoPorKm.toFixed(2)}`
                    : 'N/A'}
                </div>
                {analiseData.metricas.custoPorKm && (
                  <span className={`metric-badge ${getCustoStatus(analiseData.metricas.custoPorKm).class}`}>
                    {getCustoStatus(analiseData.metricas.custoPorKm).text}
                  </span>
                )}
              </div>

              <div className="stat-card">
                <h3>⛽ Custo/KM Combustível</h3>
                <div className="value">
                  {analiseData.metricas.custoPorKmCombustivel 
                    ? `R$ ${analiseData.metricas.custoPorKmCombustivel.toFixed(2)}`
                    : 'N/A'}
                </div>
              </div>

              <div className="stat-card">
                <h3>💵 Gasto Total do Veículo</h3>
                <div className="value">
                  {analiseData.metricas.totalGasto 
                    ? `R$ ${analiseData.metricas.totalGasto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                    : 'R$ 0,00'}
                </div>
              </div>

              <div className="stat-card">
                <h3>⛽ Gasto com Combustível</h3>
                <div className="value">
                  {analiseData.metricas.gastoCombustivel 
                    ? `R$ ${analiseData.metricas.gastoCombustivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                    : 'R$ 0,00'}
                </div>
              </div>

              <div className="stat-card">
                <h3>🔧 Próxima Manutenção</h3>
                <div className="value" style={{ fontSize: '1.5rem' }}>
                  {analiseData.metricas.proximaManutencao.km} km
                </div>
                <p style={{ fontSize: '0.9rem', color: '#718096', marginTop: '0.5rem' }}>
                  {analiseData.metricas.proximaManutencao.tipo}
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
              <div 
                className="card" 
                style={{ margin: 0, cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
                onClick={() => onNavigate && onNavigate('abastecimento')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#2d3748' }}>
                  ⛽ Abastecimentos
                </h3>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#667eea' }}>
                  {analiseData.registros.abastecimentos.length}
                </p>
              </div>

              <div 
                className="card" 
                style={{ margin: 0, cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
                onClick={() => onNavigate && onNavigate('manutencao')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#2d3748' }}>
                  🔧 Manutenções
                </h3>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#667eea' }}>
                  {analiseData.registros.manutencoes.length}
                </p>
              </div>

              <div 
                className="card" 
                style={{ margin: 0, cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
                onClick={() => onNavigate && onNavigate('pneus')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#2d3748' }}>
                  🛞 Trocas de Pneus
                </h3>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#667eea' }}>
                  {analiseData.registros.trocaPneus.length}
                </p>
              </div>

              <div 
                className="card" 
                style={{ margin: 0, cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
                onClick={() => onNavigate && onNavigate('viagens')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#2d3748' }}>
                  🗺️ Viagens
                </h3>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#667eea' }}>
                  {analiseData.registros.viagens?.length || 0}
                </p>
              </div>

              <div 
                className="card" 
                style={{ margin: 0, cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
                onClick={() => onNavigate && onNavigate('troca-oleo')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#2d3748' }}>
                  🛢️ Troca de Óleo
                </h3>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#667eea' }}>
                  {analiseData.registros.trocasOleo?.length || 0}
                </p>
              </div>

              <div 
                className="card" 
                style={{ margin: 0, cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
                onClick={() => onNavigate && onNavigate('revisao')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#2d3748' }}>
                  🔧 Revisão
                </h3>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#667eea' }}>
                  {analiseData.registros.revisoes?.length || 0}
                </p>
              </div>
            </div>

            {analiseData.registros.abastecimentos.length > 0 && (
              <div className="card" style={{ marginTop: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Últimos Abastecimentos</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>Data</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>Motorista</th>
                        <th style={{ padding: '0.75rem', textAlign: 'right' }}>KM</th>
                        <th style={{ padding: '0.75rem', textAlign: 'right' }}>Litros</th>
                        <th style={{ padding: '0.75rem', textAlign: 'right' }}>Valor</th>
                        <th style={{ padding: '0.75rem', textAlign: 'right' }}>R$/L</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analiseData.registros.abastecimentos.slice(-5).reverse().map((ab, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '0.75rem' }}>{formatDateBR(ab.data)}</td>
                          <td style={{ padding: '0.75rem' }}>{getMotoristaNome(ab.motoristaId)}</td>
                          <td style={{ padding: '0.75rem', textAlign: 'right' }}>{ab.km.toLocaleString('pt-BR')}</td>
                          <td style={{ padding: '0.75rem', textAlign: 'right' }}>{ab.litros.toFixed(2)}</td>
                          <td style={{ padding: '0.75rem', textAlign: 'right' }}>R$ {ab.valorTotal.toFixed(2)}</td>
                          <td style={{ padding: '0.75rem', textAlign: 'right' }}>R$ {ab.valorPorLitro.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {!selectedVeiculo && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#718096' }}>
            <p>Selecione um veículo acima para visualizar a análise de performance</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Analise;
