package no.nav.data.team.common.validator;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.apache.commons.lang3.StringUtils;

import java.util.UUID;

public interface RequestElement extends Validated {

    String getId();

    @JsonIgnore
    String getIdentifyingFields();

    @JsonIgnore
    default String getRequestType() {
        return StringUtils.substringBeforeLast(getClass().getSimpleName(), "Request");
    }

    @JsonIgnore
    Boolean getUpdate();

    default boolean isUpdate() {
        return getUpdate();
    }

    @JsonIgnore
    void setUpdate(Boolean update);

    @JsonIgnore
    default UUID getIdAsUUID() {
        try {
            return getId() == null ? null : UUID.fromString(getId());
        } catch (IllegalArgumentException ignored) {
            return null;
        }
    }

}
