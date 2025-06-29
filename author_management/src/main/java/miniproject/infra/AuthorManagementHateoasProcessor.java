package miniproject.infra;

import miniproject.domain.*;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.Link;
import org.springframework.hateoas.server.RepresentationModelProcessor;
import org.springframework.stereotype.Component;

@Component
public class AuthorManagementHateoasProcessor
    implements RepresentationModelProcessor<EntityModel<AuthorManagement>> {

    @Override
    public EntityModel<AuthorManagement> process(
        EntityModel<AuthorManagement> model
    ) {
        return model;
    }
}
