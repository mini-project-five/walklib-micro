package miniproject.domain;

import java.time.LocalDate;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;
import javax.persistence.*;
import lombok.Data;
import miniproject.AiSystemManagementApplication;
import miniproject.domain.AiCoverImageGenerated;
import miniproject.domain.AiProcessingStarted;
import miniproject.domain.AiSummaryGenerated;
import miniproject.external.OpenAiImageRequest; // OpenAiImageRequest 임포트
import miniproject.external.OpenAiImageResponse; // OpenAiImageResponse 임포트
import miniproject.external.AiService; // AiService (Feign Client) 임포트
import org.springframework.beans.factory.annotation.Value; // @Value 임포트
import org.springframework.context.ApplicationContext; // ApplicationContext 임포트 (getEnvironment() 사용 위함)

@Entity
@Table(name = "Ai_table")
@Data
//<<< DDD / Aggregate Root
public class Ai {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long processId;

    private String coverImageUrl;
    private String generatedSummary;
    private String title; // 작가의 작품 제목 저장
    private String content; // 작가의 작품 내용 저장

    // @Value를 통해 API 키를 주입받기 위한 static 필드와 setter
    private static String aiServiceApiKey;

    @Value("${ai.api.key}")
    public void setAiServiceApiKey(String apiKey) {
        Ai.aiServiceApiKey = apiKey;
    }

    @PostPersist
    public void onPostPersist() {
        // AiProcessingStarted는 초기 데이터 저장 후 바로 발행
        AiProcessingStarted aiProcessingStarted = new AiProcessingStarted(this);
        aiProcessingStarted.setPublicationRequestId(this.getProcessId());
        aiProcessingStarted.publishAfterCommit();
    }

    public static AiRepository repository() {
        AiRepository aiRepository = AiSystemManagementApplication.applicationContext.getBean(
            AiRepository.class
        );
        return aiRepository;
    }

    // Feign Client 인스턴스를 가져오는 메서드
    public static AiService aiService() {
        return AiSystemManagementApplication.applicationContext.getBean(AiService.class);
    }

    // API 키를 가져오는 메서드
    public static String getApiKey() {
        return aiServiceApiKey;
    }

