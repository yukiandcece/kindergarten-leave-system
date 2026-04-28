$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$port = 8080
$listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Any, $port)
$listener.Start()

Write-Host "Static server running on 0.0.0.0:$port"
Write-Host "Serving folder: $root"

function Get-ContentType([string]$path) {
  switch ([System.IO.Path]::GetExtension($path).ToLowerInvariant()) {
    ".html" { "text/html; charset=utf-8" }
    ".css"  { "text/css; charset=utf-8" }
    ".js"   { "application/javascript; charset=utf-8" }
    ".json" { "application/json; charset=utf-8" }
    ".png"  { "image/png" }
    ".jpg"  { "image/jpeg" }
    ".jpeg" { "image/jpeg" }
    ".gif"  { "image/gif" }
    ".svg"  { "image/svg+xml" }
    default { "application/octet-stream" }
  }
}

while ($true) {
  $client = $listener.AcceptTcpClient()
  $stream = $client.GetStream()
  $reader = New-Object System.IO.StreamReader($stream, [System.Text.Encoding]::ASCII, $false, 1024, $true)
  $requestLine = $reader.ReadLine()

  if ([string]::IsNullOrWhiteSpace($requestLine)) {
    $client.Close()
    continue
  }

  $parts = $requestLine.Split(" ")
  $method = $parts[0]
  $rawPath = if ($parts.Length -ge 2) { $parts[1] } else { "/" }

  while ($reader.ReadLine() -ne "") { }

  if ($method -ne "GET") {
    $response = "HTTP/1.1 405 Method Not Allowed`r`nConnection: close`r`n`r`n"
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($response)
    $stream.Write($bytes, 0, $bytes.Length)
    $client.Close()
    continue
  }

  $pathOnly = $rawPath.Split("?")[0].TrimStart("/")
  if ([string]::IsNullOrWhiteSpace($pathOnly)) { $pathOnly = "index.html" }
  $pathOnly = [System.Uri]::UnescapeDataString($pathOnly)
  $filePath = Join-Path $root $pathOnly

  if ((-not (Test-Path $filePath)) -or (Get-Item $filePath).PSIsContainer) {
    $body = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
    $header = "HTTP/1.1 404 Not Found`r`nContent-Type: text/plain; charset=utf-8`r`nContent-Length: $($body.Length)`r`nConnection: close`r`n`r`n"
    $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
    $stream.Write($headerBytes, 0, $headerBytes.Length)
    $stream.Write($body, 0, $body.Length)
    $client.Close()
    continue
  }

  $body = [System.IO.File]::ReadAllBytes($filePath)
  $contentType = Get-ContentType $filePath
  $header = "HTTP/1.1 200 OK`r`nContent-Type: $contentType`r`nContent-Length: $($body.Length)`r`nConnection: close`r`n`r`n"
  $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
  $stream.Write($headerBytes, 0, $headerBytes.Length)
  $stream.Write($body, 0, $body.Length)
  $client.Close()
}
