# A Developer's Guide to Modular Architecture

**An Onboarding Guide for Contributing to a Scalable, Reusable, and Consistent User Interface**

### **Part 1: Foundations: Engaging with the Kubeflow Community**

Before contributing code, it is essential to understand the culture, communication norms, and governance structures of the Kubeflow project. Active participation in the community is the first step toward becoming an effective contributor.

#### **1.1 Joining the Conversation: Your First Steps**

The Kubeflow community operates across several key platforms. Integrating into these channels is critical for staying informed and collaborating.

* **Slack**: The Kubeflow Slack workspace is the hub for real-time, informal communication. It is the ideal place to ask questions, get quick feedback, and engage in day-to-day discussions.  
* **Community Calendar**: The official Kubeflow calendar contains the schedule for all public meetings, including working group syncs and community-wide calls. Attending these meetings is one of the best ways to understand the project's current priorities.

You can find the instructions under the [community section](https://www.kubeflow.org/docs/about/community/) in Kubeflow’s website.

#### **1.2 The Rules of the Road: Governance and Contribution**

Kubeflow has a [well-defined governance structure](https://www.kubeflow.org/docs/about/governance/) and a formal contribution process.

* Contributor License Agreement (CLA): Signing the CLA is a mandatory prerequisite for the acceptance of any code.  
* The Pull Request (PR) Process: All code changes are submitted via pull requests. The contribution guide in each repository specifies the expectations for PR descriptions and the review process.  
* Coding and Style Standards: The project maintains specific standards for code style, formatting, and naming conventions, enforced through automated linting and code reviews.  
* Documentation Style Guide: High-quality documentation is considered as important as high-quality code. A style guide outlines expectations for comments and user-facing documentation.

#### **1.3 Navigating the Kubeflow Codebase: A Repository Map**

This map defines the purpose of each key repository for a modular UI contributor.

| Repository | URL | Purpose & Relevance for UI Contributors |
| :---- | :---- | :---- |
| kubeflow/community | https://github.com/kubeflow/community | The central hub for all community-wide information, including governance docs, meeting notes, and roadmaps. |
| kubeflow/manifests | https://github.com/kubeflow/manifests | Contains the Kubernetes manifests for installing and configuring Kubeflow. Relevant when setting up an Integrated-Kubeflow environment. |
| opendatahub-io/kubeflow-ui-essentials | https://github.com/opendatahub-io/kubeflow-ui-essentials | CRITICAL: The shared library for common React components, hooks, themes, and BFF utilities. You will import from this library. |
| kubeflow/model-registry | https://github.com/kubeflow/model-registry | The upstream repository for the Model Registry feature, a prime example of the modular architecture. A key repository for hands-on contribution. |
| kubeflow/notebooks | https://github.com/kubeflow/notebooks | The upstream repository for the Notebooks feature. Another key repository for contribution. |

### **Part 2: The Modular Architecture: A Conceptual Deep Dive**

This section details the core principles and the technological choices that underpin the new modular paradigm.

#### **2.1 Core Architectural Pillars**

The foundation rests on three key patterns: Micro-Frontends (MFE), the Backend-for-Frontend (BFF), and a Shared Essentials Library.

* Pillar 1: **Micro-Frontends (MFE)**: The UI is decomposed into a collection of smaller, self-contained micro-frontends. Each MFE is a standalone web application, allowing teams to develop, test, and deploy their MFEs independently.  
* Pillar 2: **The Backend-for-Frontend (BFF)**: Each MFE is supported by its own dedicated BFF. The BFF is a server-side layer that acts as a purpose-built intermediary, abstracting away complexity and tailoring an API specifically for its frontend.  
* Pillar 3: **The kubeflow-ui-essentials Shared Library**: This centralized shared library promotes code reuse and enforces consistency across all modules, containing assets for both frontends (React components, hooks, themes) and BFFs (reusable Golang packages).

#### **2.2 The Recommended Technology Stack**

* Frontend Framework: React Its component-based model is a natural fit for building encapsulated and reusable micro-frontends.  
* Component Library: Patternfly A standardized component library to maintain a consistent look and feel, with an extensibility design to allow for theming and style overrides.  
* BFF Language: Golang Go is the language of choice for building high-performance, concurrent, and lightweight BFF layers.

### **Part 3: Setting Up Your Development Environment**

This section is a hands-on guide for setting up your local environment.

#### **3.1 Prerequisites and Foundational Learning**

Ensure git, node.js (with npm/yarn), go, docker, and kubectl are installed. For those new to the stack, exploring the official documentation for JavaScript, React, TypeScript, and Golang is highly recommended.

#### **3.2 A Comparative Guide to Development & Deployment Modes**

Developers should perform the vast majority of work in Standalone Mode and progressively move to more integrated modes for validation.

| Attribute | Standalone Mode | Kubeflow Mode | Federated Mode (RHOAI) |
| :---- | :---- | :---- | :---- |
| Primary Use Case | Local UI Development & Iteration | Platform Integration Testing | Product-Level Integration (RHOAI) |
| Target Environment | Developer's local machine | A running Kubeflow cluster | A running Red Hat OpenShift AI (RHOAI) cluster |
| UI Serving | The BFF process | Kubeflow Ingress | The main RHOAI Dashboard (federated) |
| Authentication | Mocked: Uses kubeflow-user header | Real: Handled by Kubeflow's central auth | Real: Handled by the host platform's auth system |
| Key Benefit | Maximum Speed: No cluster dependency | High Fidelity: Tests against real platform services | Full Validation: Ensures product compatibility |

### **Part 4: The Contributor's Workflow: From Code to Contribution**

This section provides a practical, step-by-step guide to the development process.

#### **4.1 The "Upstream-First" Philosophy in Practice**

"Upstream-First" dictates that all new, reusable feature logic must be developed and merged into the upstream, platform-agnostic repositories before any work begins on downstream-specific integrations. This discipline is essential for preventing feature fragmentation.

#### **4.2 A Step-by-Step Guide to Local Development (Standalone Mode)**

1. Clone the Repositories: Clone the repository for the micro-frontend you will work on (e.g., model-registry) and the kubeflow-ui-essentials library.  
2. Install Frontend Dependencies: Navigate to the frontend directory and run npm install or yarn install.  
3. Run the BFF: In a separate terminal, navigate to the backend directory and start the BFF server (e.g., go run ./cmd/bff/...).  
4. Run the Frontend: Return to the frontend directory and start the React development server (npm start or yarn start).  
5. Access the UI: Open a web browser to the localhost URL provided by the React development server.

#### **4.3 Testing Your Contributions**

* Unit & Integration Testing: Use Jest for JavaScript unit testing of individual components and hooks. Use Cypress for frontend integration testing in a real browser to simulate user flows.  
* End-to-End (E2E) Testing: E2E tests validate entire user journeys across the full application stack and are typically run in more complex environments like the Integrated-Kubeflow Mode.

#### **4.4 The Migration Path for Existing Features**

For migrating legacy features to the new architecture, a 7-step process is recommended:

1. Define API Contract: Audit interactions to create a formal OpenAPI specification for the new BFF.  
2. Adopt Upstream-First Workflow: Integrate with the upstream project's community and processes.  
3. Scaffold the New Module: Initialize a new repository using the standard modular architecture template.  
4. Build BFF Endpoints: Develop the skeleton of all BFF API endpoints from the OpenAPI spec.  
5. Port the Frontend UI: Systematically migrate the existing UI, utilizing the kubeflow-ui-essentials library.  
6. Implement BFF Business Logic: Flesh out the BFF endpoints with business logic to handle data and communicate with backend services.  
7. Integrate into Downstream: Once complete and tested, integrate the new module into the main application, replacing the legacy version.

### **Part 5: Advanced Topics and Future Directions**

#### **5.1 Deep Dive: Authentication**

The UI itself does not contain complex authentication logic. Access is protected by a gateway that issues a token or cookie. When the frontend calls its BFF, the token is passed along. The BFF is responsible for validating this credential, introspecting it to identify the user, and enriching requests to downstream services.

#### **5.2 Case Study: The Model Registry Implementation**

The Model Registry feature is the canonical reference implementation of the modular architecture. Its development followed the "Upstream-First" philosophy, it is built as a distinct MFE with its own BFF, and it heavily utilizes the kubeflow-ui-essentials library. It is designed to be deployable in all three modes.
