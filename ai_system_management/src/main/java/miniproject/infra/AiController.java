package miniproject.infra;

import miniproject.domain.Ai;
import miniproject.domain.AiRepository;
import miniproject.domain.PublicationRequested;
import lombok.Data; // Lombok 추가
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/ais") // AI System Management 서비스의 기본 경로
public class AiController {

    // AiRepository를 주입받아 필요시 사용 (예: 직접 저장/조회)
    @Autowired
    AiRepository aiRepository;

    // AI 표지 생성을 요청하는 엔드포인트
    // 프론트엔드에서 이 엔드포인트로 작품 정보를 보냅니다.
    @PostMapping("/generate-cover") // 이전 `request-publication` 대신 더 명확한 이름 사용
    public ResponseEntity<Void> generateCover(@RequestBody PublicationRequestDto requestDto) {
        try {
            // DTO를 PublicationRequested 이벤트로 변환하여 도메인 로직에 전달
            PublicationRequested publicationRequested = new PublicationRequested();
            publicationRequested.setPublicationRequestId(requestDto.getPublicationRequestId());
            publicationRequested.setManuscriptId(requestDto.getManuscriptId());
            publicationRequested.setAuthorId(requestDto.getAuthorId());
            publicationRequested.setTitle(requestDto.getTitle());
            publicationRequested.setContent(requestDto.getContent());
            // eventId는 생성 시 자동 부여되므로 여기서 직접 설정할 필요 없음

            Ai.publicationProcessingPolicy(publicationRequested); // 핵심 도메인 로직 호출

            return new ResponseEntity<>(HttpStatus.ACCEPTED); // 요청 수락, 비동기적으로 처리될 예정
        } catch (Exception e) {
            System.err.println("Failed to initiate AI cover generation: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR); // 서버 내부 오류
        }
    }

    // 프론트엔드에서 받을 요청 본문을 위한 DTO 정의
    @Data // Lombok을 사용하여 getter, setter, toString 등을 자동 생성
    public static class PublicationRequestDto {
        private Long publicationRequestId; // 프론트엔드에서 제공하는 고유 요청 ID
        private Long manuscriptId;
        private Long authorId;
        private String title;
        private String content;
        // 추가적으로 이미지 스타일, 장르 등도 DTO에 포함시킬 수 있습니다.
        // private String style;
        // private String genre;
    }

    // --- (선택 사항) 프론트엔드에 AI 생성 상태/URL을 제공하는 API ---
    // 프론트엔드가 이미지 생성 완료 후 URL을 가져가기 위한 엔드포인트
    @GetMapping("/status/{publicationRequestId}")
    public ResponseEntity<String> getAiGenerationStatus(@PathVariable Long publicationRequestId) {
        Optional<Ai> aiOptional = aiRepository.findById(publicationRequestId);
        if (aiOptional.isPresent()) {
            Ai ai = aiOptional.get();
            if (ai.getCoverImageUrl() != null && !ai.getCoverImageUrl().isEmpty()) {
                return new ResponseEntity<>(ai.getCoverImageUrl(), HttpStatus.OK); // URL 반환
            } else {
                return new ResponseEntity<>("Processing...", HttpStatus.ACCEPTED); // 아직 처리 중
            }
        } else {
            return new ResponseEntity<>("Not Found", HttpStatus.NOT_FOUND);
        }
    }
}