# 🚀 Walklib Micro 환경 설정 가이드

마이크로서비스 아키텍처 기반의 도서관 관리 시스템입니다. Java 21, Spring Boot 2.3.1, Lombok 1.18.32를 사용합니다.

## 📋 사전 요구사항

### 필수 요구사항
- **Java 21 JDK** - OpenJDK 21 또는 Oracle JDK 21
- **Maven 3.6+** - 프로젝트 빌드 도구
- **Git** - 소스코드 관리

### 선택사항
- **Docker & Docker Compose** - 인프라 실행 시 필요
- **kubectl** - Kubernetes 배포 시 필요
- **Node.js 14.19.0** - 프론트엔드 개발 시 필요

## 🚀 초기 환경 구성 순서

### 1단계: 프로젝트 클론
```bash
git clone <repository-url>
cd walklib-micro
```

### 2단계: 시스템 도구 설치 (선택사항)
```bash
./init.sh
```
이 스크립트는 다음을 설치합니다:
- 네트워크 도구 (net-tools, ping)
- HTTP 클라이언트 (httpie)
- Kubernetes CLI (kubectl)
- AWS CLI
- eksctl
- Node.js 14.19.0
- Docker Compose 인프라 시작

### 3단계: Java 환경 설정 및 빌드 (필수)
```bash
./setup-environment.sh
```
이 스크립트는 다음을 자동으로 수행합니다:
- ✅ Java 21 환경 설정
- ✅ 모든 서비스의 POM 파일 업데이트 (Lombok 1.18.32, Maven Compiler Plugin 3.11.0)
- ✅ 타입 충돌 수정 (AbstractEvent timestamp 문제)
- ✅ 전체 서비스 빌드 및 검증

### 4단계: 서비스 실행
```bash
./run.sh
```
모든 마이크로서비스를 백그라운드에서 실행합니다.

## 🛠️ 수동 설정 (고급 사용자용)

### Java 환경 설정
```bash
export JAVA_HOME=/workspace/.vscode-remote/data/User/globalStorage/pleiades.java-extension-pack-jdk/java/21
```

### 개별 서비스 빌드
```bash
cd ai_system_management && mvn clean package -DskipTests
cd ../author_management && mvn clean package -DskipTests
cd ../book_management && mvn clean package -DskipTests
cd ../content_writing_management && mvn clean package -DskipTests
cd ../point_management && mvn clean package -DskipTests
cd ../subscription_management && mvn clean package -DskipTests
cd ../user_management && mvn clean package -DskipTests
cd ../gateway && mvn clean package -DskipTests
```

## 🏃‍♂️ 서비스 실행

### 전체 서비스 실행 (권장)
```bash
./run.sh
```
모든 서비스를 백그라운드에서 실행하며, `Ctrl+C`로 전체 종료 가능

### 개별 서비스 실행
```bash
cd <service_name>
mvn spring-boot:run
```

### Docker 인프라 실행
```bash
cd infra
docker-compose up
```

## 📦 서비스 목록 및 포트

| 서비스 | 설명 | 기본 포트 |
|--------|------|-----------|
| **gateway** | API 게이트웨이 | 8080 |
| **user_management** | 사용자 관리 | 8081 |
| **author_management** | 작가 관리 | 8082 |
| **book_management** | 도서 관리 | 8083 |
| **content_writing_management** | 콘텐츠 작성 관리 | 8084 |
| **point_management** | 포인트 관리 | 8085 |
| **subscription_management** | 구독 관리 | 8086 |
| **ai_system_management** | AI 시스템 관리 | 8087 |

## ✅ 환경 설정 검증

설정이 완료되면 다음 명령으로 확인:

```bash
# Java 버전 확인
java -version
# 결과: openjdk version "21.0.x" 출력되어야 함

# Maven 버전 확인  
mvn -version
# 결과: Java version을 21.0.x로 인식해야 함

# 빌드된 JAR 파일 확인
find . -name "*.jar" -path "*/target/*" | wc -l
# 결과: 8 (모든 서비스가 빌드되었을 때)
```

## 🔧 주요 해결된 문제들

1. **Java 21 호환성**: Lombok 1.18.32 사용으로 Java 21 완전 지원
2. **Maven 컴파일러**: 3.11.0 버전으로 업데이트하여 Java 21 컴파일 지원
3. **타입 충돌**: AbstractEvent의 timestamp와 충돌하는 필드 자동 제거
4. **빌드 자동화**: 전체 환경 설정을 스크립트로 자동화

## 🚨 문제 해결

### 빌드 실패 시
1. **Java 환경 확인**
   ```bash
   java -version
   echo $JAVA_HOME
   ```

2. **환경 재설정**
   ```bash
   ./setup-environment.sh
   ```

3. **개별 서비스 빌드로 문제 식별**
   ```bash
   cd <failed_service>
   mvn clean compile
   ```

### 일반적인 오류 해결

| 오류 | 원인 | 해결방법 |
|------|------|----------|
| `NoSuchFieldError` | Lombok 버전 호환성 | `./setup-environment.sh` 재실행 |
| `invalid target release: 21` | Java 환경 설정 | JAVA_HOME 확인 및 재설정 |
| `timestamp conflict` | 타입 충돌 | setup-environment.sh로 자동 수정 |
| `BUILD FAILURE` | 의존성 문제 | `mvn clean install` 후 재빌드 |

### 네트워크 포트 충돌 시
```bash
# 사용 중인 포트 확인
netstat -tulpn | grep :808

# 특정 포트 사용 프로세스 종료
sudo lsof -ti:8080 | xargs kill -9
```

## 📞 추가 지원

1. **자동 수정**: `./setup-environment.sh` 스크립트로 대부분의 문제 해결
2. **로그 확인**: 각 서비스 디렉토리에서 `mvn spring-boot:run` 실행 후 로그 확인
3. **의존성 문제**: `mvn dependency:tree`로 의존성 트리 확인

## 🌟 빠른 시작 요약

```bash
# 1. 프로젝트 클론
git clone <repository-url> && cd walklib-micro

# 2. 환경 설정 (필수)
./setup-environment.sh

# 3. 서비스 실행
./run.sh
```

3단계만으로 전체 마이크로서비스 환경이 구성됩니다!