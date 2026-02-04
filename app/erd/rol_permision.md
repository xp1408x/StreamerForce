erDiagram
  profiles {
    UUID id PK
  }

  roles {
    UUID id PK
    TEXT name
    INTEGER role_level
  }

  permissions {
    UUID id PK
    TEXT slug
    BOOLEAN is_assignable
  }

  user_roles {
    UUID user_id FK
    UUID role_id FK
    TIMESTAMPTZ expires_at
  }

  role_permissions {
    UUID role_id FK
    UUID permission_id FK
  }

  user_permission_overrides {
    UUID id PK
    UUID user_id FK
    UUID permission_id FK
    BOOLEAN is_enabled
    TIMESTAMPTZ expires_at
  }

  profiles ||--o{ user_roles : assigned
  roles ||--o{ user_roles : includes
  roles ||--o{ role_permissions : grants
  permissions ||--o{ role_permissions : assigned
  profiles ||--o{ user_permission_overrides : overrides
  permissions ||--o{ user_permission_overrides : affected
