# Schema do Banco de Dados (Supabase/PostgreSQL)

O banco de dados foi modelado de forma relacional no Supabase. Como estamos utilizando o Supabase, o cliente `@supabase/supabase-js` substitui a necessidade de modelos do Mongoose no backend. A validação e a estrutura residem primariamente no próprio banco.

## Tabelas

1.  **`usuarios`**: Administradores e profissionais.
2.  **`clientes`**: Pessoas que agendam os atendimentos.
3.  **`espacos`**: Salas, consultórios, etc.
4.  **`agendamentos`**: O coração do sistema, relaciona cliente, usuário e espaço.
5.  **`bloqueios_horario`**: Férias, manutenção, etc.
6.  **`lembretes`**: Lembretes programados.
7.  **`configuracoes_agenda`**: Preferências visuais e de horário por usuário.

> As migrações completas estão aplicadas no projeto Supabase. Para ver os detalhes de campos e relacionamentos, consulte a interface do Supabase ou as tabelas acima.
