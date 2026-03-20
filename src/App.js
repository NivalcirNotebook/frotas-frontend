import React, { useState, useEffect } from 'react';
import './App.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { API_URL } from './config';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import VeiculosList from './components/VeiculosList';
import MotoristasList from './components/MotoristasList';
import RegistrarAbastecimento from './components/RegistrarAbastecimento';
import RegistrarManutencao from './components/RegistrarManutencao';
import RegistrarPneus from './components/RegistrarPneus';
import RegistrarTrocaOleo from './components/RegistrarTrocaOleo';
import RegistrarRevisao from './components/RegistrarRevisao';
import RegistrarViagem from './components/RegistrarViagem';
import RegistrarMultas from './components/RegistrarMultas';
import Analise from './components/Analise';
import PerformanceMotorista from './components/PerformanceMotorista';
import Graficos from './components/Graficos';
import UsuariosList from './components/UsuariosList';

function AppContent() {
  const { isAuthenticated, user, isAdmin, canAccess, logout, getAuthHeader } = useAuth();
  const [activeTab, setActiveTab] = useState('veiculos');
  const [veiculos, setVeiculos] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      carregarVeiculos();
    }
  }, [isAuthenticated]);

  const carregarVeiculos = async () => {
    try {
      const response = await fetch(`${API_URL}/api/veiculos`, {
        headers: getAuthHeader()
      });
      const data = await response.json();
      setVeiculos(data);
    } catch (error) {
      console.error('Erro ao carregar veículos:', error);
    }
  };

  if (!isAuthenticated) {
    return <Login />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard veiculos={veiculos} />;
      case 'veiculos':
        return <VeiculosList veiculos={veiculos} onRefresh={carregarVeiculos} />;
      case 'motoristas':
        return <MotoristasList />;
      case 'abastecimento':
        return <RegistrarAbastecimento veiculos={veiculos} onSuccess={carregarVeiculos} />;
      case 'manutencao':
        return <RegistrarManutencao veiculos={veiculos} onSuccess={carregarVeiculos} />;
      case 'pneus':
        return <RegistrarPneus veiculos={veiculos} onSuccess={carregarVeiculos} />;
      case 'troca-oleo':
        return <RegistrarTrocaOleo veiculos={veiculos} onSuccess={carregarVeiculos} />;
      case 'revisao':
        return <RegistrarRevisao veiculos={veiculos} onSuccess={carregarVeiculos} />;
      case 'viagens':
        return <RegistrarViagem veiculos={veiculos} onSuccess={carregarVeiculos} />;
      case 'multas':
        return <RegistrarMultas veiculos={veiculos} onSuccess={carregarVeiculos} />;
      case 'analise':
        return <Analise veiculos={veiculos} onNavigate={setActiveTab} />;
      case 'performance':
        return <PerformanceMotorista />;
      case 'graficos':
        return <Graficos />;
      case 'usuarios':
        return <UsuariosList />;
      default:
        return <Dashboard veiculos={veiculos} />;
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-logo">
          <img src="/logo-casa-linda.png" alt="Casa Linda" />
        </div>
        <div className="header-user-info">
          <span>{user?.nome || user?.username}</span>
          <span className="user-role-badge">{user?.role === 'ADMIN' ? 'Admin' : 'Motorista'}</span>
        </div>
        <div className="header-content">
          <h1>Sistema de Gestão de Frotas</h1>
          <p>Controle completo da sua frota</p>
        </div>
        <button onClick={logout} className="btn-logout">
          Sair
        </button>
      </header>

      <nav className="app-nav">
        {isAdmin() && (
          <>
            <button 
              className={activeTab === 'dashboard' ? 'active' : ''} 
              onClick={() => setActiveTab('dashboard')}
            >
              📊 Dashboard
            </button>
            <button 
              className={activeTab === 'veiculos' ? 'active' : ''} 
              onClick={() => setActiveTab('veiculos')}
            >
              🚙 Veículos
            </button>
            <button 
              className={activeTab === 'motoristas' ? 'active' : ''} 
              onClick={() => setActiveTab('motoristas')}
            >
              👤 Motoristas
            </button>
          </>
        )}
        <button 
          className={activeTab === 'abastecimento' ? 'active' : ''} 
          onClick={() => setActiveTab('abastecimento')}
        >
          ⛽ Abastecimento
        </button>
        <button 
          className={activeTab === 'manutencao' ? 'active' : ''} 
          onClick={() => setActiveTab('manutencao')}
        >
          🔧 Manutenção
        </button>
        <button 
          className={activeTab === 'pneus' ? 'active' : ''} 
          onClick={() => setActiveTab('pneus')}
        >
          🛞 Pneus
        </button>
        <button 
          className={activeTab === 'troca-oleo' ? 'active' : ''} 
          onClick={() => setActiveTab('troca-oleo')}
        >
          🛢️ Óleo
        </button>
        <button 
          className={activeTab === 'revisao' ? 'active' : ''} 
          onClick={() => setActiveTab('revisao')}
        >
          🔧 Revisão
        </button>
        {canAccess('viagens') && (
          <button 
            className={activeTab === 'viagens' ? 'active' : ''} 
            onClick={() => setActiveTab('viagens')}
          >
            🗺️ Viagens
          </button>
        )}
        <button 
          className={activeTab === 'multas' ? 'active' : ''} 
          onClick={() => setActiveTab('multas')}
        >
          🚨 Multas
        </button>
        {isAdmin() && (
          <>
            <button 
              className={activeTab === 'analise' ? 'active' : ''} 
              onClick={() => setActiveTab('analise')}
            >
              📊 Análise
            </button>
            <button 
              className={activeTab === 'performance' ? 'active' : ''} 
              onClick={() => setActiveTab('performance')}
            >
              👤 Performance
            </button>
            <button 
              className={activeTab === 'graficos' ? 'active' : ''} 
              onClick={() => setActiveTab('graficos')}
            >
              � Gráficos
            </button>
            <button 
              className={activeTab === 'usuarios' ? 'active' : ''} 
              onClick={() => setActiveTab('usuarios')}
            >
              👥 Usuários
            </button>
          </>
        )}
      </nav>

      <main className="app-main">
        {renderContent()}
      </main>

      <footer className="app-footer">
        <p>Sistema de Gestão de Frotas v1.0 - {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
