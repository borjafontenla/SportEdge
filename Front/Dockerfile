# frontend/Dockerfile

# --- Stage 1: Build React App ---
    FROM node:18-alpine AS build

    WORKDIR /app/frontend
    
    # Copiar archivos de dependencias
    COPY package.json package-lock.json* ./
    
    # Instalar dependencias
    RUN npm install
    
    # Copiar el resto del código fuente
    COPY . .
    
    # Construir la aplicación para producción
    # Asegúrate que las variables REACT_APP_* en .env estén configuradas
    # para apuntar a donde el backend será accesible DESDE EL NAVEGADOR DEL USUARIO
    # (Ej: http://localhost:5000, http://localhost:5001 si docker-compose mapea esos puertos)
    RUN npm run build
    
    # --- Stage 2: Serve static files with Nginx ---
    FROM nginx:1.25-alpine
    
    # Copiar artefactos construidos desde la etapa anterior
    COPY --from=build /app/frontend/build /usr/share/nginx/html
    
    # Copiar configuración personalizada de Nginx
    # Esta configuración maneja el enrutamiento de React Router
    COPY nginx.conf /etc/nginx/conf.d/default.conf
    
    # Exponer puerto 80 (puerto por defecto de Nginx)
    EXPOSE 80
    
    # El comando por defecto de nginx ya inicia el servidor
    # CMD ["nginx", "-g", "daemon off;"]