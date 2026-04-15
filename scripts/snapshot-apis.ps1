param(
  [string]$OutDir = "scripts/api-snapshots",
  [string]$AppId = "lacrtv",
  [int]$WpCategoryId = 9
)

$ErrorActionPreference = "Stop"

function Ensure-Dir([string]$Path) {
  if (-not (Test-Path -LiteralPath $Path)) {
    New-Item -ItemType Directory -Force -Path $Path | Out-Null
  }
}

function Write-JsonSnapshot {
  param(
    [Parameter(Mandatory=$true)][string]$Url,
    [Parameter(Mandatory=$true)][string]$OutFile
  )

  Ensure-Dir (Split-Path -Parent $OutFile)

  Write-Host "GET $Url"
  try {
    Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 30 -OutFile $OutFile | Out-Null
  } catch {
    $errPath = "$OutFile.error.txt"
    $_ | Out-String | Set-Content -Encoding UTF8 -LiteralPath $errPath
    Write-Host "  FAILED -> $errPath"
    return $false
  }

  return $true
}

Ensure-Dir $OutDir
Ensure-Dir "$OutDir/live"
Ensure-Dir "$OutDir/news"
Ensure-Dir "$OutDir/replay"
Ensure-Dir "$OutDir/radio"
Ensure-Dir "$OutDir/external"
Ensure-Dir "$OutDir/meta"
Ensure-Dir "$OutDir/dynamic"

$meta = [ordered]@{
  createdAt = (Get-Date).ToString("o")
  appId = $AppId
  wpCategoryId = $WpCategoryId
  endpoints = @()
}

$tveBase = "https://tveapi.acan.group/myapiv2"
$wpBase = "https://actu.crtv.cm/wp-json/wp/v2"

# ---- Baseline (tveapi) ----
$baseline = @(
  @{ url = "$tveBase/listLiveTV/$AppId/json"; out = "$OutDir/live/listLiveTV.$AppId.json" },
  @{ url = "$tveBase/listLiveRadios/$AppId/json"; out = "$OutDir/radio/listLiveRadios.$AppId.json" },
  @{ url = "$tveBase/guidetvnow/$AppId/json"; out = "$OutDir/live/guidetvnow.$AppId.json" },
  @{ url = "$tveBase/guidetvall/$AppId/today/json"; out = "$OutDir/live/guidetvall.today.$AppId.json" },
  @{ url = "$tveBase/listChannelsbygroup/$AppId/json"; out = "$OutDir/replay/listChannelsbygroup.$AppId.json" },
  @{ url = "$tveBase/alaunesliders/$AppId/json"; out = "$OutDir/replay/alaunesliders.$AppId.json" }
)

foreach ($e in $baseline) {
  $meta.endpoints += $e.url
  Write-JsonSnapshot -Url $e.url -OutFile $e.out | Out-Null
}

# ---- Baseline (WordPress) ----
$wpLatest = "$wpBase/posts?_embed=wp:featuredmedia,wp:term&per_page=20&page=1"
$wpCategory = "$wpBase/posts?_embed=wp:featuredmedia,wp:term&per_page=20&page=1&categories=$WpCategoryId"
$meta.endpoints += @($wpLatest, $wpCategory)
Write-JsonSnapshot -Url $wpLatest -OutFile "$OutDir/news/wp.posts.latest.page1.per20.json" | Out-Null
Write-JsonSnapshot -Url $wpCategory -OutFile "$OutDir/news/wp.posts.cat$WpCategoryId.page1.per20.json" | Out-Null

# ---- External single-channel bootstrap ----
$alu = "https://acangroup.org/aar/alutv/api.php"
$meta.endpoints += $alu
Write-JsonSnapshot -Url $alu -OutFile "$OutDir/external/acangroup.aar.alutv.api.php.json" | Out-Null

# ---- Dynamic sampling (best-effort) ----
# From alaunesliders: try to extract a few relatedItems URLs and snapshot them.
$sliderPath = "$OutDir/replay/alaunesliders.$AppId.json"
if (Test-Path -LiteralPath $sliderPath) {
  try {
    $slider = Get-Content -Raw -LiteralPath $sliderPath | ConvertFrom-Json
    $related = @()
    foreach ($it in ($slider.allitems | Select-Object -First 10)) {
      if ($it.relatedItems -and $it.relatedItems -ne "null") { $related += $it.relatedItems }
    }
    $related = $related | Select-Object -Unique -First 5

    $i = 0
    foreach ($u in $related) {
      $i++
      $meta.endpoints += $u
      Write-JsonSnapshot -Url $u -OutFile "$OutDir/dynamic/relatedItems.$i.json" | Out-Null
    }
  } catch {
    $_ | Out-String | Set-Content -Encoding UTF8 -LiteralPath "$OutDir/dynamic/relatedItems.parse.error.txt"
  }
}

$meta | ConvertTo-Json -Depth 6 | Set-Content -Encoding UTF8 -LiteralPath "$OutDir/meta/manifest.json"
Write-Host "Done -> $OutDir"

