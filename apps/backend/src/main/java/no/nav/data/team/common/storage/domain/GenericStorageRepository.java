package no.nav.data.team.common.storage.domain;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GenericStorageRepository extends JpaRepository<GenericStorage, UUID> {

    boolean existsByIdAndType(UUID id, String type);

    Optional<GenericStorage> findByType(String type);

    List<GenericStorage> findAllByType(String type);

    long countByType(String type);

    long deleteByTypeAndCreatedDateBefore(String type, LocalDateTime time);

    void deleteByIdAndType(UUID id, String type);
}
