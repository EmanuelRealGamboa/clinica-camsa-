# Script para verificar que no se suban archivos sensibles antes de hacer push
# Uso: .\scripts\verify_clean_push.ps1

Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "VERIFICACIÓN DE ARCHIVOS SENSIBLES" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""

$errors = @()
$warnings = @()

# Verificar archivos en staging
Write-Host "Verificando archivos en staging..." -ForegroundColor Yellow
$stagedFiles = git diff --cached --name-only

if ($stagedFiles) {
    Write-Host "Archivos en staging:" -ForegroundColor Yellow
    $stagedFiles | ForEach-Object { Write-Host "  - $_" -ForegroundColor Gray }
    Write-Host ""
    
    # Verificar archivos sensibles
    $sensitivePatterns = @(
        '\.env$',
        '\.env\.production$',
        '\.env\.local$',
        'db\.sqlite3$',
        'venv/',
        '\.venv/',
        'node_modules/',
        '__pycache__/',
        '\.pyc$',
        'staticfiles/',
        'media/',
        '\.pem$',
        '\.key$',
        'secrets\.json$',
        'credentials\.json$'
    )
    
    foreach ($file in $stagedFiles) {
        foreach ($pattern in $sensitivePatterns) {
            if ($file -match $pattern) {
                $errors += "ARCHIVO SENSIBLE EN STAGING: $file"
            }
        }
    }
} else {
    Write-Host "No hay archivos en staging." -ForegroundColor Green
}

# Verificar archivos no rastreados que deberían estar en .gitignore
Write-Host "Verificando archivos no rastreados..." -ForegroundColor Yellow
$untrackedFiles = git ls-files --others --exclude-standard

if ($untrackedFiles) {
    $sensitiveUntracked = @()
    foreach ($file in $untrackedFiles) {
        if ($file -match '\.env$|\.env\.production$|db\.sqlite3$|venv/|\.venv/') {
            $sensitiveUntracked += $file
        }
    }
    
    if ($sensitiveUntracked) {
        $warnings += "Archivos sensibles no rastreados (deberían estar en .gitignore):"
        foreach ($file in $sensitiveUntracked) {
            $warnings += "  - $file"
        }
    }
}

# Verificar .gitignore
Write-Host "Verificando .gitignore..." -ForegroundColor Yellow
if (Test-Path ".gitignore") {
    $gitignoreContent = Get-Content ".gitignore" -Raw
    
    $requiredIgnores = @(
        '\.env',
        'db\.sqlite3',
        'venv/',
        'staticfiles/',
        'media/'
    )
    
    $missingIgnores = @()
    foreach ($pattern in $requiredIgnores) {
        if ($gitignoreContent -notmatch $pattern) {
            $missingIgnores += $pattern
        }
    }
    
    if ($missingIgnores) {
        $warnings += "Patrones recomendados faltantes en .gitignore:"
        foreach ($pattern in $missingIgnores) {
            $warnings += "  - $pattern"
        }
    } else {
        Write-Host "✓ .gitignore parece estar bien configurado" -ForegroundColor Green
    }
} else {
    $warnings += ".gitignore no encontrado"
}

# Mostrar resultados
Write-Host ""
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "RESULTADOS" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""

if ($errors.Count -eq 0 -and $warnings.Count -eq 0) {
    Write-Host "✓ VERIFICACIÓN EXITOSA" -ForegroundColor Green
    Write-Host "No se encontraron archivos sensibles en staging." -ForegroundColor Green
    Write-Host ""
    Write-Host "Puedes hacer push de forma segura." -ForegroundColor Green
    exit 0
} else {
    if ($errors.Count -gt 0) {
        Write-Host "✗ ERRORES ENCONTRADOS:" -ForegroundColor Red
        foreach ($error in $errors) {
            Write-Host "  $error" -ForegroundColor Red
        }
        Write-Host ""
        Write-Host "NO HAGAS PUSH hasta resolver estos errores." -ForegroundColor Red
        Write-Host "Para remover archivos del staging:" -ForegroundColor Yellow
        Write-Host "  git reset HEAD <archivo>" -ForegroundColor White
    }
    
    if ($warnings.Count -gt 0) {
        Write-Host "⚠ ADVERTENCIAS:" -ForegroundColor Yellow
        foreach ($warning in $warnings) {
            Write-Host "  $warning" -ForegroundColor Yellow
        }
        Write-Host ""
        Write-Host "Revisa estas advertencias antes de hacer push." -ForegroundColor Yellow
    }
    
    exit 1
}
