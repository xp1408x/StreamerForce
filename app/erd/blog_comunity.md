erDiagram
  profiles {
    UUID id PK
  }

  article_categories {
    UUID id PK
    TEXT name
    TEXT slug
  }

  articles {
    UUID id PK
    UUID author_id FK
    UUID category_id FK
    TEXT title
  }

  article_comments {
    UUID id PK
    UUID article_id FK
    UUID user_id FK
    UUID parent_id FK
  }

  article_favorites {
    UUID user_id FK
    UUID article_id FK
  }

  profile_follows {
    UUID follower_id FK
    UUID following_id FK
  }

  article_categories ||--o{ articles : categorizes
  profiles ||--o{ articles : writes
  articles ||--o{ article_comments : has
  profiles ||--o{ article_comments : writes
  profiles ||--o{ article_favorites : likes
  articles ||--o{ article_favorites : favored
  profiles ||--o{ profile_follows : follows
