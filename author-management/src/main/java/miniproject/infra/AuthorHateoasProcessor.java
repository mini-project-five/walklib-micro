package miniproject.infra;

import miniproject.domain.*;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.Link;
import org.springframework.hateoas.server.RepresentationModelProcessor;
import org.springframework.stereotype.Component;

@Component
public class AuthorHateoasProcessor
    implements RepresentationModelProcessor<EntityModel<Author>> {

    @Override
    public EntityModel<Author> process(EntityModel<Author> model) {
        return model;
    }
}
