# CloudScale - Cloud Infrastructure Monitoring & Auto Scaling Dashboard

[![SRS Document](https://img.shields.io/badge/Documentation-Software%20Requirements%20Specification%20(SRS)-2563eb?style=for-the-badge&logo=googledocs&logoColor=white)](docs/SRS.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-10b981?style=for-the-badge)](LICENSE)
[![React 18](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![AWS Architecture](https://img.shields.io/badge/AWS-EC2%20ASG%20%7C%20ALB%20%7C%20RDS-ff9900?style=for-the-badge&logo=amazonwebservices&logoColor=white)](https://aws.amazon.com/)

CloudScale is an enterprise-grade cloud observability dashboard designed to demonstrate **CPU-based EC2 Auto Scaling**, **AWS Application Load Balancers (ALB)**, **Spring Boot microservices**, **Amazon RDS for MySQL**, **GitHub Actions CI/CD pipelines**, and **API Rate Limiting**.

The application is built with **React + Vite**, featuring custom interactive simulations for traffic spikes, auto-scaling policy triggers, deployment pipelines, and token-bucket rate limiting—with zero external CSS framework dependencies.

> 📄 **Official Software Requirements Specification (SRS)**: The complete IEEE 830 / ISO/IEC/IEEE 29148 specification is available in Markdown format at [docs/SRS.md](docs/SRS.md) (or root [SRS.md](SRS.md)) and as a formatted Word document at [docs/CloudScale_SRS_Document.docx](docs/CloudScale_SRS_Document.docx).

---

## 1. Architecture & Simulation Overview

CloudScale runs with high-fidelity frontend simulations while offering an Axios service layer ready for live Spring Boot backend integration.

```
                           +--------------------------------+
                           |   CloudScale React Frontend    |
                           |   (Vite + Router DOM + CSS)    |
                           +---------------+----------------+
                                           |
                                  Axios Service Layer
                          (src/services/api.js + Mock Fallback)
                                           |
    +--------------------+-----------------+--------------------+--------------------+
    |                    |                                      |                    |
    v                    v                                      v                    v
+---------+    +-------------------+                  +-------------------+    +-----------+
| AWS EC2 |    |  Application Load |                  |    Amazon RDS     |    |  GitHub   |
| Auto    |    |     Balancer      |                  |     for MySQL     |    |  Actions  |
| Scaling |    |    (ALB Ingress)  |                  | (Multi-AZ Cluster)|    |   CI/CD   |
+---------+    +-------------------+                  +-------------------+    +-----------+
    |                    |                                      |                    |
    +---> CPU Tracking   +---> HTTP 200/429/500                 +---> Active Conns   +---> 5-Stage
          Threshold 70%        Target Group Routing                   Replica Lag          Pipeline
```

### What is Simulated vs. Future Backend

| Component | Current State (Simulation Mode) | Future Live Backend Target |
| :--- | :--- | :--- |
| **EC2 Auto Scaling** | In-browser state tracking capacity (Min: 2, Desired: 4, Max: 10). Terminating an instance triggers automatic replenishment after 4 seconds. | AWS Application Auto Scaling API + CloudWatch Alarm trigger. |
| **Application Load Balancer** | Synthetic request distribution, target group health status, and live response time calculations. | AWS Application Load Balancer target group telemetry & CloudWatch metrics. |
| **Spring Boot Telemetry** | Simulated JVM Heap, thread pool metrics, and HikariCP connection states. | Spring Boot 3.x Actuator (`/actuator/prometheus`, `/actuator/health`). |
| **Amazon RDS MySQL** | Multi-AZ status, connection pool utilization (412 / 2000), and replica lag metrics. | Amazon CloudWatch RDS metrics (`DatabaseConnections`, `CPUUtilization`). |
| **Traffic Load Simulator** | Synthetic in-browser traffic generator with configurable RPS, concurrency, and duration. | Backend load generation worker or distributed Locust / k6 runner. |
| **GitHub Actions Pipeline** | Interactive 5-stage pipeline animation (Checkout, Build, Test, Package, Deploy) with realistic runner logs. | GitHub REST API (`GET /repos/{owner}/{repo}/actions/runs`). |
| **API Rate Limiter** | Client-side Token Bucket simulator with live burst generator and HTTP 429 response counters. | Spring Cloud Gateway with Redis-backed Token Bucket rate limiter. |

---

## 2. Directory Structure

```
cloudscale-app/
├── public/
│   └── favicon.svg
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── ChartCard.jsx          # Reusable wrapper for Recharts with info tooltips
│   │   ├── DataTable.jsx          # Sortable, filterable, paginated data table
│   │   ├── EmptyState.jsx         # Clean fallback state for empty lists
│   │   ├── LoadingState.jsx       # Animated loading indicator
│   │   ├── Modal.jsx              # Accessible modal dialog with backdrop dismiss
│   │   ├── Sidebar.jsx            # Dark navy sidebar with responsive mobile drawer
│   │   ├── StatCard.jsx           # KPI metrics card with trend indicators
│   │   ├── StatusBadge.jsx        # Semantic status indicators (healthy, warning, danger)
│   │   ├── Toast.jsx              # Notification toast manager
│   │   └── Topbar.jsx             # Region, Environment, Notifications, and Meta bar
│   ├── context/
│   │   └── AppContext.jsx         # Shared application state and simulated cloud actions
│   ├── data/
│   │   └── mockData.js            # Initial EC2, ASG, RDS, ALB, CI/CD mock fixtures
│   ├── hooks/
│   │   └── useLocalStorage.js     # Persistent settings hook
│   ├── layouts/
│   │   └── DashboardLayout.jsx    # Application shell
│   ├── pages/
│   │   ├── Deployments.jsx        # CI/CD pipeline overview & demo deployment runner
│   │   ├── Instances.jsx          # EC2 fleet management with details modal
│   │   ├── Monitoring.jsx         # CloudWatch metric graphs & incident alert center
│   │   ├── Overview.jsx           # Main KPI dashboard with infrastructure status
│   │   ├── RateLimiting.jsx       # Token Bucket visualizer & burst tester
│   │   ├── ScalingPolicies.jsx    # ASG target tracking configuration & event audit
│   │   ├── Settings.jsx           # Preferences, region defaults, backend connection test
│   │   └── TrafficTesting.jsx     # Synthetic load testing runner with live RPS chart
│   ├── services/
│   │   └── api.js                 # Axios API client with automatic mock fallbacks
│   ├── utils/
│   │   └── formatters.js          # Numbers, percentages, bytes, and timestamp formatters
│   ├── App.jsx                    # Route mapping
│   ├── index.css                  # Custom enterprise plain CSS design system
│   └── main.jsx                   # React root entrypoint
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## 3. Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/cloudscale-corp/cloudscale-frontend.git
cd cloudscale-frontend

# Install dependencies
npm install --legacy-peer-deps
```

### Running Locally (Development Mode)

```bash
npm run dev
```

The application will start at `http://localhost:3000`.

### Production Build

```bash
npm run build
```

To preview the production bundle locally:

```bash
npm run preview
```

---

## 4. Interactive Feature Testing Checklist

Use this checklist to verify every interactive capability in CloudScale:

- [x] **Global Topbar Navigation**:
  - Switch AWS Region (`us-east-1`, `us-west-2`, `eu-west-1`, `ap-southeast-1`) — triggers toast notification and refreshes telemetry.
  - Switch Environment (`Development`, `Staging`, `Production`) — context pill updates.
  - Click the **Refresh Button** (rotating arrows) — re-samples mock metrics with animated rotation.
  - Click the **Notification Bell** — opens the alert dropdown drawer showing active CloudWatch alerts.
  - Click the **Profile Avatar** — shows IAM role and security links.
  - On mobile/tablet screens (&lt;1024px), click the hamburger icon to toggle the sidebar drawer.

- [x] **Overview Dashboard (`/`)**:
  - Review 4 KPI cards with status trends.
  - Switch resolution buttons (`15m`, `1h`, `6h`, `24h`) — updates both the CPU AreaChart and ALB Throughput LineChart.
  - Hover over the CPU chart to inspect the 70% Auto Scaling threshold reference line.
  - Inspect the **Infrastructure Components Health** panel (ALB, Spring Boot, RDS MySQL, Auto Scaling Group, CI/CD).

- [x] **Instances Management (`/instances`)**:
  - Search by instance ID (e.g., `i-0d14`), name, or IP address in the search box.
  - Filter instances using the **Health Filter** dropdown (`Healthy`, `Warning`, `Unhealthy`).
  - Sort columns by clicking table headers (Instance ID, Name, CPU Utilization, Type).
  - Click any instance ID or the **Eye** action button to open the **Instance Details Modal**.
  - Click the **Reboot** action icon — instance enters warning state and self-heals after 3 seconds.
  - Click the **Terminate** action icon — instance is removed from local state, and the simulated Auto Scaling Group automatically provisions and registers a replacement instance after 4 seconds.

- [x] **Traffic Testing Simulator (`/traffic-testing`)**:
  - Select target endpoint (`/api/v1/orders/checkout`, `/api/v1/products`, etc.).
  - Adjust Request Budget (e.g., 1000), Concurrency (e.g., 45), and Duration (e.g., 30s).
  - Click **Start Load Simulation** — watch live request counters, success/throttled counters, and the live Requests per Second (RPS) AreaChart update every second.
  - Notice HTTP 429 status code bars increase when concurrency exceeds 40.
  - Click **Halt Test** or **Reset Counters** at any time.

- [x] **Scaling Policies (`/scaling-policies`)**:
  - Click **Edit Policy** to edit Min Capacity, Desired Capacity, Max Capacity, Target CPU %, and Cooldowns.
  - Submit the form — inputs validate and save to local state.
  - Review the visual **Scaling Mechanics Threshold Bar** (&lt;45% Scale-In, 45-70% Optimal, &gt;70% Scale-Out).
  - Inspect the **Auto Scaling Lifecycle Events** table.

- [x] **Monitoring & Alerts (`/monitoring`)**:
  - Inspect dual-axis Compute Resources chart (EC2 CPU + JVM Memory) and Latency vs. 5xx Error Rate chart.
  - Filter alerts by severity chip (`Critical`, `Warning`, `Info`).
  - Click **Acknowledge** (checkmark) or **Dismiss** (trash icon) to update alert states in local storage.

- [x] **Deployments CI/CD (`/deployments`)**:
  - Click **Run Demo Deployment** — watch the 5-stage pipeline progress in real time (Checkout &rarr; Build &rarr; Test &rarr; Package &rarr; Deploy) with animated spinners and terminal logs.
  - Upon completion, a new production release is appended to the deployment history table.

- [x] **API Rate Limiting (`/rate-limiting`)**:
  - Adjust the burst size slider/input and click **Fire Burst (Demo)** — tokens in the Token Bucket drop and HTTP 429 counters increment.
  - Review the endpoint-level quota consumption table.
  - Read the educational panel detailing standard RFC 6585 headers (`Retry-After`, `X-RateLimit-Limit`, `X-RateLimit-Remaining`).

- [x] **Settings & Integrations (`/settings`)**:
  - Adjust Default Region, Time Range, Auto-Refresh Interval, and Notification Toggles.
  - Click **Save Preferences** — values are stored in `localStorage` and persist across page reloads.
  - Enter a backend URL and click **Test Connection** — verifies connection handling with graceful offline fallback.
  - Click **Reset All Demo Data** to return all simulation states back to defaults.

---

## 5. Future Spring Boot Backend REST Endpoints

When transitioning from mock telemetry to a live Spring Boot backend, implement the following REST endpoints:

### Core Infrastructure & Health
- `GET /api/health`
  - Returns: `{ status: "UP", database: "UP", loadBalancer: "HEALTHY", version: "v2.4.1" }`
- `GET /api/infrastructure`
  - Returns detailed health for ALB, Spring Boot cluster, RDS MySQL, and ASG.

### EC2 Fleet Management
- `GET /api/instances`
  - Returns: List of EC2 instances queried from AWS EC2 SDK (`DescribeInstances`) or Spring Cloud AWS.
- `POST /api/instances/{instanceId}/reboot`
  - Dispatches EC2 `RebootInstances` action.
- `DELETE /api/instances/{instanceId}`
  - Dispatches EC2 `TerminateInstances` action.

### Observability & Metrics
- `GET /api/metrics?range={15m|1h|6h|24h}`
  - Queries AWS CloudWatch (`GetMetricData`) for `CPUUtilization`, `RequestCount`, `TargetResponseTime`, and `HTTPCode_Target_5XX_Count`.
- `GET /api/alerts`
  - Fetches active CloudWatch Alarms (`DescribeAlarms`).
- `PUT /api/alerts/{alertId}/acknowledge`
  - Marks alarm as acknowledged by engineer.

### Auto Scaling Policies
- `GET /api/scaling/policy`
  - Returns active Target Tracking configuration from AWS Auto Scaling.
- `PUT /api/scaling/policy`
  - Calls AWS Auto Scaling `PutScalingPolicy` with updated CPU target and cooldown parameters.
- `GET /api/scaling/events`
  - Fetches Auto Scaling scaling activity history (`DescribeScalingActivities`).

### CI/CD Deployments
- `GET /api/deployments`
  - Returns recent workflow runs via GitHub REST API.
- `POST /api/deployments/trigger`
  - Dispatches `workflow_dispatch` event to GitHub Actions.

### Rate Limiting & Gateway
- `GET /api/rate-limiting/stats`
  - Returns token consumption metrics from Redis / Spring Cloud Gateway.
- `PUT /api/rate-limiting/config`
  - Updates rate limit quotas dynamically in Redis.

---

## 6. Security Considerations
- **No Secrets in Frontend**: AWS access keys, RDS MySQL root passwords, and GitHub tokens are **never** bundled or saved in client-side code or `localStorage`.
- **Backend Delegation**: All future AWS SDK calls must be made server-side by the Spring Boot backend utilizing IAM Roles for EC2 / ECS (IRSA).
