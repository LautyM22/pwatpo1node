# self-contained API integration test script
$baseUrl = "http://localhost:3000"

Write-Host "🚀 Starting Express server in the background..." -ForegroundColor Cyan
$nodeProcess = Start-Process node -ArgumentList "src/index.js" -NoNewWindow -PassThru

# Wait for server to boot
Write-Host "⏳ Waiting for server to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

function Invoke-Api($method, $uri, $body = $null) {
    $params = @{
        Uri = $uri
        Method = $method
        ContentType = "application/json"
        UseBasicParsing = $true
    }
    if ($body) {
        $params["Body"] = $body
    }
    try {
        $res = Invoke-WebRequest @params
        return [PSCustomObject]@{
            StatusCode = $res.StatusCode
            Content = $res.Content
            Headers = $res.Headers
        }
    } catch {
        if ($_.Exception -and $_.Exception.Response) {
            $response = $_.Exception.Response
            $statusCode = [int]$response.StatusCode
            $content = ""
            if ($response.GetType().GetMethod("GetResponseStream")) {
                $reader = New-Object System.IO.StreamReader($response.GetResponseStream())
                $content = $reader.ReadToEnd()
                $reader.Close()
            } elseif ($response.Content) {
                $content = $response.Content.ReadAsStringAsync().Result
            }
            return [PSCustomObject]@{
                StatusCode = $statusCode
                Content = $content
                Headers = $response.Headers
            }
        } else {
            return [PSCustomObject]@{
                StatusCode = 500
                Content = $_.Exception.Message
                Headers = @{}
            }
        }
    }
}

function Assert-Status($response, $expectedStatus, $testName) {
    $status = $response.StatusCode
    if ($status -eq $expectedStatus) {
        Write-Host "✅ $testName - PASSED (Status $status)" -ForegroundColor Green
    } else {
        Write-Host "❌ $testName - FAILED (Expected $expectedStatus, got $status)" -ForegroundColor Red
        Write-Host "Response Content: $($response.Content)" -ForegroundColor Red
    }
}

