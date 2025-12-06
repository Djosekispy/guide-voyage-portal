# Configuração Inicial - Admin Padrão

## 📋 Descrição

Este documento explica como configurar um administrador padrão no sistema Guide Voyage.

## 🔧 Opção 1: Via Node.js Script (Recomendado para Servidor)

### Pré-requisitos

Você precisa ter o Firebase Service Account JSON configurado. Para obter:

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Vá para "Configurações do Projeto" > "Contas de Serviço"
3. Clique em "Gerar nova chave privada"
4. Salve o arquivo JSON em um local seguro

### Usando o Script

```bash
# Com valores padrão
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json node scripts/create-admin.js

# Com valores customizados
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json node scripts/create-admin.js \
  --email seu@email.com \
  --password Sua@Senha123 \
  --name "Seu Nome"
```

### Valores Padrão

Se executado sem argumentos no modo interativo:
- **Email:** admin@guidevoyage.com
- **Senha:** Admin@123456
- **Nome:** Administrador

## 📱 Opção 2: Via Dashboard Admin (Recomendado para Desenvolvimento)

### Passos

1. Acesse o painel admin em `/admin/usuarios`
2. Clique no botão **"Criar Novo Admin"** no canto superior direito
3. Preencha os dados:
   - **Nome Completo:** Seu nome
   - **Email:** seu@email.com
   - **Senha:** Mínimo 6 caracteres
   - **Confirmar Senha:** Digite novamente
4. Clique em **"Criar Admin"**

## 🔐 Função de Alteração de Tipo de Usuário

Qualquer admin pode alterar o tipo de usuário de outro usuário diretamente na tabela:

1. Acesse `/admin/usuarios`
2. Na coluna "Tipo", clique no dropdown do usuário
3. Selecione o novo tipo:
   - **Turista:** Usuário comum que booking passeios
   - **Guia:** Profissional que oferece passeios
   - **Admin:** Administrador do sistema
4. A alteração é salva automaticamente

## ⚠️ Segurança

### Recomendações Importantes

1. **Mude a Senha Padrão**
   - Após criar o primeiro admin, faça login e mude a senha
   - Use uma senha forte com letras, números e caracteres especiais

2. **Guarde as Credenciais**
   - Não compartilhe credenciais de admin em e-mails ou mensagens não seguras
   - Use um gerenciador de senhas (Bitwarden, 1Password, etc)

3. **Limite de Admins**
   - Crie apenas o número necessário de admins
   - Revise regularmente quem tem acesso de admin

4. **Firebase Service Account**
   - O arquivo `firebase-service-account.json` contém credenciais sensíveis
   - **Nunca** commit este arquivo no git
   - Adicionar ao `.gitignore`

## 🔄 Código TypeScript para Criar Admin Programaticamente

```typescript
import { createAdminUser } from '@/mock/adminSetup';

// Criar um novo admin via código
const result = await createAdminUser(
  'email@guidevoyage.com',
  'Senha@123',
  'Nome do Admin'
);

if (result.success) {
  console.log(`Admin criado: ${result.userId}`);
} else {
  console.error(`Erro: ${result.message}`);
}
```

## 📝 Variáveis de Ambiente

Crie um arquivo `.env.local` (não commit no git):

```env
# Credenciais Firebase (você encontra no Firebase Console)
REACT_APP_FIREBASE_API_KEY=xxxxx
REACT_APP_FIREBASE_AUTH_DOMAIN=xxxxx
REACT_APP_FIREBASE_PROJECT_ID=xxxxx
REACT_APP_FIREBASE_STORAGE_BUCKET=xxxxx
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=xxxxx
REACT_APP_FIREBASE_APP_ID=xxxxx

# Script de Admin Setup
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
```

## 🐛 Troubleshooting

### "Este email já está registrado"
- O email já existe no Firebase Auth
- Use outro email ou delete o usuário anterior

### "Arquivo de credenciais não encontrado"
- Certifique-se que `firebase-service-account.json` existe
- Configure `FIREBASE_SERVICE_ACCOUNT_PATH` corretamente

### "Acesso negado ao criar admin"
- Verifique se tem permissões de Admin no Firebase
- Confirme que está usando o Service Account correto

## 📚 Referências

- [Firebase Authentication - Node.js](https://firebase.google.com/docs/auth/admin/manage-users?hl=pt-BR)
- [Firestore Admin SDK](https://firebase.google.com/docs/firestore/manage-data/add-data?hl=pt-BR)
- [Guide Voyage - Admin Panel](./admin-panel.md)
