#!/bin/bash

# Cargar variables de entorno desde .env
set -a
source .env
set +a

# Navegar al directorio del backend
cd deportur-backend

# Iniciar Spring Boot
mvn spring-boot:run