try {
    Write-Host "=== STARTING QA API TEST SUITE ===" -ForegroundColor Cyan

    # TC-01: GET /api/cards
    Write-Host "TC-01: GET /api/cards"
    $res = Invoke-Api -Method Get -Uri "$baseUrl/api/cards"
    Assert-Status $res 200 "TC-01: GET /api/cards"

    # TC-02: GET /api/cards?page=1&limit=5&lang=en
    Write-Host "TC-02: GET /api/cards?page=1&limit=5&lang=en"
    $res = Invoke-Api -Method Get -Uri "$baseUrl/api/cards?page=1&limit=5&lang=en"
    Assert-Status $res 200 "TC-02: GET /api/cards with pag/i18n"
    $totalCount = $res.Headers["X-Total-Count"]
    if ($totalCount) {
        Write-Host "  Header X-Total-Count present: $totalCount" -ForegroundColor Green
    } else {
        Write-Host "  Header X-Total-Count MISSING!" -ForegroundColor Red
    }

    # TC-03: POST /api/cards
    Write-Host "TC-03: POST /api/cards (Valid payload)"
    $body = @{
        cost = 3
        atk = 2
        def = 4
        image = "http://example.com/card.png"
        typeId = 1
        rarityId = 1
        translations = @(
            @{ language = "es"; name = "Dragón QA"; description = "Carta de prueba de QA" }
            @{ language = "en"; name = "QA Dragon"; description = "QA test card" }
        )
    } | ConvertTo-Json -Depth 5
    $res = Invoke-Api -Method Post -Uri "$baseUrl/api/cards" -Body $body
    Assert-Status $res 201 "TC-03: POST /api/cards"
    $createdId = $null
    if ($res.StatusCode -eq 201) {
        $card = $res.Content | ConvertFrom-Json
        $createdId = $card.id
        Write-Host "  Created Card ID: $createdId" -ForegroundColor Green
    }

    if ($null -ne $createdId) {
        # TC-04: GET /api/cards/:id
        Write-Host "TC-04: GET /api/cards/$createdId"
        $res = Invoke-Api -Method Get -Uri "$baseUrl/api/cards/$createdId"
        Assert-Status $res 200 "TC-04: GET /api/cards/:id"

        # TC-05: PUT /api/cards/:id
        Write-Host "TC-05: PUT /api/cards/$createdId (Update)"
        $bodyUpdate = @{
            cost = 4
            atk = 3
            def = 5
            image = "http://example.com/card-updated.png"
            typeId = 1
            rarityId = 1
            translations = @(
                @{ language = "es"; name = "Dragón QA Modificado"; description = "Modificada en prueba" }
                @{ language = "en"; name = "Updated QA Dragon"; description = "Updated in test" }
            )
        } | ConvertTo-Json -Depth 5
        $res = Invoke-Api -Method Put -Uri "$baseUrl/api/cards/$createdId" -Body $bodyUpdate
        Assert-Status $res 200 "TC-05: PUT /api/cards/:id"

        # TC-06: DELETE /api/cards/:id
        Write-Host "TC-06: DELETE /api/cards/$createdId"
        $res = Invoke-Api -Method Delete -Uri "$baseUrl/api/cards/$createdId"
        Assert-Status $res 200 "TC-06: DELETE /api/cards/:id"
    } else {
        Write-Host "Skipping TC-04, TC-05, TC-06 because card creation failed." -ForegroundColor Yellow
    }

    # TC-07: POST /api/cards with empty body
    Write-Host "TC-07: POST /api/cards (Empty body)"
    $res = Invoke-Api -Method Post -Uri "$baseUrl/api/cards" -Body "{}"
    Assert-Status $res 400 "TC-07: POST /api/cards (empty body)"

    # TC-08: POST /api/cards with invalid data
    Write-Host "TC-08: POST /api/cards (Invalid data: cost=-1)"
    $bodyInvalid = @{
        cost = -1
        atk = 2
        def = 4
        image = ""
        typeId = 1
        rarityId = 1
        translations = @()
    } | ConvertTo-Json -Depth 5
    $res = Invoke-Api -Method Post -Uri "$baseUrl/api/cards" -Body $bodyInvalid
    Assert-Status $res 400 "TC-08: POST /api/cards (invalid body)"

    # TC-09: GET /api/cards/abc (Invalid ID)
    Write-Host "TC-09: GET /api/cards/abc"
    $res = Invoke-Api -Method Get -Uri "$baseUrl/api/cards/abc"
    Assert-Status $res 400 "TC-09: GET /api/cards/abc"

    # TC-10: GET /api/cards/999999 (Non-existent ID)
    Write-Host "TC-10: GET /api/cards/999999"
    $res = Invoke-Api -Method Get -Uri "$baseUrl/api/cards/999999"
    Assert-Status $res 404 "TC-10: GET /api/cards/999999"

    # TC-11: PUT /api/cards/999999 (Non-existent ID)
    Write-Host "TC-11: PUT /api/cards/999999"
    $bodyUpdateEmpty = @{
        cost = 4
        atk = 3
        def = 5
        image = "http://example.com/card-updated.png"
        typeId = 1
        rarityId = 1
        translations = @(
            @{ language = "es"; name = "Dragón QA Modificado"; description = "Modificada en prueba" }
            @{ language = "en"; name = "Updated QA Dragon"; description = "Updated in test" }
        )
    } | ConvertTo-Json -Depth 5
    $res = Invoke-Api -Method Put -Uri "$baseUrl/api/cards/999999" -Body $bodyUpdateEmpty
    Assert-Status $res 404 "TC-11: PUT /api/cards/999999"

    # TC-12: DELETE /api/cards/999999 (Non-existent ID)
    Write-Host "TC-12: DELETE /api/cards/999999"
    $res = Invoke-Api -Method Delete -Uri "$baseUrl/api/cards/999999"
    Assert-Status $res 404 "TC-12: DELETE /api/cards/999999"

    Write-Host "=== QA API TEST SUITE COMPLETE ===" -ForegroundColor Cyan
} finally {
    # Clean up background server process
    if ($nodeProcess) {
        Write-Host "🛑 Stopping Express server (PID: $($nodeProcess.Id))..." -ForegroundColor Cyan
        Stop-Process -Id $nodeProcess.Id -Force
    }
}
