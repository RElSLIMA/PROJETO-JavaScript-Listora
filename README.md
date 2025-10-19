# 📱 Listora

Aplicativo **mobile offline** para controle de compras pessoais.  
Desenvolvido com **React Native (Expo)** e **AsyncStorage**, o projeto foi criado como iniciativa de aprendizado, portfólio e demonstração de boas práticas de arquitetura e código limpo.

---

## 🚀 Objetivos do Projeto

- Registrar **itens, compras e categorias**.  
- Permitir **comparar preços**, **gerenciar quantidades** e visualizar **listas de compras**.  
- Aplicar boas práticas em **React Native**, versionamento com **Git**, e **padronização de código** (ESLint + Prettier).  
- Simular um ambiente profissional de desenvolvimento, com foco em **organização modular** e **experiência do usuário**.  

---

## 🧩 Funcionalidades Principais

- 📦 **Cadastro de produtos** — Nome, quantidade e categoria.  
- 🛒 **Lista de compras** — Visualização e registro de itens adquiridos.  
- 🔁 **Atualização automática de estoque** — Ao registrar uma compra, o estoque e o histórico de valores do item são atualizados. 
- 📊 **Controle de categorias** — Filtro e agrupamento de produtos.  
- 💾 **Modo offline** — Armazenamento local utilizando **AsyncStorage**.  
- 🧹 **Interface simples e intuitiva** — Layout limpo, responsivo e fácil de usar.  

---

## 🖥️ Telas do Aplicativo

| Tela | Descrição |
|------|------------|
| **🏠 HomeScreen.js** | Tela inicial do aplicativo. Exibe atalhos para as principais seções (estoque, lista de compras, adicionar produto). Também mostra o logotipo e o botão de limpar dados. |
| **📋 ListaCompraScreen.js** | Lista todos os produtos disponíveis para compra. Permite marcar itens como comprados e registrar valor e quantidade. |
| **📦 EstoqueScreen.js** | Exibe o inventário atual de produtos e suas quantidades. Permite editar ou excluir itens. |
| **➕ AdicionarProdutoScreen.js** | Formulário para adicionar novos produtos, com campos de nome, quantidade e categoria. Inclui validações e feedback visual. |

---

## 📂 Estrutura do Repositório

```
PROJETO-JavaScript-Listora/
├─ assets/                     # Imagens, ícones e recursos visuais
├─ src/                        
│   ├─ screens/                # Telas do aplicativo
│   │   ├─ AdicionarProdutoScreen.js
│   │   ├─ EstoqueScreen.js
│   │   ├─ HomeScreen.js
│   │   └─ ListaCompraScreen.js
│   └─ services/               # Serviços e lógica do app
│       └─ db.js               # Operações com AsyncStorage
├─ App.js                      # Arquivo principal do app (definição de rotas e contexto)
├─ package.json                # Dependências e scripts do projeto
└─ README.md                   # Documentação do projeto
```

---

## ⚙️ Tecnologias Utilizadas

| Categoria | Tecnologias |
|------------|--------------|
| **Mobile** | React Native (Expo) |
| **Armazenamento Local** | AsyncStorage |
| **Linguagem** | JavaScript (ES6+) |
| **Controle de Versão** | Git e GitHub |
| **Qualidade de Código** | ESLint, Prettier |

---

## 🧱 Arquitetura e Decisões Técnicas

- Utilização do padrão **Screens + Services**, separando a lógica de interface da lógica de dados.  
- Uso do **AsyncStorage** para persistência local, garantindo funcionamento offline sem dependência de banco de dados externo.   
- Estrutura modular, facilitando manutenção e expansão futura.  
- Uso de **Expo CLI** para build e empacotamento do aplicativo (APK).  

---

## 🧩 Backlog de Sprints

| Sprint | Descrição | Status |
|--------|------------|--------|
| **0** | Configuração do ambiente (Node.js, Expo) | ✅ Concluído |
| **1** | CRUD local de itens | ✅ Concluído |
| **2** | Ajustes de interface e validações | ✅ Concluído |
| **3** | Padronização visual e otimizações | ✅ Concluído |
| **4** | Geração de APK e testes em dispositivos reais | ✅ Concluído |
| **5** | Criação da documentação técnica e guia de uso | ✅ Concluído |

---

## 🧠 Aprendizados e Boas Práticas Aplicadas

- Estruturação modular com separação de responsabilidades (UI, lógica e dados).  
- Uso de **hooks personalizados**, **efeitos assíncronos** e **estado controlado**.  
- Boas práticas de versionamento (**Git Flow simplificado**).  
- Padronização de código e commits semânticos.  
- Criação de **interface intuitiva e responsiva**, com ênfase na usabilidade.  

---

## 📄 Licença

Este projeto está sob a licença **MIT**.  
Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## ✨ Créditos

Desenvolvido por **Gabriel Reis**  
💻 [GitHub](https://github.com/RElSLIMA) | [LinkedIn](https://www.linkedin.com/in/gabriel-reis-b8b152198/)

---

## 📦 Versão Atual

**Versão:** 1.0.3  
📅 *Última atualização:* Outubro de 2025  
📝 *Novidades:* Retrabalho na exibição e controle de quantidade de itens no estoque e na lista de compras. 

---

## 💬 Contato

Para dúvidas, sugestões ou contribuições, entre em contato via GitHub ou LinkedIn.  
> *“Um bom código é aquele que pode ser compreendido até por quem não o escreveu.”*
