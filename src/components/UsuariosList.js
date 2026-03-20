import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../config';
import UsuarioForm from './UsuarioForm';
import AlterarSenha from './AlterarSenha';

function UsuariosList() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showSenhaModal, setShowSenhaModal] = useState(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  const [message, setMessage] = useState(null);
  const { getAuthHeader } = useAuth();

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const carregarUsuarios = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/usuarios`, {
        headers: getAuthHeader()
      });
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Dados recebidos:', data);
      
      // Garantir que usuarios é sempre um array
      if (Array.isArray(data)) {
        setUsuarios(data);
      } else if (data.usuarios && Array.isArray(data.usuarios)) {
        setUsuarios(data.usuarios);
      } else {
        console.error('Resposta não é um array:', data);
        setUsuarios([]);
        setMessage({ type: 'error', text: 'Formato de dados inválido' });
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      setUsuarios([]);
      setMessage({ type: 'error', text: `Erro ao carregar usuários: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleNovo = () => {
    setUsuarioSelecionado(null);
    setShowForm(true);
  };

  const handleEditar = (usuario) => {
    setUsuarioSelecionado(usuario);
    setShowForm(true);
  };

  const handleAlterarSenha = (usuario) => {
    setUsuarioSelecionado(usuario);
    setShowSenhaModal(true);
  };

  const handleDesativar = async (usuario) => {
    if (!window.confirm(`Deseja realmente desativar o usuário ${usuario.nome}?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/usuarios/${usuario.id}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Usuário desativado com sucesso' });
        carregarUsuarios();
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Erro ao desativar usuário' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao desativar usuário' });
    }
  };

  const handleAtivar = async (usuario) => {
    try {
      const response = await fetch(`${API_URL}/api/usuarios/${usuario.id}/ativar`, {
        method: 'PUT',
        headers: getAuthHeader()
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Usuário ativado com sucesso' });
        carregarUsuarios();
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Erro ao ativar usuário' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao ativar usuário' });
    }
  };

  const handleFormClose = (refresh) => {
    setShowForm(false);
    setUsuarioSelecionado(null);
    if (refresh) {
      carregarUsuarios();
    }
  };

  const handleSenhaClose = (refresh) => {
    setShowSenhaModal(false);
    setUsuarioSelecionado(null);
    if (refresh) {
      setMessage({ type: 'success', text: 'Senha alterada com sucesso' });
    }
  };

  if (loading) {
    return <div className="loading">Carregando usuários...</div>;
  }

  return (
    <div className="usuarios-container">
      <div className="page-header">
        <h2>👥 Gerenciamento de Usuários</h2>
        <button onClick={handleNovo} className="btn btn-primary">
          ➕ Novo Usuário
        </button>
      </div>

      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
          <button onClick={() => setMessage(null)} className="alert-close">×</button>
        </div>
      )}

      <div className="usuarios-grid">
        <table className="usuarios-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Username</th>
              <th>Email</th>
              <th>Papel</th>
              <th>Status</th>
              <th>Data Cadastro</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(usuario => (
              <tr key={usuario.id} className={!usuario.ativo ? 'inactive' : ''}>
                <td>{usuario.nome}</td>
                <td>{usuario.username}</td>
                <td>{usuario.email || '-'}</td>
                <td>
                  <span className={`role-badge ${usuario.role.toLowerCase()}`}>
                    {usuario.role === 'ADMIN' ? '👑 Admin' : '🚗 Motorista'}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${usuario.ativo ? 'ativo' : 'inativo'}`}>
                    {usuario.ativo ? '✓ Ativo' : '✗ Inativo'}
                  </span>
                </td>
                <td>{new Date(usuario.createdAt).toLocaleDateString('pt-BR')}</td>
                <td className="action-buttons">
                  <button 
                    onClick={() => handleEditar(usuario)} 
                    className="btn btn-sm btn-secondary"
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button 
                    onClick={() => handleAlterarSenha(usuario)} 
                    className="btn btn-sm btn-warning"
                    title="Alterar Senha"
                  >
                    🔑
                  </button>
                  {usuario.ativo ? (
                    <button 
                      onClick={() => handleDesativar(usuario)} 
                      className="btn btn-sm btn-danger"
                      title="Desativar"
                    >
                      🚫
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleAtivar(usuario)} 
                      className="btn btn-sm btn-success"
                      title="Ativar"
                    >
                      ✓
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {usuarios.length === 0 && (
          <div className="empty-state">
            <p>Nenhum usuário cadastrado</p>
          </div>
        )}
      </div>

      {showForm && (
        <UsuarioForm 
          usuario={usuarioSelecionado} 
          onClose={handleFormClose}
        />
      )}

      {showSenhaModal && (
        <AlterarSenha 
          usuario={usuarioSelecionado} 
          onClose={handleSenhaClose}
        />
      )}
    </div>
  );
}

export default UsuariosList;
