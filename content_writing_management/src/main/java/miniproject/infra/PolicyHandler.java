package miniproject.infra;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import javax.naming.NameParser;
import javax.naming.NameParser;
import javax.transaction.Transactional;
import miniproject.config.kafka.KafkaProcessor;
import miniproject.domain.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.stream.annotation.StreamListener;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;

//<<< Clean Arch / Inbound Adaptor
@Service
@Transactional
public class PolicyHandler {

    @Autowired
    ManuscriptRepository manuscriptRepository;

    @StreamListener(KafkaProcessor.INPUT)
    public void whatever(@Payload String eventString) {}

    @StreamListener(
        value = KafkaProcessor.INPUT,
        condition = "headers['type']=='ManuscriptCreated'"
    )
    public void wheneverManuscriptCreated_ManuscriptCreatedPolicy(
        @Payload ManuscriptCreated manuscriptCreated
    ) {
        ManuscriptCreated event = manuscriptCreated;
        System.out.println(
            "\n\n##### listener ManuscriptCreatedPolicy : " +
            manuscriptCreated +
            "\n\n"
        );

        // Sample Logic //
        Manuscript.manuscriptCreatedPolicy(event);
    }

    @StreamListener(
        value = KafkaProcessor.INPUT,
        condition = "headers['type']=='ManuscriptUpdated'"
    )
    public void wheneverManuscriptUpdated_ManuscriptUpdatedPolicy(
        @Payload ManuscriptUpdated manuscriptUpdated
    ) {
        ManuscriptUpdated event = manuscriptUpdated;
        System.out.println(
            "\n\n##### listener ManuscriptUpdatedPolicy : " +
            manuscriptUpdated +
            "\n\n"
        );

        // Sample Logic //
        Manuscript.manuscriptUpdatedPolicy(event);
    }

    @StreamListener(
        value = KafkaProcessor.INPUT,
        condition = "headers['type']=='PublicationRequested'"
    )
    public void wheneverPublicationRequested_PublicationRequestPolicy(
        @Payload PublicationRequested publicationRequested
    ) {
        PublicationRequested event = publicationRequested;
        System.out.println(
            "\n\n##### listener PublicationRequestPolicy : " +
            publicationRequested +
            "\n\n"
        );

        // Sample Logic //
        Manuscript.publicationRequestPolicy(event);
    }
}
//>>> Clean Arch / Inbound Adaptor
