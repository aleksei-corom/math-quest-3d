# MATH QUEST 3D - PowerShell Server
# Steam Fair 2025 - Grado 9 N4

$Host.UI.RawUI.WindowTitle = " MATH QUEST 3D - Servidor"
Clear-Host

Write-Host ""
Write-Host "  " -ForegroundColor Green
Write-Host "  ======================================================" -ForegroundColor Green
Write-Host "  |                                                    |" -ForegroundColor Green
Write-Host "  |      MATH QUEST 3D - CAMINO AL END                 |" -ForegroundColor Green
Write-Host "  |                                                    |" -ForegroundColor Green
Write-Host "  |      Minecraft Voxel Math Adventure                |" -ForegroundColor Green
Write-Host "  |                                                    |" -ForegroundColor Green
Write-Host "  |      Steam Fair 2025 - Grado 9 N4                  |" -ForegroundColor Green
Write-Host "  |                                                    |" -ForegroundColor Green
Write-Host "  ======================================================" -ForegroundColor Green
Write-Host "                                                        " -ForegroundColor Green
Write-Host "  " -ForegroundColor Green
Write-Host ""
Write-Host "   Integrantes:" -ForegroundColor Cyan
Write-Host "      Gabriela Sofa Ramrez Martnez" -ForegroundColor White
Write-Host "      David Alejandro Corpas Muoz" -ForegroundColor White
Write-Host "      ngela Mara Crizn Herrera" -ForegroundColor White
Write-Host ""
Write-Host "  " -ForegroundColor Yellow
Write-Host ""

# Configuracin
$port = 8000
$url = "http://localhost:$port/"
$rootPath = $PSScriptRoot

# Funcin para crear servidor HTTP simple con .NET
function Start-SimpleServer {
    param(
        [string]$Path,
        [int]$Port
    )
    
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add("http://localhost:$Port/")
    
    try {
        $listener.Start()
        Write-Host "   Servidor iniciado en $url" -ForegroundColor Green
        Write-Host ""
        Write-Host "   Abre tu navegador en:" -ForegroundColor Cyan
        Write-Host "     $url" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "    NO cierres esta ventana mientras juegas" -ForegroundColor Red
        Write-Host "    Presiona Ctrl+C para detener el servidor" -ForegroundColor Red
        Write-Host ""
        Write-Host "  " -ForegroundColor Yellow
        Write-Host ""
        
        # Abrir navegador automticamente
        Start-Process $url
        
        # Loop para servir archivos
        while ($listener.IsListening) {
            $context = $listener.GetContext()
            $request = $context.Request
            $response = $context.Response
            
            # Obtener ruta del archivo
            $localPath = $request.Url.LocalPath
            if ($localPath -eq "/") {
                $localPath = "/index.html"
            }
            
            $filePath = Join-Path $Path $localPath.TrimStart("/")
            
            # Verificar si el archivo existe
            if (Test-Path $filePath -PathType Leaf) {
                # Determinar tipo de contenido
                $extension = [System.IO.Path]::GetExtension($filePath)
                $contentType = switch ($extension) {
                    ".html" { "text/html; charset=utf-8" }
                    ".css" { "text/css; charset=utf-8" }
                    ".js" { "application/javascript; charset=utf-8" }
                    ".json" { "application/json; charset=utf-8" }
                    ".png" { "image/png" }
                    ".jpg" { "image/jpeg" }
                    ".jpeg" { "image/jpeg" }
                    ".gif" { "image/gif" }
                    ".svg" { "image/svg+xml" }
                    ".mp3" { "audio/mpeg" }
                    ".wav" { "audio/wav" }
                    ".woff" { "font/woff" }
                    ".woff2" { "font/woff2" }
                    default { "application/octet-stream" }
                }
                
                # Leer y enviar archivo
                $content = [System.IO.File]::ReadAllBytes($filePath)
                $response.ContentType = $contentType
                $response.ContentLength64 = $content.Length
                $response.OutputStream.Write($content, 0, $content.Length)
                
                Write-Host "   $localPath" -ForegroundColor Gray
            } else {
                # 404 Not Found
                $response.StatusCode = 404
                $response.ContentType = "text/html; charset=utf-8"
                $html = "<html><body><h1>404 - Archivo no encontrado</h1><p>$localPath</p></body></html>"
                $buffer = [System.Text.Encoding]::UTF8.GetBytes($html)
                $response.OutputStream.Write($buffer, 0, $buffer.Length)
                
                Write-Host "   404: $localPath" -ForegroundColor Red
            }
            
            $response.OutputStream.Close()
        }
    }
    catch {
        Write-Host "   Error: $_" -ForegroundColor Red
    }
    finally {
        $listener.Stop()
        Write-Host ""
        Write-Host "   Servidor detenido" -ForegroundColor Yellow
    }
}

# Intentar con Python primero
$pythonInstalled = $false
try {
    $null = Get-Command python -ErrorAction Stop
    $pythonInstalled = $true
    Write-Host "   Python detectado" -ForegroundColor Green
    Write-Host ""
    Write-Host "   Iniciando servidor Python..." -ForegroundColor Cyan
    Write-Host ""
    
    # Abrir navegador despus de 2 segundos
    Start-Job -ScriptBlock {
        Start-Sleep -Seconds 2
        Start-Process "http://localhost:8000/"
    } | Out-Null
    
    # Iniciar servidor Python
    Set-Location $rootPath
    python -m http.server $port
}
catch {
    Write-Host "    Python no disponible" -ForegroundColor Yellow
    Write-Host "   Usando servidor PowerShell nativo..." -ForegroundColor Cyan
    Write-Host ""
    
    # Usar servidor .NET
    Start-SimpleServer -Path $rootPath -Port $port
}

Write-Host ""
Write-Host "  " -ForegroundColor Yellow
Write-Host "  Presiona ENTER para salir..." -ForegroundColor Gray
Read-Host
