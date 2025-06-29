package miniproject.infra;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import miniproject.config.kafka.KafkaProcessor;
import miniproject.domain.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.stream.annotation.StreamListener;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;

@Service
public class AuthorManagementViewViewHandler {

    //<<< DDD / CQRS
    @Autowired
    private AuthorManagementViewRepository authorManagementViewRepository;

    @StreamListener(KafkaProcessor.INPUT)
    public void whenAuthorRegisterApplied_then_UPDATE_1(
        @Payload AuthorRegisterApplied authorRegisterApplied
    ) {
        try {
            if (!authorRegisterApplied.validate()) return;
            // view 객체 조회

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    //>>> DDD / CQRS
}
