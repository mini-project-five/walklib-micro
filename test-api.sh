#!/bin/bash

# 간단한 API 테스트 스크립트
# Kafka 이벤트 발생시키기

echo "=== Author 등록 테스트 ==="

# Author 등록 API 호출
curl -X POST "http://localhost:8082/authors" \
  -H "Content-Type: application/json" \
  -d '{
    "authorName": "김작가",
    "email": "author@example.com",
    "introduction": "안녕하세요, 김작가입니다.",
    "realName": "김진수"
  }'

echo -e "\n\n=== Manuscript 생성 테스트 ==="

# Manuscript 생성 API 호출
curl -X POST "http://localhost:8084/manuscripts" \
  -H "Content-Type: application/json" \
  -d '{
    "authorId": 1,
    "title": "AI와 함께하는 미래",
    "content": "인공지능 기술의 발전과 함께 우리의 삶이 어떻게 변화하고 있는지에 대한 이야기입니다. 새로운 시대의 도전과 기회를 살펴봅니다."
  }'

echo -e "\n\n=== User 등록 테스트 ==="

# User 등록 API 호출
curl -X POST "http://localhost:8089/users" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "userPassword": "password123",
    "userName": "홍길동",
    "role": "READER"
  }'

echo -e "\n\n테스트 완료! Kafka 로그를 확인하세요."