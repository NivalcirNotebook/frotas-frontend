import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../config';

function Dashboard({ veiculos }) {
  const { getAuthHeader } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarEstatisticas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const carregarEstatisticas = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/analise/frota`, {
        headers: getAuthHeader()
      });
      
      if (!response.ok) {
        throw new Error('Erro ao carregar estatísticas');
      }
      
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      setError(error.message);
      // Set default stats to avoid errors
      setStats({
        totalVeiculos: 0,
        totalKm: 0,
        totalGasto: 0,
        consumoMedioGeral: 0,
        custoPorKm: 0
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="card">Carregando...</div>;
  }

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem', color: '#2d3748' }}>📊 Dashboard da Frota</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total de Veículos</h3>
          <div className="value">{stats.totalVeiculos}</div>
        </div>

        <div className="stat-card">
          <h3>KM Total</h3>
          <div className="value">{stats.totalKm.toLocaleString('pt-BR')}</div>
        </div>

        <div className="stat-card">
          <h3>Gasto Total</h3>
          <div className="value">
            R$ {stats.totalGasto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="stat-card">
          <h3>Consumo Médio</h3>
          <div className="value">{stats.consumoMedioGeral.toFixed(2)} km/l</div>
        </div>

        <div className="stat-card">
          <h3>Custo por KM</h3>
          <div className="value">
            R$ {stats.custoPorKm.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="card">
        <h2>🚗 Veículos da Frota</h2>
        {veiculos.length === 0 ? (
          <p style={{ color: '#718096' }}>Nenhum veículo cadastrado ainda.</p>
        ) : (
          <div>
            {veiculos.map(v => (
              <div key={v.id} className="veiculo-item">
                <h3>{v.marca} {v.modelo}</h3>
                <p><strong>Placa:</strong> {v.placa} | <strong>Ano:</strong> {v.ano}</p>
                <p><strong>KM Atual:</strong> {v.kmAtual.toLocaleString('pt-BR')}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
