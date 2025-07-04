#!/bin/bash
set -euo pipefail

# Update package lists and install essential tools
# -y flag is added to auto-confirm installations
echo "Updating apt and installing dependencies..."
sudo apt-get update
sudo apt-get install -y net-tools iputils-ping httpie unzip

# Install kubectl (latest stable version)
echo "Installing kubectl..."
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
rm kubectl # Clean up downloaded binary

# Install AWS CLI v2 (latest version)
echo "Installing AWS CLI..."
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
rm -rf aws awscliv2.zip # Clean up installation files

# Install eksctl (latest version)
echo "Installing eksctl..."
curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
sudo mv /tmp/eksctl /usr/local/bin

# Install nvm (Node Version Manager) and Node.js LTS
# Using a recent nvm version and the latest Node.js LTS release
echo "Installing nvm and Node.js LTS..."
export NVM_DIR="$HOME/.nvm"
# Using v0.39.7 instead of v0.38.0
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Source nvm to make it available in the current script session
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Install and use the latest LTS version of Node.js instead of the EOL Node 14
nvm install 'lts/*' && nvm use 'lts/*' && nvm alias default 'lts/*'

# This might be needed for compatibility with older dependencies.
# With a modern Node.js LTS, you might be able to remove this.
export NODE_OPTIONS=--openssl-legacy-provider

echo "Starting services with docker-compose..."
cd infra
docker compose up
