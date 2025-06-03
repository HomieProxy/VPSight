
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

## Getting Started

There are a few ways to run VPSight using Docker.

### Option 1: One-Click Install with Docker Compose (Recommended)

This method builds the Docker image locally and runs it.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/HomieProxy/VPSight.git
    cd VPSight
    ```

2.  **(Optional but Recommended) Create a `.env` file:**
    Create a file named `.env` in the root of the project directory. Docker Compose will automatically use this file to set environment variables.

    Example `.env` file:
    ```env
    # Server Port (inside container, Next.js app listens on this port)
    PORT=3000

    # Initial Admin Credentials (used if no admin exists in the database)
    INITIAL_ADMIN_USERNAME=myadmin
    INITIAL_ADMIN_PASSWORD=a_very_strong_password_123!

    # Public URL of the application
    # This is the URL users and agents will use to access VPSight from their browser or server.
    # For local testing with default docker-compose settings, this is http://localhost:9002
    # (host port 9002 is mapped to container port 3000).
    # If deployed, change this to your actual public domain/IP and port.
    NEXT_PUBLIC_APP_URL=http://localhost:9002

    # Node Environment
    NODE_ENV=production
    ```
    *   **Important:** If you set `INITIAL_ADMIN_PASSWORD`, do it *before* the first run, or delete the `db/vpsight.sqlite` file to allow the new credentials to take effect on a fresh database.

3.  **Run with Docker Compose:**
    ```bash
    docker compose up -d --build
    ```
    *   `--build`: Forces Docker to rebuild the image if there are changes to the `Dockerfile` or application code.
    *   `-d`: Runs the containers in detached mode (in the background).

4.  **Access VPSight:**
    Open your browser and navigate to `http://localhost:9002` (or the host port you configured if you changed the `docker-compose.yml` port mapping).

### Option 2: Pulling and Running Pre-built Image from GitHub Container Registry

This method uses the Docker image automatically built and pushed by GitHub Actions. It's useful if you don't want to build the image locally.

1.  **(Optional but Recommended) Create a `db` directory and a `.env` file:**
    If you want to persist data and customize credentials, create a `db` directory in your current path:
    ```bash
    mkdir db
    ```
    Then, create a file named `.env` (in the same directory where you run the `docker run` command) with your desired settings (see example in Option 1). The `docker run` command below will use it if you include the `--env-file .env` flag.

2.  **Pull the latest image:**
    ```bash
    docker pull ghcr.io/HomieProxy/VPSight:latest
    ```

3.  **Run the image:**
    ```bash
    docker run -d -p 9002:3000 \
      -v $(pwd)/db:/app/db \
      --env-file .env \
      --name vpsight_pulled ghcr.io/HomieProxy/VPSight:latest
    ```
    *   `-p 9002:3000`: Maps port 9002 on your host to port 3000 in the container.
    *   `-v $(pwd)/db:/app/db`: Mounts a `db` directory from your current path into the container for database persistence.
    *   `--env-file .env`: (Optional) Loads environment variables from a `.env` file in your current directory. Alternatively, you can set them with multiple `-e` flags (e.g., `-e INITIAL_ADMIN_USERNAME=admin -e INITIAL_ADMIN_PASSWORD=secret ...`).
    *   Make sure `NEXT_PUBLIC_APP_URL` in your `.env` file (or `-e` flag) correctly reflects how you'll access the app (e.g., `http://localhost:9002`).

4.  **Access VPSight:**
    Open your browser and navigate to `http://localhost:9002`.

## Admin Login

*   Navigate to `http://localhost:9002/admin/login` (or your configured `NEXT_PUBLIC_APP_URL` + `/admin/login`).
*   Use the credentials:
    *   Username: `admin` (or `INITIAL_ADMIN_USERNAME` from your environment setup)
    *   Password: `changeme` (or `INITIAL_ADMIN_PASSWORD` from your environment setup)
*   **It is highly recommended to change the default password immediately if you haven't set a custom one!**

## Configuration (Environment Variables)

The application uses the following environment variables. When using Docker Compose, these are typically set in the `.env` file. When using `docker run`, they can be passed with `--env-file` or multiple `-e` flags.

*   `PORT`: The port the Next.js application listens on *inside* the container (default: `3000`). You usually don't need to change this.
*   `INITIAL_ADMIN_USERNAME`: The username for the initial admin account created if no admin exists (default: `admin`).
*   `INITIAL_ADMIN_PASSWORD`: The password for the initial admin account (default: `changeme`). **Please change this for any non-trivial use!**
*   `NEXT_PUBLIC_APP_URL`: The public-facing URL of the application, including protocol, host, and port (e.g., `http://localhost:9002` for local Docker setups, or `https://yourdomain.com` for a public deployment). This is used by the admin panel to generate the correct agent installation command. The port specified here (e.g., `9002`) should be the port *exposed on your host machine*, which is then mapped to the container's internal `PORT`.
*   `NODE_ENV`: Set to `production` for optimized builds when deploying (default: `production` in `docker-compose.yml` and `Dockerfile`).

## Database

*   VPSight uses **SQLite** as its database.
*   When running with Docker (Compose or manual `docker run`), the database file (`db/vpsight.sqlite`) is stored in a `./db` directory on your host machine, mapped as a volume into the container. This ensures your data persists even if the container is stopped or removed.
*   If you need to reset the database (e.g., to re-initialize the admin user with new credentials from `.env`), stop the container(s) (`docker compose down` or `docker stop <container_id> && docker rm <container_id>`) and delete the `db/vpsight.sqlite` file before starting them again.

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
    INITIAL_ADMIN_USERNAME=devadmin
    INITIAL_ADMIN_PASSWORD=devpassword
    # For local dev, the app runs directly on port 9002
    NEXT_PUBLIC_APP_URL=http://localhost:9002
    ```
4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:9002`.
    The Genkit development server (if used) can be started with `npm run genkit:dev`.

## Building and Running Docker Image Manually

If you want to build the image yourself and run it without Docker Compose:

1.  **Build the Docker image:**
    From the root of the project (where the `Dockerfile` is):
    ```bash
    docker build -t vpsight-app .
    ```
    You can replace `vpsight-app` with any tag you prefer.

2.  **Run the Docker container:**
    ```bash
    docker run -d -p 9002:3000 \
      -v $(pwd)/db:/app/db \
      -e PORT=3000 \
      -e INITIAL_ADMIN_USERNAME=admin \
      -e INITIAL_ADMIN_PASSWORD=yoursecurepassword \
      -e NEXT_PUBLIC_APP_URL=http://localhost:9002 \
      -e NODE_ENV=production \
      --name vpsight_manual vpsight-app
    ```
    *   `-d`: Run in detached mode.
    *   `-p 9002:3000`: Map host port 9002 to container port 3000.
    *   `-v $(pwd)/db:/app/db`: Persist database. Create `mkdir db` first if it doesn't exist.
    *   `-e ...`: Set environment variables.
    *   `--name vpsight_manual`: Assign a name to the container.
    *   `vpsight-app`: The name of the image you built in the previous step.

## GitHub Actions CI

This repository includes a GitHub Actions workflow (`.github/workflows/docker-publish.yml`) that automatically builds and pushes a Docker image to the GitHub Container Registry (`ghcr.io/HomieProxy/VPSight`) whenever changes are pushed to the `main` branch. You can pull this image as described in "Option 2" under "Getting Started".

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

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
```