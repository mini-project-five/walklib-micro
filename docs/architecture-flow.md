# WalkLib 아키텍처 플로우

## 사용자 접속 흐름

1. **브라우저에서 http://20.249.130.200 접속**
   - Frontend LoadBalancer로 연결

2. **정적 파일 요청 (HTML, JS, CSS)**
   - nginx가 직접 제공

3. **API 요청 (예: /api/authors, /authors)**
   - 브라우저 → Frontend nginx → Gateway(내부) → Author Service
   - nginx.conf에서 프록시 설정:
     ```
     location /authors {
         proxy_pass http://walklib-author.default.svc.cluster.local:8080/authors;
     }
     ```

## 장점

1. **외부에서 Gateway 직접 접속 불가**
   - 보안 강화
   - DDoS 공격 방어

2. **Frontend만 외부 IP 필요**
   - IP 관리 단순화
   - 비용 절감

3. **내부 통신은 안정적**
   - Kubernetes DNS 사용
   - 네트워크 지연 최소화

## 예시

### 사용자가 작가 목록을 요청할 때:
1. 브라우저: GET http://20.249.130.200/authors
2. Frontend nginx: 요청을 받아서 내부로 전달
3. 내부 통신: http://walklib-author.default.svc.cluster.local:8080/authors
4. 응답을 브라우저로 반환

### 만약 Gateway도 외부 노출했다면:
- Gateway IP: 20.249.145.20 (변경될 수 있음)
- Frontend에서 이 IP를 하드코딩해야 함
- IP 변경 시 Frontend 재배포 필요