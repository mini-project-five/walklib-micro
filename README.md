# WalkLib Micro - AI 기반 디지털 도서관 플랫폼

## 🔐 중요: 시작하기 전에

⚠️ **환경 변수 설정이 필요합니다!**

이 프로젝트를 실행하기 전에 반드시 [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) 파일을 읽고 필요한 환경 변수를 설정하세요.

### 필수 환경 변수
```bash
export OPENAI_API_KEY=your-openai-api-key-here
```

## Model
www.msaez.io/#/31334541/storming/3efacb35baa219662388e54c2dc76f3b

## Before Running Services
### Make sure there is a Kafka server running
```
cd kafka
docker-compose up
```
- Check the Kafka messages:
```
cd infra
docker-compose exec -it kafka /bin/bash
cd /bin
./kafka-console-consumer --bootstrap-server localhost:9092 --topic
```

## Run the backend micro-services
See the README.md files inside the each microservices directory:

- user management
- point management
- subscription management
- book management
- author management
- content writing management
- ai system management


## Run API Gateway (Spring Gateway)
```
cd gateway
mvn spring-boot:run
```

## Test by API
- user management
```
 http :8088/users userId="userId"email="email"userPassword="userPassword"userName="userName"isKtCustomer="isKtCustomer"role="Role"
```
- point management
```
 http :8088/points pointId="pointId"userId="userId"pointBalance="pointBalance"
```
- subscription management
```
 http :8088/subscriptions subscriptionId="subscriptionId"userId="userId"status="status"startDate="startDate"endDate="endDate"
```
- book management
```
 http :8088/books bookId="bookId"title="title"authorId="authorId"viewCount="viewCount"isBestseller="isBestseller"status="status"
```
- author management
```
 http :8088/authors authorId="authorId"authorName="authorName"email="email"introduction="introduction"authorPassword="authorPassword"realName="realName"
 http :8088/authorManagements managementId="managementId"userId="userId"reviewerId="reviewerId"reviewedAt="reviewedAt"
```
- content writing management
```
 http :8088/manuscripts manuscriptId="manuscriptId"authorId="authorId"title="title"content="content"status="status"
```
- ai system management
```
 http :8088/ais processId="processId"
```


## Run the frontend
```
cd frontend
npm i
npm run serve
```

## Test by UI
Open a browser to localhost:8088

## Required Utilities

- httpie (alternative for curl / POSTMAN) and network utils
```
sudo apt-get update
sudo apt-get install net-tools
sudo apt install iputils-ping
pip install httpie
```

- kubernetes utilities (kubectl)
```
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
```

- aws cli (aws)
```
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

- eksctl 
```
curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
sudo mv /tmp/eksctl /usr/local/bin
```
