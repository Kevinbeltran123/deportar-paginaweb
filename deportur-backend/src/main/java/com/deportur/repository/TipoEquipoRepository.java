package com.deportur.repository;

import com.deportur.model.TipoEquipo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TipoEquipoRepository extends JpaRepository<TipoEquipo, Long> {
    // Los métodos básicos (findAll, findById, save, delete) vienen de JpaRepository
}
