#!/bin/bash

# az cli 설치
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash


echo "=== kubectl과 Docker 설치 시작 ==="

# 1. 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# 2. 필요한 패키지 설치
sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release

# 3. Docker 설치
# Docker GPG 키 추가
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Docker 저장소 추가
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Docker 설치
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Docker 서비스 시작 및 활성화
sudo systemctl start docker
sudo systemctl enable docker

# 현재 사용자를 docker 그룹에 추가
sudo usermod -aG docker $USER

# 4. kubectl 바이너리 직접 다운로드 및 설치
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"

# kubectl 바이너리 검증 (선택사항)
curl -LO "https://dl.k8s.io/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl.sha256"
echo "$(cat kubectl.sha256)  kubectl" | sha256sum --check

# kubectl 설치
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# 임시 파일 정리
rm kubectl kubectl.sha256

# 5. Claude Code 설치 옵션
echo ""
echo "=== Claude Code 설치 ==="
read -p "Claude Code를 설치하시겠습니까? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo "Claude Code 설치를 시작합니다..."
    npm install -g @anthropic-ai/claude-code
    echo "Claude Code 설치가 완료되었습니다."
else
    echo "Claude Code 설치를 건너뛰었습니다."
fi

