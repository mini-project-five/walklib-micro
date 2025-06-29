package miniproject.dto;

import lombok.Data;

@Data
public class TextRefinementRequest {
    private String originalText;
    private String genre;
    private String style; // 예: "formal", "casual", "poetic", "dramatic"
    private String targetAudience; // 예: "children", "young-adult", "adult"
    private String instructions; // 추가 지시사항
}
