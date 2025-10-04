package com.deportur.service;

import com.deportur.model.Usuario;
import com.deportur.model.enums.Rol;
import com.deportur.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.regex.Pattern;

/**
 * Servicio migrado de GestionUsuariosService.java
 * NOTA: Autenticación se maneja con Auth0, este servicio solo gestiona roles y permisos
 */
@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    /**
     * Migrado de GestionUsuariosService.registrarUsuario()
     * Solo admin puede registrar usuarios
     */
    @Transactional
    public Usuario registrarUsuario(Usuario usuario, Usuario usuarioActual) throws Exception {
        // Validar que el usuario actual sea admin
        if (usuarioActual == null || !usuarioActual.esAdministrador()) {
            throw new Exception("Solo los administradores pueden registrar usuarios");
        }

        // Validar datos obligatorios
        if (usuario.getNombreUsuario() == null || usuario.getNombreUsuario().trim().isEmpty()) {
            throw new Exception("El nombre de usuario es requerido");
        }

        if (usuario.getContrasena() == null || usuario.getContrasena().trim().isEmpty()) {
            throw new Exception("La contraseña es requerida");
        }

        // Validar contraseña
        validarContrasena(usuario.getContrasena());

        if (usuario.getNombre() == null || usuario.getNombre().trim().isEmpty()) {
            throw new Exception("El nombre es requerido");
        }

        if (usuario.getApellido() == null || usuario.getApellido().trim().isEmpty()) {
            throw new Exception("El apellido es requerido");
        }

        // Verificar nombre de usuario único
        usuarioRepository.findByNombreUsuario(usuario.getNombreUsuario()).ifPresent(u -> {
            throw new RuntimeException("El nombre de usuario ya existe");
        });

        return usuarioRepository.save(usuario);
    }

    /**
     * Migrado de GestionUsuariosService.actualizarUsuario()
     */
    @Transactional
    public Usuario actualizarUsuario(Long idUsuario, Usuario usuario, Usuario usuarioActual) throws Exception {
        if (usuarioActual == null || !usuarioActual.esAdministrador()) {
            throw new Exception("Solo los administradores pueden actualizar usuarios");
        }

        Usuario usuarioExistente = usuarioRepository.findById(idUsuario)
            .orElseThrow(() -> new Exception("El usuario que intenta actualizar no existe"));

        // Validaciones
        if (usuario.getNombreUsuario() == null || usuario.getNombreUsuario().trim().isEmpty()) {
            throw new Exception("El nombre de usuario es requerido");
        }

        // Si la contraseña cambió, validarla
        if (!usuario.getContrasena().equals(usuarioExistente.getContrasena())) {
            validarContrasena(usuario.getContrasena());
        }

        if (usuario.getNombre() == null || usuario.getNombre().trim().isEmpty()) {
            throw new Exception("El nombre es requerido");
        }

        if (usuario.getApellido() == null || usuario.getApellido().trim().isEmpty()) {
            throw new Exception("El apellido es requerido");
        }

        // Verificar nombre de usuario único
        usuarioRepository.findByNombreUsuario(usuario.getNombreUsuario()).ifPresent(u -> {
            if (!u.getIdUsuario().equals(idUsuario)) {
                throw new RuntimeException("El nombre de usuario ya está en uso por otro usuario");
            }
        });

        // Si está cambiando rol de admin a trabajador, verificar que quede al menos un admin
        if (usuarioExistente.esAdministrador() && !usuario.esAdministrador()) {
            if (!usuarioRepository.existeOtroAdministrador(idUsuario, Rol.ADMIN)) {
                throw new Exception("No se puede cambiar el rol. Debe permanecer al menos un administrador en el sistema");
            }
        }

        // Actualizar
        usuarioExistente.setNombreUsuario(usuario.getNombreUsuario());
        usuarioExistente.setContrasena(usuario.getContrasena());
        usuarioExistente.setRol(usuario.getRol());
        usuarioExistente.setNombre(usuario.getNombre());
        usuarioExistente.setApellido(usuario.getApellido());
        usuarioExistente.setEmail(usuario.getEmail());
        usuarioExistente.setActivo(usuario.getActivo());

        return usuarioRepository.save(usuarioExistente);
    }

    /**
     * Migrado de GestionUsuariosService.eliminarUsuario()
     * En realidad desactiva el usuario
     */
    @Transactional
    public void eliminarUsuario(Long idUsuario, Usuario usuarioActual) throws Exception {
        if (usuarioActual == null || !usuarioActual.esAdministrador()) {
            throw new Exception("Solo los administradores pueden eliminar usuarios");
        }

        Usuario usuario = usuarioRepository.findById(idUsuario)
            .orElseThrow(() -> new Exception("El usuario que intenta eliminar no existe"));

        // No puede eliminar su propio usuario
        if (usuario.getIdUsuario().equals(usuarioActual.getIdUsuario())) {
            throw new Exception("No puede eliminar su propio usuario");
        }

        // Si es admin, verificar que quede al menos uno
        if (usuario.esAdministrador()) {
            if (!usuarioRepository.existeOtroAdministrador(idUsuario, Rol.ADMIN)) {
                throw new Exception("No se puede eliminar el usuario. Debe permanecer al menos un administrador en el sistema");
            }
        }

        // Desactivar usuario
        usuario.setActivo(false);
        usuarioRepository.save(usuario);
    }

    /**
     * Migrado de GestionUsuariosService.buscarUsuarioPorId()
     */
    public Usuario buscarUsuarioPorId(Long idUsuario, Usuario usuarioActual) throws Exception {
        if (usuarioActual == null || !usuarioActual.esAdministrador()) {
            throw new Exception("Solo los administradores pueden consultar usuarios");
        }

        return usuarioRepository.findById(idUsuario)
            .orElseThrow(() -> new Exception("El usuario no existe"));
    }

    /**
     * Migrado de GestionUsuariosService.listarTodosLosUsuarios()
     */
    public List<Usuario> listarTodosLosUsuarios(Usuario usuarioActual) throws Exception {
        if (usuarioActual == null || !usuarioActual.esAdministrador()) {
            throw new Exception("Solo los administradores pueden listar usuarios");
        }

        return usuarioRepository.findAll();
    }

    /**
     * Migrado de GestionUsuariosService.listarUsuariosActivos()
     */
    public List<Usuario> listarUsuariosActivos(Usuario usuarioActual) throws Exception {
        if (usuarioActual == null || !usuarioActual.esAdministrador()) {
            throw new Exception("Solo los administradores pueden listar usuarios");
        }

        return usuarioRepository.findByActivoTrue();
    }

    /**
     * Buscar por email (para integración con Auth0)
     */
    public Usuario buscarPorEmail(String email) throws Exception {
        return usuarioRepository.findByEmail(email)
            .orElseThrow(() -> new Exception("Usuario no encontrado con ese email"));
    }

    /**
     * Migrado de GestionUsuariosService.validarContrasena()
     * Validación de contraseña: mínimo 8 caracteres y al menos un carácter especial
     */
    private void validarContrasena(String contrasena) throws Exception {
        if (contrasena == null || contrasena.length() < 8) {
            throw new Exception("La contraseña debe tener al menos 8 caracteres");
        }

        Pattern pattern = Pattern.compile("[!@#$%^&*(),.?\":{}|<>]");
        if (!pattern.matcher(contrasena).find()) {
            throw new Exception("La contraseña debe contener al menos un carácter especial");
        }
    }
}
