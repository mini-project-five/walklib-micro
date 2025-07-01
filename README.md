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
