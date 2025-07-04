package miniproject.domain.dto;

import lombok.Data;

@Data
public class CoverGenerationRequest {
    private String title;
    private String genre;
    private String description;
}