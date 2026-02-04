erDiagram
  profiles {
    UUID id PK
  }

  streamers {
    UUID id PK
  }

  game_servers {
    UUID id PK
  }

  shop_products {
    UUID id PK
    UUID server_id FK
    UUID streamer_id FK
    TEXT name
    INTEGER price_credits
  }

  purchases {
    UUID id PK
    UUID user_id FK
    UUID product_id FK
    INTEGER amount_paid
  }

  game_servers ||--o{ shop_products : sells
  streamers ||--o{ shop_products : promotes
  profiles ||--o{ purchases : buys
  shop_products ||--o{ purchases : purchased
