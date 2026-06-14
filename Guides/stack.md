# 🚀 System Architecture & Tech Stack

Our solution is built on a decoupled, serverless-ready architecture designed to scale seamlessly during peak Amazon traffic events (e.g., Prime Day). We prioritized native AWS integrations and AI-first development workflows to ensure high-fidelity prototyping within the 48-hour constraint.

## 💻 Frontend Layer: The Customer Experience

_We optimized for a clean, highly responsive, enterprise-grade UI that flawlessly mimics the native Amazon customer journey._

- **Framework:** **Next.js 14 (App Router)** - Enables lightning-fast client-side routing for the "SmartReturn" intercept without full page reloads.
- **Styling:** **Tailwind CSS** - Utility-first styling for rapid, highly customized UI components.
- **UI Library:** **shadcn/ui & Radix Primitives** - Accessible, unstyled components that allowed us to recreate Amazon's design tokens (buttons, modals, uploaders) in minutes.
- **Icons:** **Lucide React** - Lightweight, crisp iconography for the Product Health Card and Eco-Routing dashboards.

## ⚙️ Backend Layer: The Routing & Logic Engine

_Python-first backend to natively support AI/ML integrations while maintaining extreme microservice performance._

- **Framework:** **FastAPI (Python)** - Asynchronous, high-performance REST API generation. Chose over Node.js for native compatibility with data science and ML SDKs.
- **Data Validation:** **Pydantic** - Enforces strict schema validation for the Product Health Cards and UI payloads, preventing frontend crashes.
- **Server:** **Uvicorn** - ASGI web server implementation for Python.
- **Mock Database:** **Local JSON State** - Simulating the eventual consistency of Amazon DynamoDB for rapid MVP iteration.

## 🧠 AI & Cloud Layer: The Triage Brain

_Processing multimodal inputs securely entirely within the AWS ecosystem to guarantee customer data privacy and sub-second inference._

- **AI Engine:** **Amazon Nova Pro (`amazon.nova-pro-v1:0`)** - Amazon's flagship multimodal foundation model. Chosen for its superior spatial reasoning and defect-detection accuracy on product images.
- **Cloud Infrastructure:** **AWS Bedrock** - Serverless AI inference. Allows us to call Nova Pro without managing GPU instances.
- **Integration SDK:** **AWS SDK for Python (`boto3`)** - Utilizing the Bedrock Converse API to strictly enforce JSON-formatted outputs from the vision model.

## 🛠️ DevOps & Workflow

- **Agentic Orchestration:** **Antigravity 2.0** - Utilized parallel AI coding agents (vibecoding) to concurrently scaffold the frontend UI and backend API routes, compressing 3 days of development into 36 hours.
