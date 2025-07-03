#!/bin/bash

# 서비스별 정보 정의 (디렉토리명, 이미지명, 컨테이너명, 외부 포트)
# 이 파일은 다른 스크립트에서 source 명령어로 불러와 사용됩니다.
# 프론트엔드 서비스는 별도로 처리되므로 제외합니다.

SERVICES=(
  "gateway gateway gateway 8080"
  "user_management user user 8081"
  "subscription_management subscription subscription 8082"
  "point_management point point 8083"
  "content_writing_management content content 8084"
  "book_management book book 8085"
  "author_management author author 8086"
  "ai_system_management ai ai 8087"
)
