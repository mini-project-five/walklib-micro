#!/bin/bash

# 서비스별 정보 정의 (디렉토리명, 이미지명, 컨테이너명, 외부 포트)
# 이 파일은 다른 스크립트에서 source 명령어로 불러와 사용됩니다.
SERVICES=(
  "gateway gateway gateway 8080"
  "user_management user-m userManagement 8082"
  "subscription_management subs-m subscriptionManagement 8084"
  "point_management point-m pointManagement 8083"
  "content_writing_management content-m contentWritingManagement 8087"
  "book_management book-m bookManagement 8085"
  "author_management author-m authorManagement 8086"
  "ai_system_management ai-m aiSystemManagement 8088"
)
