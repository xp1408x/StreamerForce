erDiagram
  profiles {
    UUID id PK
  }

  streamers {
    UUID id PK
    UUID profile_id FK
    TEXT name
    TEXT slug
  }

  stream_schedules {
    UUID id PK
    UUID streamer_id FK
  }

  streamer_socials {
    UUID id PK
    UUID streamer_id FK
    TEXT platform
  }

  profiles ||--o{ streamers : owns
  streamers ||--o{ stream_schedules : schedules
  streamers ||--o{ streamer_socials : links
