# 개발 환경

## 구축

### kafka, kafka-ui 실행
```
~$ cd infra
~/infra$ docker compose up
```
- `infra` 디렉토리로 이동하여 명령어 실행.
- docker 최신 버전이 아닐경우 `docker-compose` 명령어로 사용.

```
~$ docker ps
```
- 위 명령어로 `infra-kafka-1`, `infra-kafka-ui-1` 동작 확인
- `localhost:8092`에 접속하여 웹으로 kafka 설정을 ui 확인가능.

### gateway 로컬 이미지 실행

```
~$ cd gateway
~/gateway$ mvn clean package -DskipTests
~/gateway$ docker build -t gateway:local .
```
- gateway 빌드

```
~/gateway$ docker run -d --name gateway \
-p 8080:8080 \
--network infra_default \
-e SPRING_PROFILES_ACTIVE=docker \
gateway:local
```
- gateway 실행
- 외부 8080 와 내부 8080 포트 연결
- kafka 가 실행 된 infra 디렉토리의 default 네트워크에 연결 (infra_default)
- 환경변수 `SPRING_PROFILES_ACTIVE=docker` 추가
- 빌드한 `gateway:local` 이미지 사용

### 각 마이크로 서비스 로컬 이미지 실행

#### 1. user management

```
~$ cd user\ management/
~/gateway$ mvn clean package -DskipTests
~/gateway$ docker build -t user-m:local .
```

```
~/gateway$ docker run -d --name userManagement \
-p 8082:8080 \
--network infra_default \
-e SPRING_PROFILES_ACTIVE=docker \
user-m:local
```

#### 2. subscription management

```
~$ cd subscription\ management/
~/gateway$ mvn clean package -DskipTests
~/gateway$ docker build -t subs-m:local .
```

```
~/gateway$ docker run -d --name subscriptionManagement \
-p 8084:8080 \
--network infra_default \
-e SPRING_PROFILES_ACTIVE=docker \
subs-m:local
```

#### 3. point management

```
~$ cd point\ management/
~/gateway$ mvn clean package -DskipTests
~/gateway$ docker build -t point-m:local .
```

```
~/gateway$ docker run -d --name pointManagement \
-p 8083:8080 \
--network infra_default \
-e SPRING_PROFILES_ACTIVE=docker \
point-m:local
```

#### 4. content writing management

```
~$ cd content\ writing\ management/
~/gateway$ mvn clean package -DskipTests
~/gateway$ docker build -t content-m:local .
```

```
~/gateway$ docker run -d --name contentWritingManagement \
-p 8087:8080 \
--network infra_default \
-e SPRING_PROFILES_ACTIVE=docker \
content-m:local
```

#### 5. book management

```
~$ cd book\ management/
~/gateway$ mvn clean package -DskipTests
~/gateway$ docker build -t book-m:local .
```

```
~/gateway$ docker run -d --name bookManagement \
-p 8085:8080 \
--network infra_default \
-e SPRING_PROFILES_ACTIVE=docker \
book-m:local
```

#### 6. author management

```
~$ cd author\ management/
~/gateway$ mvn clean package -DskipTests
~/gateway$ docker build -t author-m:local .
```

```
~/gateway$ docker run -d --name authorManagement \
-p 8086:8080 \
--network infra_default \
-e SPRING_PROFILES_ACTIVE=docker \
author-m:local
```

#### 7. ai system management

```
~$ cd ai\ system\ management/
~/gateway$ mvn clean package -DskipTests
~/gateway$ docker build -t ai-m:local .
```

```
~/gateway$ docker run -d --name aiSystemManagement \
-p 8088:8080 \
--network infra_default \
-e SPRING_PROFILES_ACTIVE=docker \
ai-m:local
```

## 쿠버네티스 등록

### 사전 설치

```
# mac
brew update && brew install azure-cli

# ubuntu
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# window
https://learn.microsoft.com/ko-kr/cli/azure/install-azure-cli?view=azure-cli-latest 
# 링크에 접속하여 다운로드 및 설치
```

- 설치 확인 -> 터미널에서 `az version`

### 로그인

```
az login --use-device-code
```

- 터미널에 뜨는 링크에 접속하여 발급 받은 microsoft 아이디로 로그인
- 터미널에 있는 코드입력하여 로그인 완료

```
az aks get-credentials --resource-group project03-rsrcgrp --name project03-aks
az aks update -n project03-aks -g project03-rsrcgrp --attach-acr project03registry
```

- microsoft azure 구성이 되어있어야 함.

```
# 리소스 그룹 조회
az group list --output table

# AKS 클러스터 확인
az aks list --output table

# 현재 로그인된 계정 확인
az account show
```

### 쿠버네티스 접속 확인

```
kubectl get nodes
```

- kubectl이 설치되어 있어야 합니다.
- 설치 안 된 경우:
```
# mac
brew install kubectl

# Ubuntu
sudo apt install kubectl

# Windows
공식 설치 가이드를 따를 것.
```

### 쿠버네티스 pod 등록

```
kubectl apply -f ./kubernetes/all-in-one-pod.yml

# 확인
kubectl get pods

# 삭제
kubectl delete -f ./kubernetes/all-in-one-pod.yml
```

### 쿠버네티스 서비스 등록

```
kubectl apply -f ./kubernetes/all-in-one-service.yml

# 확인
kubectl get svc

# 삭제
kubectl delete -f ./kubernetes/all-in-one-service.yml
```

