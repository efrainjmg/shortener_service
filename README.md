Contratos de API - Sistema Distribuido de Acortador de URLs
Este documento define los contratos de comunicación entre todos los módulos del sistema.

🔗 Módulo 1: Servicio de Acortamiento
POST /shorten
Crea una nueva URL acortada.

Request Body
Campo	Tipo	Requerido	Descripción
longUrl	String	✅ Sí	URL completa a acortar (debe incluir http:// o https://)
customAlias	String	❌ No	Código personalizado deseado (si no se provee, se genera automáticamente)
expiresIn	Number	❌ No	Tiempo de expiración en segundos (si no se provee, la URL no expira)
Ejemplo:

json
{
  "longUrl": "https://youtu.be/xFrGuyw1V8s?si=Biwdg-LYqohj05Px",
  "customAlias": "mi-video",
  "expiresIn": 86400
}
Respuestas
✅ 201 Created - Éxito

json
{
  "status": "success",
  "data": {
    "shortCode": "abc123",
    "shortUrl": "https://miweb.com/abc123",
    "longUrl": "https://youtu.be/xFrGuyw1V8s?si=Biwdg-LYqohj05Px",
    "createdAt": "2025-11-28T20:03:00Z",
    "expiresAt": "2025-11-29T20:03:00Z"
  }
}
❌ 400 Bad Request - URL inválida

json
{
  "status": "error",
  "error": {
    "code": "INVALID_URL",
    "message": "The provided URL is not valid"
  }
}
❌ 409 Conflict - Alias en uso

json
{
  "status": "error",
  "error": {
    "code": "ALIAS_EXISTS",
    "message": "The custom alias is already in use"
  }
}
Códigos de Error
INVALID_URL - URL malformada o sin protocolo

ALIAS_EXISTS - El alias personalizado ya está en uso

ALIAS_INVALID - El alias contiene caracteres no permitidos

🔄 Módulo 2: Servicio de Redirección
GET /{codigo}
Redirige al usuario a la URL original asociada al código.

Path Parameters
Parámetro	Tipo	Descripción
codigo	String	El código corto a resolver (ej: abc123)
Ejemplo: GET /abc123

Respuestas
✅ 302 Found - Redirección exitosa

text
HTTP/1.1 302 Found
Location: https://youtu.be/xFrGuyw1V8s?si=Biwdg-LYqohj05Px
Cache-Control: no-cache
Content-Type: application/json
Body (opcional):

json
{
  "status": "redirect",
  "longUrl": "https://youtu.be/xFrGuyw1V8s?si=Biwdg-LYqohj05Px"
}
❌ 404 Not Found - Código no existe

json
{
  "status": "error",
  "error": {
    "code": "URL_NOT_FOUND",
    "message": "The shortened URL does not exist or has expired"
  }
}
Códigos de Error
URL_NOT_FOUND - El código no existe en la base de datos

URL_EXPIRED - La URL existió pero ya expiró

Implementación Lambda
python
def lambda_handler(event, context):
    # Buscar URL en DynamoDB
    long_url = get_long_url_from_db(short_code)
    
    # Registrar analítica
    record_click(short_code)
    
    return {
        "statusCode": 302,
        "headers": {
            "Location": long_url,
            "Cache-Control": "no-cache"
        }
    }
📊 Módulo 3: Servicio de Estadísticas
GET /stats/{codigo}
Obtiene las estadísticas de uso de una URL acortada.

Path Parameters
Parámetro	Tipo	Descripción
codigo	String	El código corto para consultar estadísticas
Query Parameters
Parámetro	Tipo	Requerido	Descripción
startDate	String	❌ No	Fecha de inicio en formato YYYY-MM-DD
endDate	String	❌ No	Fecha de fin en formato YYYY-MM-DD
Nota: Si no se proveen fechas, retorna estadísticas de los últimos 30 días.

Ejemplo: GET /stats/abc123?startDate=2025-11-01&endDate=2025-11-28

Respuestas
✅ 200 OK - Estadísticas obtenidas

json
{
  "status": "success",
  "data": {
    "shortCode": "abc123",
    "shortUrl": "https://miweb.com/abc123",
    "longUrl": "https://youtu.be/xFrGuyw1V8s?si=Biwdg-LYqohj05Px",
    "createdAt": "2025-11-01T10:00:00Z",
    "totalClicks": 1547,
    "analytics": {
      "clicksByDate": [
        {
          "date": "2025-11-01",
          "clicks": 45
        },
        {
          "date": "2025-11-02",
          "clicks": 67
        },
        {
          "date": "2025-11-03",
          "clicks": 89
        }
      ],
      "topReferrers": [
        {
          "referrer": "twitter.com",
          "clicks": 234
        },
        {
          "referrer": "facebook.com",
          "clicks": 189
        },
        {
          "referrer": "direct",
          "clicks": 156
        }
      ],
      "dateRange": {
        "start": "2025-11-01",
        "end": "2025-11-28"
      }
    }
  }
}
❌ 404 Not Found - Código no existe

json
{
  "status": "error",
  "error": {
    "code": "URL_NOT_FOUND",
    "message": "No statistics found for this short code"
  }
}
❌ 400 Bad Request - Rango de fechas inválido

json
{
  "status": "error",
  "error": {
    "code": "INVALID_DATE_RANGE",
    "message": "Start date must be before end date"
  }
}
Códigos de Error
URL_NOT_FOUND - No existen estadísticas para este código

INVALID_DATE_RANGE - La fecha de inicio debe ser anterior a la fecha de fin

INVALID_DATE_FORMAT - Formato de fecha incorrecto (usar YYYY-MM-DD)

🌐 Formato Estándar de Respuestas
Todos los endpoints siguen esta estructura consistente:

Respuesta Exitosa
json
{
  "status": "success",
  "data": {
    // ... datos específicos del endpoint
  }
}
Respuesta de Error
json
{
  "status": "error",
  "error": {
    "code": "ERROR_CODE",
    "message": "Descripción legible del error"
  }
}
🔧 Configuración CORS
Todos los Lambdas deben incluir estos headers para permitir llamadas desde los frontends:

json
{
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
}
📝 Notas de Integración
Para el Frontend de Acortamiento (Módulo 5)
Usar POST /shorten para crear URLs cortas

Mostrar data.shortUrl al usuario

Implementar botón de copiar que copie data.shortUrl

Para redirección, implementar ruta /short/{codigo} que llame a GET /{codigo}

Para el Frontend de Estadísticas (Módulo 4)
Usar GET /stats/{codigo} con filtros de fecha opcionales

Renderizar clicksByDate como gráfico de línea/barras

Mostrar topReferrers como lista o gráfico de torta

Resaltar totalClicks como métrica principal

Para API Gateway
Módulo 2 requiere configuración especial:

Method Response: Declarar status code 302 y header Location

Integration Response: Mapear el header Location desde la respuesta Lambda

🧪 Ejemplos de Testing
Probar Acortamiento
bash
curl -X POST https://api.miweb.com/shorten \
  -H "Content-Type: application/json" \
  -d '{
    "longUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  }'
Probar Redirección
bash
curl -L https://miweb.com/abc123
# Debe redirigir a la URL original
Probar Estadísticas
bash
curl https://api.miweb.com/stats/abc123?startDate=2025-11-01&endDate=2025-11-28