erDiagram
  auth_users {
    UUID id PK
  }

  profiles {
    UUID id PK
    TEXT username
    TEXT display_name
    TEXT avatar_url
  }

  audit_logs {
    UUID id PK
    UUID actor_id FK
    UUID target_user_id
    TEXT action
    TEXT table_name
  }

  user_game_identities {
    UUID id PK
    UUID user_id FK
    TEXT game_key
    TEXT game_identifier
  }

  wallets {
    UUID user_id PK
    INTEGER balance_credits
  }

  auth_users ||--o{ profiles : owns
  auth_users ||--o{ audit_logs : acts
  profiles ||--o{ user_game_identities : links
  profiles ||--|| wallets : owns
