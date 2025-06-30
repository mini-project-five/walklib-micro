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
    AuthorRepository authorRepository;

    @Autowired
    AuthorManagementRepository authorManagementRepository;

    @StreamListener(KafkaProcessor.INPUT)
    public void whatever(@Payload String eventString) {}

    @StreamListener(
        value = KafkaProcessor.INPUT,
        condition = "headers['type']=='AuthorRegisterApplied'"
    )
    public void wheneverAuthorRegisterApplied_AuthorManagementPolicy(
        @Payload AuthorRegisterApplied authorRegisterApplied
    ) {
        AuthorRegisterApplied event = authorRegisterApplied;
        System.out.println(
            "\n\n##### listener AuthorManagementPolicy : " +
            authorRegisterApplied +
            "\n\n"
        );

        // Sample Logic //
        AuthorManagement.authorManagementPolicy(event);
    }

    @StreamListener(
        value = KafkaProcessor.INPUT,
        condition = "headers['type']=='AuthorApproved'"
    )
    public void wheneverAuthorApproved_AuthorStatusManagementPolicy(
        @Payload AuthorApproved authorApproved
    ) {
        AuthorApproved event = authorApproved;
        System.out.println(
            "\n\n##### listener AuthorStatusManagementPolicy : " +
            authorApproved +
            "\n\n"
        );

        // Sample Logic //
        Author.authorStatusManagementPolicy(event);
    }

    @StreamListener(
        value = KafkaProcessor.INPUT,
        condition = "headers['type']=='AuthorRejected'"
    )
    public void wheneverAuthorRejected_AuthorStatusManagementPolicy(
        @Payload AuthorRejected authorRejected
    ) {
        AuthorRejected event = authorRejected;
        System.out.println(
            "\n\n##### listener AuthorRejectionManagementPolicy : " +
            authorRejected +
            "\n\n"
        );

        // Sample Logic //
        Author.authorRejectionManagementPolicy(event);
    }
}
//>>> Clean Arch / Inbound Adaptor
