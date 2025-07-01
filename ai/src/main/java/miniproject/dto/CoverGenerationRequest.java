package miniproject.dto;

import lombok.Data;

@Data
public class CoverGenerationRequest {
    private String title;
    private String author;
    private String genre;
    private String mood; // 예: "dark", "bright", "mysterious", "romantic"
    private String style; // 예: "minimalist", "detailed", "abstract", "realistic"
    private String colorScheme; // 예: "warm", "cool", "monochrome", "vibrant"
    private String description; // 책 내용 요약
}
