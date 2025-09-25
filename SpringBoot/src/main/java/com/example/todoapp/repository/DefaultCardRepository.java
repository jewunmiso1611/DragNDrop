package com.example.todoapp.repository;

import com.example.todoapp.domain.DefaultCard;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DefaultCardRepository extends JpaRepository<DefaultCard, Long> {
}
