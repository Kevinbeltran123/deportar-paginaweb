package com.deportur.repository;

import com.deportur.model.DestinoTuristico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DestinoTuristicoRepository extends JpaRepository<DestinoTuristico, Long> {

    // Migrado de DestinoTuristicoDAO.buscarPorNombreOUbicacion()
    List<DestinoTuristico> findByNombreContainingOrUbicacionContaining(String nombre, String ubicacion);
}
