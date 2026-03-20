import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../config';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = ['#ff6b35', '#004e89', '#f77f00', '#06a77d', '#d62828', '#8338ec', '#3a86ff'];

function Graficos() {
  const { getAuthHeader } = useAuth();
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    carregarDados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/graficos/dados-consolidados`, {
        headers: getAuthHeader()
      });
      if (!response.ok) throw new Error('Erro ao carregar dados');
      const data = await response.json();
      setDados(data);
      setError(null);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar dados dos gráficos. Verifique se há dados cadastrados.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  const formatNumber = (value) => {
    return value.toLocaleString('pt-BR');
  };

  const CustomTooltip = ({ active, payload, label, prefix = '', suffix = '' }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'white',
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ margin: '5px 0', color: entry.color }}>
              {entry.name}: {prefix}{formatNumber(entry.value)}{suffix}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="card">
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ fontSize: '1.2rem', color: '#718096' }}>Carregando dados dos gráficos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ fontSize: '1.2rem', color: '#e53e3e', marginBottom: '1rem' }}>⚠️ {error}</p>
          <button onClick={carregarDados} className="btn btn-primary">
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (!dados) return null;

  return (
    <div>
      <div className="card">
        <h2>📊 Dashboard de Gráficos</h2>
        <p style={{ color: '#718096', marginBottom: '1.5rem' }}>
          Visualização consolidada de todos os dados da frota: motoristas, veículos, viagens e custos
        </p>

        <div className="stats-grid" style={{ marginBottom: '2rem' }}>
          <div className="stat-card">
            <h3>Total de Veículos</h3>
            <div className="value">{dados.performanceGeral.totalVeiculos}</div>
          </div>

          <div className="stat-card">
            <h3>Total de Motoristas</h3>
            <div className="value">{dados.performanceGeral.totalMotoristas}</div>
          </div>

          <div className="stat-card">
            <h3>Total de Viagens</h3>
            <div className="value">{dados.performanceGeral.totalViagens}</div>
          </div>

          <div className="stat-card">
            <h3>KM Total</h3>
            <div className="value">{formatNumber(dados.performanceGeral.kmTotal)}</div>
          </div>

          <div className="stat-card">
            <h3>Gasto Total</h3>
            <div className="value">{formatCurrency(dados.performanceGeral.gastoTotal)}</div>
          </div>
        </div>
      </div>

      {dados.consumoPorVeiculo.length > 0 && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', color: '#2d3748' }}>
            ⛽ Consumo Médio por Veículo (km/l)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dados.consumoPorVeiculo}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="placa" />
              <YAxis />
              <Tooltip content={<CustomTooltip suffix=" km/l" />} />
              <Legend />
              <Bar dataKey="consumo" name="Consumo (km/l)" fill="#06a77d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {dados.custoPorVeiculo.length > 0 && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', color: '#2d3748' }}>
            💰 Custo Total por Veículo
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dados.custoPorVeiculo}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="placa" />
              <YAxis />
              <Tooltip content={<CustomTooltip prefix="R$ " />} />
              <Legend />
              <Bar dataKey="custo" name="Custo Total (R$)" fill="#ff6b35" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {dados.kmPorMotorista.length > 0 && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', color: '#2d3748' }}>
            🚗 Quilometragem por Motorista
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dados.kmPorMotorista}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nome" />
              <YAxis />
              <Tooltip content={<CustomTooltip suffix=" km" />} />
              <Legend />
              <Bar dataKey="km" name="KM Percorridos" fill="#004e89" />
              <Bar dataKey="viagens" name="Viagens" fill="#f77f00" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {dados.consumoPorMotorista.length > 0 && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', color: '#2d3748' }}>
            📈 Consumo Médio por Motorista (km/l)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dados.consumoPorMotorista}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nome" />
              <YAxis />
              <Tooltip content={<CustomTooltip suffix=" km/l" />} />
              <Legend />
              <Bar dataKey="consumo" name="Consumo (km/l)" fill="#8338ec" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
        {dados.gastoPorCategoria.length > 0 && (
          <div className="card">
            <h3 style={{ marginBottom: '1rem', color: '#2d3748' }}>
              📊 Distribuição de Gastos por Categoria
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dados.gastoPorCategoria}
                  dataKey="valor"
                  nameKey="categoria"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry) => `${entry.categoria}: R$ ${entry.valor.toFixed(2)}`}
                >
                  {dados.gastoPorCategoria.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {dados.veiculosMaisUsados.length > 0 && (
          <div className="card">
            <h3 style={{ marginBottom: '1rem', color: '#2d3748' }}>
              🚙 Veículos Mais Utilizados
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dados.veiculosMaisUsados.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="viagens" name="Viagens" fill="#3a86ff" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {dados.viagensPorMes.length > 0 && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', color: '#2d3748' }}>
            📅 Viagens ao Longo do Tempo
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dados.viagensPorMes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="quantidade" name="Quantidade de Viagens" stroke="#ff6b35" strokeWidth={2} />
              <Line yAxisId="right" type="monotone" dataKey="km" name="KM Percorridos" stroke="#004e89" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="card" style={{ marginTop: '1.5rem', textAlign: 'center', backgroundColor: '#f7fafc' }}>
        <p style={{ color: '#718096', margin: 0 }}>
          💡 Use esses gráficos para identificar padrões, otimizar custos e melhorar a performance da frota
        </p>
      </div>
    </div>
  );
}

export default Graficos;
