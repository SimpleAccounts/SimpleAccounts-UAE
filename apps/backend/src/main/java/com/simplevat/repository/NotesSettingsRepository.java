package com.simplevat.repository;
import com.simplevat.entity.NotesSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Added NotesSettings Repository for
 * Feature 2718: Release 3 > Customer Invoice Note settings
 */
@Repository
public interface NotesSettingsRepository extends JpaRepository<NotesSettings,Integer> {

}