    //<<< Clean Arch / Port Method
    public static void publicationProcessingPolicy(
        PublicationRequested publicationRequested
    ) {
        // 1. Ai 엔티티 생성 또는 업데이트
        // publicationRequestId를 기준으로 Ai 엔티티를 찾거나 새로 생성합니다.
        Ai ai = repository().findById(publicationRequested.getPublicationRequestId()).orElse(new Ai());
        ai.setProcessId(publicationRequested.getPublicationRequestId());
        ai.setTitle(publicationRequested.getTitle());
        ai.setContent(publicationRequested.getContent()); // 작품 내용 저장

        repository().save(ai); // 변경사항 저장

        // 2. 외부 AI 서비스(OpenAI) 호출하여 표지 이미지 생성
        try {
            AiService aiService = aiService();
            String apiKey = getApiKey(); // 주입받은 API 키 사용

            if (apiKey == null || apiKey.isEmpty() || apiKey.equals("dummy_api_key")) {
                System.err.println("[AI Gen Error] API 키가 설정되지 않았거나 유효하지 않습니다. 이미지 생성을 건너뜁니다.");
                // 실제 환경에서는 적절한 오류 처리 (예: 실패 이벤트 발행, 관리자 알림)
                return;
            }

            // OpenAI 이미지 생성 요청 객체 생성
            OpenAiImageRequest imageRequest = new OpenAiImageRequest();
            imageRequest.setModel("dall-e-3"); // DALL-E 3 모델 사용
            // 프롬프트 생성: 제목과 내용을 조합하여 상세한 프롬프트 구성
            imageRequest.setPrompt(
                "Create a professional, high-quality, and visually appealing book cover for the title: '" + publicationRequested.getTitle() + "'." +
                " The content of the book is about: '" + publicationRequested.getContent() + "'." +
                " Focus on a creative and relevant design. Include the title prominently. " +
                " Ensure it's suitable for a digital publication platform. Style: art nouveau." // 예시 스타일, 더 구체적으로 변경 가능
            );
            imageRequest.setN(1); // 1개의 이미지 생성
            imageRequest.setSize("1024x1024"); // 이미지 크기
            imageRequest.setQuality("standard"); // 이미지 품질
            imageRequest.setStyle("vivid"); // 이미지 스타일 (DALL-E 3 specific)

            System.out.println("[AI Gen] OpenAI API 호출 시작 (이미지): " + publicationRequested.getPublicationRequestId());
            // Feign Client 호출 시 Authorization 헤더에 "Bearer " 접두사 추가
            OpenAiImageResponse imageResponse = aiService.generateCoverImage("Bearer " + apiKey, imageRequest);
            System.out.println("[AI Gen] OpenAI API 호출 완료 (이미지).");

            if (imageResponse != null && imageResponse.getData() != null && !imageResponse.getData().isEmpty()) {
                String imageUrl = imageResponse.getData().get(0).getUrl();
                if (imageUrl != null && !imageUrl.isEmpty()) {
                    ai.setCoverImageUrl(imageUrl);
                    repository().save(ai); // 생성된 이미지 URL 저장

                    // 3. AiCoverImageGenerated 이벤트 발행
                    AiCoverImageGenerated aiCoverImageGenerated = new AiCoverImageGenerated(ai);
                    aiCoverImageGenerated.setPublicationRequestId(publicationRequested.getPublicationRequestId());
                    aiCoverImageGenerated.setCoverImageUrl(imageUrl);
                    aiCoverImageGenerated.publishAfterCommit();
                    System.out.println("[AI Gen] AiCoverImageGenerated 이벤트 발행 완료. Image URL: " + imageUrl);
                } else {
                    System.err.println("[AI Gen Error] OpenAI API 응답에 유효한 이미지 URL이 없습니다. Request ID: " + publicationRequested.getPublicationRequestId());
                    // 여기에 추가적인 오류 처리 로직을 넣을 수 있습니다.
                }
            } else {
                System.err.println("[AI Gen Error] OpenAI API 응답이 비어있거나 데이터가 없습니다. Request ID: " + publicationRequested.getPublicationRequestId());
                // 여기에 추가적인 오류 처리 로직을 넣을 수 있습니다.
            }

            // --- (선택 사항) AI 요약 생성 로직 (GPT 모델 사용) ---
            // 필요하다면, 여기에 GPT 모델을 사용하여 요약을 생성하는 로직을 추가할 수 있습니다.
            /*
            OpenAiChatCompletionRequest summaryRequest = new OpenAiChatCompletionRequest();
            summaryRequest.setModel("gpt-4o"); // 또는 "gpt-3.5-turbo"
            summaryRequest.setMessages(List.of(
                new OpenAiChatCompletionRequest.Message("system", "You are a professional book summarizer."),
                new OpenAiChatCompletionRequest.Message("user", "Summarize the following book content in 2-3 sentences, focusing on key themes and plot points: \n\n" + publicationRequested.getContent())
            ));
            summaryRequest.setMax_tokens(200);
            summaryRequest.setTemperature(0.7);

            System.out.println("[AI Sum] OpenAI API 호출 시작 (요약): " + publicationRequested.getPublicationRequestId());
            OpenAiChatCompletionResponse summaryResponse = aiService.chatCompletions("Bearer " + apiKey, summaryRequest);
            System.out.println("[AI Sum] OpenAI API 호출 완료 (요약).");

            if (summaryResponse != null && summaryResponse.getChoices() != null && !summaryResponse.getChoices().isEmpty()) {
                String summary = summaryResponse.getChoices().get(0).getMessage().getContent();
                if (summary != null && !summary.isEmpty()) {
                    ai.setGeneratedSummary(summary.trim());
                    repository().save(ai); // 생성된 요약 저장

                    // AiSummaryGenerated 이벤트 발행
                    AiSummaryGenerated aiSummaryGenerated = new AiSummaryGenerated(ai);
                    aiSummaryGenerated.setPublicationRequestId(publicationRequested.getPublicationRequestId());
                    aiSummaryGenerated.setSummary(summary.trim());
                    aiSummaryGenerated.publishAfterCommit();
                    System.out.println("[AI Sum] AiSummaryGenerated 이벤트 발행 완료.");
                } else {
                    System.err.println("[AI Sum Error] OpenAI API 응답에 유효한 요약이 없습니다. Request ID: " + publicationRequested.getPublicationRequestId());
                }
            } else {
                System.err.println("[AI Sum Error] OpenAI API 응답이 비어있거나 데이터가 없습니다 (요약). Request ID: " + publicationRequested.getPublicationRequestId());
            }
            */

        } catch (Exception e) {
            System.err.println("[AI Gen Error] AI 서비스 호출 중 예외 발생: " + e.getMessage());
            e.printStackTrace();
            // 오류 처리: 트랜잭션 롤백, 실패 이벤트 발행, 로깅, 알림 등의 적절한 오류 처리
        }
    }
    //>>> Clean Arch / Port Method

}
//>>> DDD / Aggregate Root