package com.deportur.repository;

import com.deportur.model.Usuario;
import com.deportur.model.enums.Rol;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    // Para integración con Auth0
    Optional<Usuario> findByEmail(String email);

    // Migrado de UsuarioDAO.buscarPorNombreUsuario()
    Optional<Usuario> findByNombreUsuario(String nombreUsuario);

    // Migrado de UsuarioDAO.listarActivos()
    List<Usuario> findByActivoTrue();

    // Migrado de UsuarioDAO.existeAlMenosUnAdministrador()
    @Query("SELECT COUNT(u) > 0 FROM Usuario u WHERE u.rol = :rol AND u.activo = true AND u.idUsuario != :idUsuario")
    boolean existeOtroAdministrador(@Param("idUsuario") Long idUsuario, @Param("rol") Rol rol);
}
