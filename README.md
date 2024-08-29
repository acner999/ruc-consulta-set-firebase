[repository-open-graph-template](https://github.com/user-attachments/assets/11af02d7-2ee5-43f3-9630-3c4648cd4fb2)
# Buscar Ruc en la SET, con firebase!

URL: [Previsualización del Proyecto](https://rucconsulta-4d509.web.app) 
Este proyecto permite consultar el RUC (Registro Único de Contribuyentes) a través de una API que realiza una llamada directa a un servicio de consulta. Utiliza Firebase Cloud Functions para manejar las solicitudes y cifrar los datos.

## Descripción

La aplicación consulta el RUC y el dígito verificador utilizando una API externa. Los datos se cifran antes de enviarlos a la API para proteger la información sensible. La aplicación está alojada en Firebase y utiliza Firebase Cloud Functions para la lógica del servidor.
y utilizo el firebase hosting para alojar el archivo html

## Tecnologías Utilizadas

- **Firebase**: Plataforma para desarrollar y gestionar aplicaciones web.
- **Firebase Cloud Functions**: Funciones en la nube para manejar las solicitudes.
- **Axios**: Cliente HTTP para realizar solicitudes a la API externa.
- **CryptoJS**: Biblioteca para cifrar y descifrar datos.
- **CORS**: Middleware para manejar solicitudes de diferentes orígenes.
- **Bootstrap**: Framework CSS para el diseño de la interfaz.
- **Font Awesome**: Iconos para la interfaz de usuario.

## Instalación

1. **Clonar el Repositorio**

    ```bash
    git clone https://github.com/acner999/consulta-ruc-firebase-cloud.git
    cd consulta-ruc-firebase-cloud
    ```

2. **Instalar Dependencias**

    Asegúrate de tener [Node.js](https://nodejs.org/) instalado, luego ejecuta:

    ```bash
    npm install
    ```

3. **Configurar el Proyecto**

    Crea un archivo `config.js` en la raíz del proyecto con la siguiente estructura y reemplaza los valores con tus configuraciones:

    ```javascript
    module.exports = {
      crypto: {
        key: 'TU_CLAVE_BASE64',
        iv: 'TU_IV_BASE64',
      },
      url: 'https://servicios.set.gov.py/eset-publico/timbrado'
    };
    ```

4. **Desplegar en Firebase**

    Asegúrate de estar autenticado en Firebase CLI y de haber configurado el proyecto. Luego, ejecuta:

    ```bash
    firebase deploy
    ```

## Uso

1. **Consultar el RUC**

    - Abre la página web en tu navegador: [Previsualización del Proyecto](https://rucconsulta-4d509.web.app)
    - Ingresa el RUC y el dígito verificador en los campos correspondientes.
    - Haz clic en el botón "Consultar".

2. **Ver Resultados**

    Los resultados de la consulta se mostrarán en la página.

## Contribución

Si deseas contribuir al proyecto, sigue estos pasos:

1. Haz un fork del repositorio.
2. Crea una nueva rama (`git checkout -b mi-rama`).
3. Realiza tus cambios y haz commit (`git commit -am 'Agregué algo nuevo'`).
4. Envía tus cambios a tu fork (`git push origin mi-rama`).
5. Crea un pull request en GitHub.

## Contacto

Para cualquier pregunta o comentario, puedes contactarme en:

- **Correo**: [acner@elyon.com.py](mailto:acner@elyon.com.py)
- **WhatsApp**: [+595992673894](https://wa.me/595992673894)
- **GitHub**: [acner999](https://github.com/acner999)
