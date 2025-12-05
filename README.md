# Explorar Angola - Plataforma de Turismo

## 📌 Visão Geral

O **Explorar Angola** é uma plataforma web completa desenvolvida para promover o potencial turístico de Angola, conectando viajantes com guias locais e pacotes turísticos em todas as 18 províncias do país.

![Captura de Ecrã da Aplicação](https://i.imgur.com/JYhRZxP.jpg)

## ✨ Funcionalidades

### Para Viajantes
- **Explorar Destinos**: Descubra as 18 províncias angolanas com informações detalhadas
- **Encontrar Guias Locais**: Conecte-se com guias turísticos certificados em cada região
- **Pacotes Turísticos**: Acesse experiências e atividades cuidadosamente selecionadas
- **Galeria Interativa**: Carrosséis de imagens com visualização em modal para cada destino
- **Filtros Avançados**: Busque por localização, preço, duração e avaliações

### Para Guias Turísticos
- **Perfil Profissional**: Crie e gerencie seu perfil de guia turístico
- **Publicar Pacotes**: Ofereça seus serviços e experiências turísticas
- **Gestão de Reservas**: Aceite e organize reservas de clientes
- **Avaliações**: Receba feedback dos viajantes

## 🛠️ Tecnologias Utilizadas

- **Frontend**: 
  - React.js com TypeScript
  - Tailwind CSS
  - Shadcn/ui (Componentes UI)
  - React Router

- **Backend**:
  - Firebase (Firestore Database)
  - Autenticação com Google e Email/Senha

- **Ferramentas**:
  - Vite (Build Tool)
  - ESLint + Prettier
  - Git + GitHub

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js (v16 ou superior)
- npm ou yarn
- Conta no Firebase

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/Djosekispy/guide-voyage-portal.git
```

2. Instale as dependências:
```bash
cd guide-voyage-portal
yarn install
```

3. Configure o Firebase:
- Crie um arquivo `.env` na raiz do projeto com suas credenciais do Firebase

4. Inicie o servidor de desenvolvimento:
```bash
yarn dev
```

## 🤝 Como Contribuir

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📜 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.


#TAREFAS EM FALTA
- O Admin ao clicar em mensagens no painel , nao deve ir noutra pagina , deve abrir as mensagens mesmo ali na forma de outros menus aside com  o conteudo na direita
- Adiconar formulario e a função de actualizar dados bancarios do guia no menu de facturamento
- implementar a pagina e as funcoes de definicoes do menu definicoes no painel de guia
- Fazer a pagina de gestao de passeis do guia funcionar perfeitamente com os dados vindo do banco de dados, e permitir editar e tudo mais
- na pagina do perfil do guia na secção de passeios, a descricao deve ser reduzida, adiconar a opcao de ver mais e as imagens do pacote de ser um slaide show
- A pagina de destino também tem de ser dinamica, me refiro os numeros de guias, tudo esta estatico, deve ser dinamico
- Os botoes de torne-se um guia so deve aparecer se o usuario logado nao for guia.
- O guia logado nao pode ver o botao fazer reserva ou favoritar, nao pode fazer nada que demostre interacao com outros guias
