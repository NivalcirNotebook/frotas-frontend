# Instruções para Atualizar Componentes

Todos os componentes React precisam ser atualizados para usar a variável de ambiente `API_URL` ao invés de `http://localhost:3001` hardcoded.

## Arquivos que precisam atualização:

Execute uma busca global e substitua:

### Passo 1: Adicionar import no topo de cada arquivo
```javascript
import { API_URL } from '../config';
```

### Passo 2: Substituir todas as ocorrências
```javascript
// DE:
'http://localhost:3001/api/...'

// PARA:
`${API_URL}/api/...`
```

## Lista de arquivos (54 ocorrências em 18 arquivos):

1. src/components/RegistrarMultas.js (7 ocorrências)
2. src/components/MotoristasList.js (6 ocorrências)
3. src/components/RegistrarAbastecimento.js (4 ocorrências)
4. src/components/RegistrarManutencao.js (4 ocorrências)
5. src/components/RegistrarPneus.js (4 ocorrências)
6. src/components/RegistrarRevisao.js (4 ocorrências)
7. src/components/RegistrarTrocaOleo.js (4 ocorrências)
8. src/components/RegistrarViagem.js (4 ocorrências)
9. src/components/UsuariosList.js (3 ocorrências)
10. src/components/VeiculosList.js (3 ocorrências)
11. src/components/Analise.js (2 ocorrências)
12. src/components/PerformanceMotorista.js (2 ocorrências)
13. src/components/UsuarioForm.js (2 ocorrências)
14. src/components/AlterarSenha.js (1 ocorrência)
15. src/components/Dashboard.js (1 ocorrência)
16. src/components/Graficos.js (1 ocorrência)

**✅ JÁ ATUALIZADOS:**
- src/App.js
- src/components/Login.js
