export const SKILLS_LIST: string[] = [
  // ── Languages ──────────────────────────────────────────────────────────
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C', 'C++', 'C#', 'Go',
  'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Scala', 'Dart', 'R',
  'MATLAB', 'Perl', 'Haskell', 'Elixir', 'Clojure', 'Lua', 'Shell',
  'Bash', 'PowerShell', 'SQL', 'PL/SQL', 'COBOL', 'Fortran', 'Assembly',
  'Solidity', 'Move',

  // ── Web — Frontend ─────────────────────────────────────────────────────
  'React', 'Next.js', 'Vue.js', 'Nuxt.js', 'Angular', 'Svelte', 'SvelteKit',
  'Remix', 'Astro', 'Gatsby', 'jQuery', 'Alpine.js', 'HTMX',
  'HTML', 'CSS', 'Sass', 'SCSS', 'Less', 'Tailwind CSS', 'Bootstrap',
  'Material UI', 'Chakra UI', 'Ant Design', 'shadcn/ui', 'Radix UI',
  'Styled Components', 'Emotion', 'CSS Modules', 'Framer Motion', 'GSAP',
  'Three.js', 'D3.js', 'Chart.js', 'Recharts', 'WebGL',
  'Redux', 'Zustand', 'Jotai', 'MobX', 'Recoil', 'React Query', 'SWR',
  'RTK Query', 'Vite', 'Webpack', 'Parcel', 'Rollup', 'esbuild',

  // ── Web — Backend ──────────────────────────────────────────────────────
  'Node.js', 'Express.js', 'NestJS', 'Fastify', 'Hapi.js', 'Koa.js',
  'Django', 'Flask', 'FastAPI', 'Starlette', 'Tornado',
  'Spring Boot', 'Spring MVC', 'Micronaut', 'Quarkus', 'Jakarta EE',
  'Laravel', 'Symfony', 'CodeIgniter', 'Lumen',
  'Ruby on Rails', 'Sinatra',
  'ASP.NET Core', 'ASP.NET MVC', 'Blazor',
  'Phoenix', 'Elixir', 'Gin', 'Echo', 'Fiber',
  'GraphQL', 'REST API', 'gRPC', 'WebSocket', 'tRPC',
  'OpenAPI', 'Swagger',

  // ── Mobile ─────────────────────────────────────────────────────────────
  'React Native', 'Flutter', 'Swift (iOS)', 'Kotlin (Android)',
  'Jetpack Compose', 'SwiftUI', 'Objective-C', 'Ionic', 'Capacitor',
  'Expo', 'Android SDK', 'iOS SDK', 'Xamarin', 'MAUI',

  // ── Databases ──────────────────────────────────────────────────────────
  'MongoDB', 'PostgreSQL', 'MySQL', 'SQLite', 'MariaDB', 'Oracle DB',
  'Microsoft SQL Server', 'Redis', 'Memcached', 'Cassandra', 'DynamoDB',
  'Elasticsearch', 'OpenSearch', 'Neo4j', 'Couchbase', 'CouchDB',
  'InfluxDB', 'TimescaleDB', 'Pinecone', 'Weaviate', 'Supabase',
  'Firebase Realtime Database', 'Firestore', 'Fauna', 'PlanetScale',
  'Neon', 'Turso', 'Prisma', 'Drizzle', 'TypeORM', 'Sequelize',
  'Mongoose', 'SQLAlchemy',

  // ── Cloud & DevOps ─────────────────────────────────────────────────────
  'AWS', 'Amazon EC2', 'Amazon S3', 'Amazon RDS', 'Amazon Lambda',
  'Amazon ECS', 'Amazon EKS', 'Amazon CloudFront', 'Amazon SQS', 'Amazon SNS',
  'Amazon DynamoDB', 'Amazon Cognito', 'AWS CDK', 'AWS SAM',
  'Google Cloud Platform', 'GCP', 'Google Compute Engine', 'Google Kubernetes Engine',
  'Google Cloud Storage', 'BigQuery', 'Vertex AI', 'Cloud Run',
  'Microsoft Azure', 'Azure App Service', 'Azure Functions', 'Azure DevOps',
  'Azure Blob Storage', 'Azure Cosmos DB', 'Azure AD',
  'Docker', 'Docker Compose', 'Kubernetes', 'Helm', 'Istio', 'Envoy',
  'Terraform', 'Pulumi', 'Ansible', 'Chef', 'Puppet',
  'CI/CD', 'GitHub Actions', 'GitLab CI', 'Jenkins', 'CircleCI',
  'Travis CI', 'ArgoCD', 'Flux', 'Tekton',
  'Nginx', 'Apache HTTP Server', 'Caddy', 'HAProxy',
  'Linux', 'Ubuntu', 'CentOS', 'Debian', 'macOS', 'Windows Server',
  'Serverless', 'Vercel', 'Netlify', 'Heroku', 'Railway', 'Render',
  'Cloudflare Workers', 'Cloudflare Pages',

  // ── Data Science & ML / AI ─────────────────────────────────────────────
  'Machine Learning', 'Deep Learning', 'Natural Language Processing',
  'Computer Vision', 'Reinforcement Learning', 'Transfer Learning',
  'TensorFlow', 'PyTorch', 'Keras', 'JAX', 'Hugging Face', 'LangChain',
  'LlamaIndex', 'OpenAI API', 'Scikit-learn', 'XGBoost', 'LightGBM',
  'CatBoost', 'Pandas', 'NumPy', 'SciPy', 'Matplotlib', 'Seaborn',
  'Plotly', 'Statsmodels', 'NLTK', 'spaCy', 'Gensim', 'OpenCV',
  'Pillow', 'Albumentations', 'MLflow', 'Weights & Biases', 'DVC',
  'Airflow', 'Prefect', 'Dagster', 'Spark', 'PySpark', 'Hadoop',
  'Kafka', 'Flink', 'dbt', 'Snowflake', 'Databricks', 'Tableau',
  'Power BI', 'Looker', 'Metabase',

  // ── Security ───────────────────────────────────────────────────────────
  'Cybersecurity', 'Penetration Testing', 'Ethical Hacking', 'OWASP',
  'Network Security', 'Application Security', 'Cloud Security',
  'SIEM', 'SOC', 'Incident Response', 'Threat Modeling',
  'Cryptography', 'PKI', 'OAuth 2.0', 'OpenID Connect', 'SAML',
  'JWT', 'SSL/TLS', 'Zero Trust', 'IAM',

  // ── Testing ────────────────────────────────────────────────────────────
  'Unit Testing', 'Integration Testing', 'End-to-End Testing',
  'TDD', 'BDD', 'Jest', 'Vitest', 'Mocha', 'Chai', 'Jasmine',
  'React Testing Library', 'Enzyme', 'Playwright', 'Cypress', 'Selenium',
  'Puppeteer', 'k6', 'JMeter', 'Locust', 'JUnit', 'Mockito',
  'pytest', 'unittest', 'Postman', 'Insomnia',

  // ── Architecture & Practices ───────────────────────────────────────────
  'Microservices', 'Monorepo', 'Event-Driven Architecture',
  'Domain-Driven Design', 'CQRS', 'Event Sourcing', 'SOLID Principles',
  'Design Patterns', 'Clean Architecture', 'Hexagonal Architecture',
  'System Design', 'Distributed Systems', 'Message Queues',
  'RabbitMQ', 'Apache Kafka', 'NATS', 'Redis Pub/Sub',
  'Agile', 'Scrum', 'Kanban', 'SAFe',

  // ── Version Control & Collaboration ────────────────────────────────────
  'Git', 'GitHub', 'GitLab', 'Bitbucket', 'Jira', 'Confluence',
  'Linear', 'Notion', 'Slack', 'Microsoft Teams',

  // ── Design & UX ────────────────────────────────────────────────────────
  'UI/UX Design', 'Figma', 'Adobe XD', 'Sketch', 'InVision',
  'Adobe Illustrator', 'Adobe Photoshop', 'Framer', 'Principle',
  'User Research', 'Wireframing', 'Prototyping', 'Usability Testing',
  'Accessibility', 'WCAG', 'Design Systems', 'Storybook',

  // ── Blockchain / Web3 ──────────────────────────────────────────────────
  'Blockchain', 'Ethereum', 'Solana', 'Web3.js', 'Ethers.js', 'Hardhat',
  'Foundry', 'IPFS', 'Smart Contracts', 'DeFi', 'NFT',

  // ── Embedded & Hardware ────────────────────────────────────────────────
  'Embedded Systems', 'Arduino', 'Raspberry Pi', 'RTOS', 'FreeRTOS',
  'FPGA', 'VHDL', 'Verilog', 'IoT', 'MQTT', 'Modbus', 'CAN Bus',
  'STM32', 'ESP32', 'PIC Microcontroller',

  // ── Game Development ───────────────────────────────────────────────────
  'Unity', 'Unreal Engine', 'Godot', 'Pygame', 'OpenGL', 'Vulkan',
  'DirectX', 'WebXR', 'AR/VR',

  // ── Soft Skills ────────────────────────────────────────────────────────
  'Problem Solving', 'Critical Thinking', 'Communication', 'Teamwork',
  'Leadership', 'Time Management', 'Adaptability', 'Creativity',
  'Attention to Detail', 'Project Management', 'Mentoring',
  'Technical Writing', 'Public Speaking', 'Conflict Resolution',
  'Stakeholder Management', 'Cross-functional Collaboration',
];

export const SKILLS_SET = new Set(SKILLS_LIST.map((s) => s.toLowerCase()));

export function isKnownSkill(s: string) {
  return SKILLS_SET.has(s.toLowerCase());
}
