erDiagram
  profiles {
    UUID id PK
  }

  game_servers {
    UUID id PK
    UUID owner_id FK
    TEXT name
    TEXT game_type
  }

  server_staff {
    UUID server_id FK
    UUID user_id FK
    TEXT role_in_server
  }

  server_roadmaps {
    UUID id PK
    UUID server_id FK
    TEXT title
    TEXT status
  }

  profiles ||--o{ game_servers : owns
  game_servers ||--o{ server_staff : staffed_by
  profiles ||--o{ server_staff : moderates
  game_servers ||--o{ server_roadmaps : plans
