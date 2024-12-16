# Proyecto SINH2O

# Descripcion
El proyecto SINH2O es un sistema automatizado destinado a optimizar la gestión agrícola; 
Utiliza sensores de humedad, temperatura, ultrasonicos y de flujo conectados a un controlador Arduino 
junto con una base de datos no relacional en MongoDb, para monitorizar y gestionar con precisión los cultivos.
El sistema incluye una aplicación web y una aplicación móvil.

# Tecnologias
- Python
- Node.js
- Arduino
- MongoDB (Base de datos no relacional)
- Angular
- Ionic

Para ejecutar el sistema tanto en el Backend como en el Frontend se debe ejecutar el comando NPM INSTALL
Para iniciar el Backend es necesario ejecturar node server.js
Para iniciar el Frontend es necesario ejecturar Ionic serve

# En caso de errores de tensorflow
- Ingresar en el carpeta node_modules/@tensorflow/tfjs-node/deps/lib
- Copiar el archivo tensorflow.dll
- Luego ingresar a la carpeta node_modules@tensorflow/tfjs-node/lib/napi-v8
- Pegar el archivo tensorflow.dll
  
