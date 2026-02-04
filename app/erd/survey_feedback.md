erDiagram
  profiles {
    UUID id PK
  }

  surveys {
    UUID id PK
    UUID creator_id FK
    TEXT title
  }

  survey_options {
    UUID id PK
    UUID survey_id FK
    TEXT option_text
  }

  survey_votes {
    UUID survey_id FK
    UUID user_id FK
    UUID option_id FK
  }

  profiles ||--o{ surveys : creates
  surveys ||--o{ survey_options : has
  surveys ||--o{ survey_votes : receives
  profiles ||--o{ survey_votes : votes
