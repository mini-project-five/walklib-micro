package miniproject.infra;

import java.util.List;
import java.util.Optional;
import javax.transaction.Transactional;
import miniproject.domain.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

//<<< Clean Arch / Inbound Adaptor

@RestController
@RequestMapping(value="/manuscripts")
@Transactional
public class ManuscriptController {

    private static final Logger logger = LoggerFactory.getLogger(ManuscriptController.class);

    @Autowired
    ManuscriptRepository manuscriptRepository;

    // 모든 원고 조회
    @GetMapping
    public ResponseEntity<List<Manuscript>> getAllManuscripts() {
        logger.info("GET /manuscripts - 모든 원고 조회");
        List<Manuscript> manuscripts = manuscriptRepository.findAllManuscripts();
        logger.info("조회된 원고 수: {}", manuscripts.size());
        return ResponseEntity.ok(manuscripts);
    }

    // 특정 원고 조회
    @GetMapping("/{id}")
    public ResponseEntity<Manuscript> getManuscript(@PathVariable Long id) {
        logger.info("GET /manuscripts/{} - 원고 조회", id);
        Optional<Manuscript> manuscript = manuscriptRepository.findById(id);
        if (manuscript.isPresent()) {
            logger.info("원고 조회 성공: {}", manuscript.get().getTitle());
            return ResponseEntity.ok(manuscript.get());
        } else {
            logger.warn("원고를 찾을 수 없음: {}", id);
            return ResponseEntity.notFound().build();
        }
    }

    // 원고 생성 (저장)
    @PostMapping
    public ResponseEntity<Manuscript> createManuscript(@RequestBody Manuscript manuscript) {
        logger.info("POST /manuscripts - 원고 생성: {}", manuscript.getTitle());
        if (manuscript.getStatus() == null) {
            manuscript.setStatus("DRAFT");
        }
        Manuscript savedManuscript = manuscriptRepository.save(manuscript);
        logger.info("원고 생성 성공: ID={}, 상태={}", savedManuscript.getManuscriptId(), savedManuscript.getStatus());
        return ResponseEntity.ok(savedManuscript);
    }

    // 원고 수정
    @PutMapping("/{id}")
    public ResponseEntity<Manuscript> updateManuscript(@PathVariable Long id, @RequestBody Manuscript manuscriptDetails) {
        logger.info("PUT /manuscripts/{} - 원고 수정", id);
        Optional<Manuscript> manuscriptOptional = manuscriptRepository.findById(id);
        if (manuscriptOptional.isPresent()) {
            Manuscript manuscript = manuscriptOptional.get();
            manuscript.setTitle(manuscriptDetails.getTitle());
            manuscript.setContent(manuscriptDetails.getContent());
            manuscript.setStatus(manuscriptDetails.getStatus());
            Manuscript updatedManuscript = manuscriptRepository.save(manuscript);
            logger.info("원고 수정 성공: ID={}, 상태={}", updatedManuscript.getManuscriptId(), updatedManuscript.getStatus());
            return ResponseEntity.ok(updatedManuscript);
        } else {
            logger.warn("수정할 원고를 찾을 수 없음: {}", id);
            return ResponseEntity.notFound().build();
        }
    }

    // 작가별 원고 조회
    @GetMapping("/author/{authorId}")
    public ResponseEntity<List<Manuscript>> getManuscriptsByAuthor(@PathVariable Long authorId) {
        logger.info("GET /manuscripts/author/{} - 작가별 원고 조회", authorId);
        List<Manuscript> manuscripts = manuscriptRepository.findByAuthorId(authorId);
        logger.info("작가 ID {}의 원고 수: {}", authorId, manuscripts.size());
        return ResponseEntity.ok(manuscripts);
    }

    // 원고 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteManuscript(@PathVariable Long id) {
        logger.info("DELETE /manuscripts/{} - 원고 삭제", id);
        if (manuscriptRepository.existsById(id)) {
            manuscriptRepository.deleteById(id);
            logger.info("원고 삭제 성공: ID={}", id);
            return ResponseEntity.noContent().build();
        } else {
            logger.warn("삭제할 원고를 찾을 수 없음: {}", id);
            return ResponseEntity.notFound().build();
        }
    }

    // 원고 조회수 증가 (독자가 책을 열 때)
    @PatchMapping("/{id}/view")
    public ResponseEntity<Manuscript> incrementViewCount(@PathVariable Long id) {
        logger.info("PATCH /manuscripts/{}/view - 원고 조회수 증가", id);
        Optional<Manuscript> manuscriptOptional = manuscriptRepository.findById(id);
        if (manuscriptOptional.isPresent()) {
            Manuscript manuscript = manuscriptOptional.get();
            
            // 조회수 증가
            manuscript.incrementViewCount();
            
            Manuscript updatedManuscript = manuscriptRepository.save(manuscript);
            logger.info("원고 조회수 증가 성공: ID={}, 새 조회수={}", id, updatedManuscript.getViewCount());
            return ResponseEntity.ok(updatedManuscript);
        } else {
            logger.warn("조회수를 증가시킬 원고를 찾을 수 없음: {}", id);
            return ResponseEntity.notFound().build();
        }
    }
}
//>>> Clean Arch / Inbound Adaptor
