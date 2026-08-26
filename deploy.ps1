# ============================================
# BHAAV — One-Click Deploy Script
# Deploys backend to Railway, frontend to Vercel
# ============================================

Write-Host ""
Write-Host "  ========================================" -ForegroundColor Magenta
Write-Host "       BHAAV — Deploy to Production" -ForegroundColor Magenta
Write-Host "  ========================================" -ForegroundColor Magenta
Write-Host ""

# Step 1: Check prerequisites
Write-Host "[1/7] Checking prerequisites..." -ForegroundColor Yellow

$ngrok = Get-Command ngrok -ErrorAction SilentlyContinue
$vercel = Get-Command vercel -ErrorAction SilentlyContinue
$railway = Get-Command railway -ErrorAction SilentlyContinue

if (-not $ngrok) {
    Write-Host "  Installing ngrok..." -ForegroundColor Gray
    npm install -g ngrok
}
if (-not $vercel) {
    Write-Host "  Installing Vercel CLI..." -ForegroundColor Gray
    npm install -g vercel
}
if (-not $railway) {
    Write-Host "  Installing Railway CLI..." -ForegroundColor Gray
    npm install -g @railway/cli
}

Write-Host "  ✓ All tools ready" -ForegroundColor Green
Write-Host ""

# Step 2: Login to Railway
Write-Host "[2/7] Logging into Railway..." -ForegroundColor Yellow
railway login
Write-Host ""

# Step 3: Create/link Railway project
Write-Host "[3/7] Setting up Railway project..." -ForegroundColor Yellow
$railwayProject = railway whoami 2>&1
Write-Host "  Logged in as: $railwayProject" -ForegroundColor Gray

# Create a new Railway project
railway init bhaav-backend --yes
Write-Host ""

# Step 4: Set environment variables on Railway
Write-Host "[4/7] Setting Railway environment variables..." -ForegroundColor Yellow
Write-Host "  (You'll need your ANTHROPIC_API_KEY)" -ForegroundColor Gray

$apiKey = Read-Host "  Enter your Anthropic API key (or press Enter to skip)"
if ($apiKey) {
    railway variables set "ANTHROPIC_API_KEY=$apiKey"
}
railway variables set "NODE_ENV=production"
Write-Host ""

# Step 5: Deploy backend to Railway
Write-Host "[5/7] Deploying backend to Railway..." -ForegroundColor Yellow
railway up
Write-Host ""

# Wait for deployment
Write-Host "  Waiting for deployment to be ready..." -ForegroundColor Gray
Start-Sleep -Seconds 10

# Get the Railway URL
$railwayUrl = railway domain 2>&1
Write-Host "  Backend URL: $railwayUrl" -ForegroundColor Cyan
Write-Host ""

# Step 6: Deploy frontend to Vercel
Write-Host "[6/7] Deploying frontend to Vercel..." -ForegroundColor Yellow
Write-Host "  Setting API URL to: $railwayUrl" -ForegroundColor Gray

Set-Location frontend
vercel --prod --yes -e "VITE_API_URL=$railwayUrl"
Set-Location ..

$vercelUrl = vercel ls --scope=$(vercel whoami 2>&1) 2>&1 | Select-String "bhaav" | ForEach-Object { ($_ -split '\s+')[1] }
Write-Host ""

# Step 7: Summary
Write-Host "[7/7] Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "  ========================================" -ForegroundColor Magenta
Write-Host "       BHAAV is LIVE!" -ForegroundColor Magenta
Write-Host "  ========================================" -ForegroundColor Magenta
Write-Host ""
Write-Host "  Backend:  $railwayUrl" -ForegroundColor Cyan
Write-Host "  Frontend: https://bhaav.vercel.app" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Remember to set your Anthropic API key on Railway:" -ForegroundColor Yellow
Write-Host "    railway variables set ANTHROPIC_API_KEY=your-key-here" -ForegroundColor Gray
Write-Host ""
