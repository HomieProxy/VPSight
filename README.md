
# VPSight - VPS Monitoring Dashboard

[![Docker Image CI](https://github.com/HomieProxy/VPSight/actions/workflows/docker-publish.yml/badge.svg)](https://github.com/HomieProxy/VPSight/actions/workflows/docker-publish.yml)

VPSight is a Next.js application designed to monitor and manage your Virtual Private Servers (VPS). It provides a user-friendly dashboard to view real-time metrics and an admin panel for server management.

## Features

*   **Real-time Monitoring:** (Agent-based, agent not included in this repo) View CPU, RAM, Disk, Network usage, and more.
*   **Admin Panel:** Securely manage VPS entries, generate agent installation commands, and view billing information.
*   **Dark Mode:** User-friendly interface with theme toggling.
*   **Dockerized:** Easy to deploy using Docker and Docker Compose.
*   **SQLite Backend:** Uses SQLite for simple data persistence.

## Prerequisites

*   [Docker](https://www.docker.com/get-started)
*   [Docker Compose](https://docs.docker.com/compose/install/) (usually included with Docker Desktop)

## 🚀 One-Click Install (Docker Compose)

This is the recommended way to get VPSight up and running quickly.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/HomieProxy/VPSight.git
    cd VPSight
    ```

2.  **(Optional but Recommended) Create a `.env` file:**
    Create a file named `.env` in the root of the project directory and set your desired admin credentials and other configurations. Docker Compose will automatically use this file.

    Example `.env` file:
    ```env
    # Server Port (inside container, usually no need to change)
    PORT=3000

    # Initial Admin Credentials (will be used if no admin exists in the database)
    INITIAL_ADMIN_USERNAME=myadmin
    INITIAL_ADMIN_PASSWORD=a_very_strong_password_123!

    # Public URL of the application (used for generating agent install commands)
    # This should match the host and port you access the app from.
    NEXT_PUBLIC_APP_URL=http://localhost:9002

    # Node Environment
    NODE_ENV=production
    ```
    *   **Important:** If you set `INITIAL_ADMIN_PASSWORD` to something other than `changeme`, ensure you do it *before* the first run, or delete the `db/vpsight.sqlite` file to allow the new credentials to take effect on a fresh database.

3.  **Run with Docker Compose:**
    ```bash
    docker compose up -d --build
    ```
    *   `--build`: Forces Docker to rebuild the image if there are changes to the `Dockerfile` or application code.
    *   `-d`: Runs the containers in detached mode (in the background).

4.  **Access VPSight:**
    Open your browser and navigate to `http://localhost:9002`.

5.  **Admin Login:**
    *   Navigate to `http://localhost:9002/admin/login`.
    *   Use the credentials you set in the `.env` file or the defaults:
        *   Username: `admin` (or `INITIAL_ADMIN_USERNAME` from `.env`)
        *   Password: `changeme` (or `INITIAL_ADMIN_PASSWORD` from `.env`)
    *   **It is highly recommended to change the default password immediately if you haven't set it via `.env`!**

## Configuration (Environment Variables)

The application uses the following environment variables, configurable via the `.env` file when using Docker Compose:

*   `PORT`: The port the Next.js application listens on inside the container (default: `3000`).
*   `INITIAL_ADMIN_USERNAME`: The username for the initial admin account created if no admin exists (default: `admin`).
*   `INITIAL_ADMIN_PASSWORD`: The password for the initial admin account (default: `changeme`). **Please change this for any non-trivial use!**
*   `NEXT_PUBLIC_APP_URL`: The public-facing URL of the application, including protocol, host, and port (e.g., `http://localhost:9002` or `https://yourdomain.com`). This is used by the admin panel to generate the correct agent installation command.
*   `NODE_ENV`: Set to `production` for optimized builds.

## Database

*   VPSight uses **SQLite** as its database.
*   When running with Docker Compose, the database file (`db/vpsight.sqlite`) is stored in a `./db` directory on your host machine, mapped as a volume into the container. This ensures your data persists even if the container is stopped or removed.
*   If you need to reset the database (e.g., to re-initialize the admin user with new credentials from `.env`), stop the containers (`docker compose down`) and delete the `db/vpsight.sqlite` file before starting them again.

## Local Development (Without Docker)

If you prefer to run the application directly without Docker for development:

1.  **Install Node.js and npm:** Ensure you have Node.js (v18 or later recommended) and npm installed.
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Set up environment variables:**
    Create a `.env.local` file in the project root and add necessary variables:
    ```env
    INITIAL_ADMIN_USERNAME=admin
    INITIAL_ADMIN_PASSWORD=devpassword
    NEXT_PUBLIC_APP_URL=http://localhost:9002
    ```
4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:9002`.
    The Genkit development server (if used) can be started with `npm run genkit:dev`.

## Building and Running Docker Image Manually

1.  **Build the Docker image:**
    ```bash
    docker build -t vpsight-app .
    ```
2.  **Run the Docker container:**
    ```bash
    docker run -d -p 9002:3000 \
      -v $(pwd)/db:/app/db \
      -e PORT=3000 \
      -e INITIAL_ADMIN_USERNAME=admin \
      -e INITIAL_ADMIN_PASSWORD=yoursecurepassword \
      -e NEXT_PUBLIC_APP_URL=http://localhost:9002 \
      --name vpsight_manual vpsight-app
    ```

## GitHub Actions CI

This repository includes a GitHub Actions workflow (`.github/workflows/docker-publish.yml`) that automatically builds and pushes a Docker image to the GitHub Container Registry (`ghcr.io/HomieProxy/VPSight`) whenever changes are pushed to the `main` branch.

## Tech Stack

*   Next.js (App Router)
*   React
*   TypeScript
*   Tailwind CSS
*   ShadCN UI
*   SQLite (`better-sqlite3`)
*   Genkit (for AI, if features are added)
*   Docker

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue.

## License

This project is open-source. (You can add a specific license file like `LICENSE.md` if you wish).
