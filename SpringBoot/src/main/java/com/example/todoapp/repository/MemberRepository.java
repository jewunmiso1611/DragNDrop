package com.example.todoapp.repository;

import com.example.todoapp.domain.Member;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Long> {

    Optional<Member> findByUserid(String userid);

    boolean existsByUserid(String userid);

    List<Member> findAllByEmail(String email);

    Optional<Member> findByUseridAndEmail(String userid, String email);

}
