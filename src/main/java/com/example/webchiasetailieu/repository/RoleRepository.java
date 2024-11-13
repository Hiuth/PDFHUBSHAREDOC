package com.example.webchiasetailieu.repository;


import com.example.webchiasetailieu.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface RoleRepository extends JpaRepository<Role, String> {
    List<Role> findByNameIn(Collection<String> roleName);
}
