# ============================================
# INSTRUÇÕES PARA CONFIGURAR A OUVIDORIA
# ============================================

## 1. CRIAR A TABELA NO SUPABASE

1. Acesse o Supabase Dashboard: https://app.supabase.com
2. Selecione seu projeto
3. Vá em "SQL Editor" no menu lateral
4. Execute o arquivo: `database/ouvidoria-setup.sql`
5. Verifique se a tabela foi criada com sucesso

## 2. CONFIGURAR VARIÁVEL DE AMBIENTE

Adicione no arquivo `.env.local` (ou `.env`):

```env
# Chave de serviço (opcional, mas recomendado para maior segurança)
# Encontre em: Settings > API > Project API keys > service_role
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
```

**IMPORTANTE:** A `service_role` key deve ser mantida em segredo e NUNCA exposta no frontend.

## 3. COMO FUNCIONA A SEGURANÇA

### Row Level Security (RLS)
O Supabase tem 4 políticas ativas na tabela `manifestacoes`:

1. **INSERT (Público)**: Qualquer pessoa pode enviar manifestações
2. **SELECT (Admin apenas)**: Apenas admins logados podem ler
3. **UPDATE (Admin apenas)**: Apenas admins podem responder
4. **DELETE (Admin apenas)**: Apenas admins podem deletar

### Server Actions
A função `enviarManifestacao` em `actions.ts` roda NO SERVIDOR, então:
- O usuário não vê a lógica no navegador
- As validações acontecem no backend
- Maior proteção contra ataques

## 4. TESTAR A FUNCIONALIDADE

1. Acesse: http://localhost:3000/ouvidoria
2. Preencha o formulário
3. Envie uma manifestação
4. Verifique no Supabase Dashboard > Table Editor > manifestacoes

## 5. VISUALIZAR MANIFESTAÇÕES (ADMIN)

Você precisará criar uma página admin para visualizar as manifestações.
Exemplo de query:

```typescript
const { data } = await supabase
  .from('manifestacoes')
  .select('*')
  .order('created_at', { ascending: false })
```

## 6. TIPOS DE MANIFESTAÇÃO

Use SEMPRE os valores sem acento:
- `reclamacao` (não "Reclamação")
- `sugestao` (não "Sugestão")
- `denuncia` (não "Denúncia")
- `elogio`

## 7. ESTRUTURA DE ARQUIVOS

```
src/app/(pages)/ouvidoria/
├── page.tsx                    # Página principal (limpa, ~90 linhas)
├── actions.ts                  # Server Action (segura)
└── _components/
    ├── types.ts               # TypeScript types
    ├── constants.tsx          # Dados estáticos
    ├── hero-section.tsx       # Seção hero
    ├── progress-indicator.tsx # Indicador de progresso
    ├── type-selector.tsx      # Seletor de tipo
    ├── identity-form.tsx      # Formulário de identidade
    ├── message-form.tsx       # Formulário de mensagem
    ├── form-navigation.tsx    # Navegação do formulário
    ├── faq-section.tsx        # FAQ
    └── success-modal.tsx      # Modal de sucesso
```

## 8. VANTAGENS DA ARQUITETURA

✅ **Modular**: Cada componente tem uma responsabilidade
✅ **Seguro**: RLS + Server Actions
✅ **Manutenível**: Fácil de adicionar/remover features
✅ **Testável**: Componentes isolados
✅ **Performático**: Code splitting automático
✅ **Responsável**: ~50 linhas por arquivo vs 539 antes

## 9. PRÓXIMOS PASSOS

- [ ] Criar página admin para visualizar manifestações
- [ ] Adicionar sistema de respostas
- [ ] Implementar notificações por e-mail
- [ ] Adicionar exportação de relatórios
