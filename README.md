# 📚 Walklib Micro Project - MSA 기반 도서 플랫폼

이 프로젝트는 마이크로서비스 아키텍처(MSA)를 학습하고 실제 환경에 적용해보기 위해 진행된 팀 프로젝트입니다. 각 도메인 별로 서비스를 분리하여 개발 및 배포의 독립성을 확보하고, Docker와 Kubernetes를 활용하여 클라우드 네이티브 환경에서의 확장성과 안정성을 목표로 합니다.

---

## 👨‍👩‍👧‍👦 함께한 팀원들

이 프로젝트는 아래의 팀원들이 함께 노력하여 만들었습니다.

*   👑 **이민욱 (팀장):** Frontend, Backend 총괄 개발
*   ⚙️ **오유진:** Backend, 모니터링 및 파이프라인 구축
*   ☸️ **최인규:** Backend, Kubernetes 클러스터 관리
*   🚀 **조연서:** Backend, Kubernetes 클러스터 관리
*   🎨 **김서영:** Frontend, 파이프라인 구축 
*   🇰🇷 **허유찬:** Frontend, 모니터링 구축 

---

## 🏗️ 시스템 아키텍처 (System Architecture)

본 프로젝트는 각 도메인 기능을 독립적인 마이크로서비스로 분리한 구조를 따릅니다. 모든 서비스는 Docker 컨테이너로 패키징되며, Kubernetes를 통해 배포 및 관리됩니다. API 게이트웨이가 외부의 모든 요청을 받아 적절한 서비스로 라우팅하는 단일 진입점 역할을 수행합니다.
<img width="512" alt="스크린샷 2025-07-08 오후 5 28 54" src="https://github.com/user-attachments/assets/ccf1cba2-8048-4f64-b72b-adade7eaacdb" />


---

## 🛠️ 기술 스택 (Tech Stack)

| 구분 | 기술 / 파일 | 설명 |
| :--- | :--- | :--- |
| **Backend** | `pom.xml` | Java, Spring Boot, Spring Cloud를 사용한 MSA 백엔드 |
| **Frontend** | `package.json`, `vite.config.ts`, `App.tsx` | React, TypeScript, Vite를 사용한 모던 웹 애플리케이션 |
| **Styling** | `tailwind.config.ts` | Tailwind CSS를 사용한 UI 스타일링 |
| **Messaging** | `infra/docker-compose.yml` | Kafka를 이용한 비동기 메시지 큐 시스템 |
| **Containerization** | `Dockerfile`, `docker-compose.yml` | Docker를 이용한 서비스 컨테이너화 및 로컬 환경 구성 |
| **Orchestration** | `kubernetes/deployment.yaml` | Kubernetes를 통한 서비스 배포 및 관리 |
| **CI/CD** | `github/workflows/github-action.yml` | GitHub Actions를 활용한 CI/CD 파이프라인 자동화 |

---

## 📦 서비스 및 인프라 목록

### 마이크로서비스

*   `gateway`: API 게이트웨이
*   `user_management`: 사용자 관리 서비스
*   `book_management`: 도서 관리 서비스
*   `author_management`: 작가 관리 서비스
*   `content_writing_management`: 콘텐츠 작성 관리 서비스
*   `point_management`: 포인트 관리 서비스
*   `subscription_management`: 구독 관리 서비스
*   `ai_system_management`: AI 연동 시스템
*   `frontend`: 사용자 인터페이스(UI) 웹 애플리케이션

### 인프라 (from `infra/docker-compose.yml`)

| 서비스 | 포트 (Host:Container) | 설명 |
| :--- | :--- | :--- |
| **Kafka** | `29092:29092` | 메시지 브로커 |
| **Kafka-UI** | `8092:8080` | Kafka 관리용 웹 UI |

> **참고:** 각 마이크로서비스의 포트 정보는 `kubernetes/deployment.yaml` 또는 개별 서비스 설정 파일에서 확인할 수 있습니다.

---

## 🚀 시작하기 (Getting Started)

프로젝트 루트 디렉토리의 쉘 스크립트를 사용하여 모든 서비스를 간편하게 실행할 수 있습니다.

*   **전체 서비스 시작:**
    ```bash
    # Docker Compose를 사용하여 모든 서비스를 백그라운드에서 시작합니다.
    sh start-services.sh
    ```

*   **전체 서비스 중지:**
    ```bash
    # 실행 중인 모든 서비스를 중지하고 컨테이너를 삭제합니다.
    sh stop-services.sh
    ```
