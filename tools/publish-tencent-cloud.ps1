[CmdletBinding()]
param(
    [string]$SshHost = "inkore",
    [string]$SiteUrl = "https://chronotabula.inkore.ink",
    [string]$RemoteRoot = "/var/www/chronotabula.inkore.ink",
    [string]$NginxService = "nginx",
    [switch]$SkipLint
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

function Invoke-NativeChecked {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Command,
        [Parameter(Mandatory = $false)]
        [string[]]$Arguments = @()
    )

    & $Command @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "Command failed with exit code $LASTEXITCODE`: $Command $($Arguments -join ' ')"
    }
}

function ConvertTo-BashSingleQuoted {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Value
    )

    return "'" + $Value.Replace("'", "'\''") + "'"
}

function Invoke-SshChecked {
    param(
        [Parameter(Mandatory = $true)]
        [string]$RemoteCommand
    )

    & ssh.exe $SshHost $RemoteCommand
    if ($LASTEXITCODE -ne 0) {
        throw "Remote command failed with exit code $LASTEXITCODE."
    }
}

function Invoke-SshText {
    param(
        [Parameter(Mandatory = $true)]
        [string]$RemoteCommand
    )

    $output = & ssh.exe $SshHost $RemoteCommand
    if ($LASTEXITCODE -ne 0) {
        throw "Remote command failed with exit code $LASTEXITCODE."
    }

    return ($output -join [Environment]::NewLine).Trim()
}

function New-RemoteCommand {
    param(
        [Parameter(Mandatory = $true)]
        [string[]]$Parts
    )

    return ($Parts -join "; ")
}

$projectRoot = Split-Path -Parent $PSScriptRoot
$distRoot = Join-Path $projectRoot "dist"
$packagePath = Join-Path $projectRoot "package.json"

Push-Location $projectRoot
try {
    foreach ($command in @("git.exe", "npm.cmd", "tar.exe", "ssh.exe", "curl.exe")) {
        if (-not (Get-Command $command -ErrorAction SilentlyContinue)) {
            throw "Required command is not available: $command"
        }
    }

    $branch = (& git.exe branch --show-current).Trim()
    if ($LASTEXITCODE -ne 0) {
        throw "Unable to determine the current Git branch."
    }
    if ($branch -ne "main") {
        throw "Publishing is allowed only from main. Current branch: $branch"
    }

    $status = @(& git.exe status --porcelain=v1 --untracked-files=all)
    if ($LASTEXITCODE -ne 0) {
        throw "Unable to inspect Git status."
    }
    if ($status.Count -gt 0) {
        throw "Working tree is not clean. Commit or stash changes before publishing."
    }

    $package = Get-Content -LiteralPath $packagePath -Raw -Encoding UTF8 | ConvertFrom-Json
    $version = [string]$package.version
    if ($version -notmatch "^[0-9A-Za-z][0-9A-Za-z._-]*$") {
        throw "Unsupported package version for a release path: $version"
    }

    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $stagePath = "/tmp/chronotabula-dist-v$version-$timestamp"
    $backupPath = "$RemoteRoot.bak.v$version-$timestamp"
    $failedPath = "$RemoteRoot.failed.v$version-$timestamp"
    $stageQuoted = ConvertTo-BashSingleQuoted $stagePath
    $rootQuoted = ConvertTo-BashSingleQuoted $RemoteRoot
    $backupQuoted = ConvertTo-BashSingleQuoted $backupPath
    $failedQuoted = ConvertTo-BashSingleQuoted $failedPath
    $nginxQuoted = ConvertTo-BashSingleQuoted $NginxService

    Write-Host "Publishing v$version from $branch."
    Invoke-NativeChecked "npm.cmd" @("run", "build")
    if (-not $SkipLint) {
        Invoke-NativeChecked "npm.cmd" @("run", "lint")
    }

    $indexPath = Join-Path $distRoot "index.html"
    if (-not (Test-Path -LiteralPath $indexPath -PathType Leaf)) {
        throw "Build did not produce dist/index.html."
    }

    $indexText = Get-Content -LiteralPath $indexPath -Raw -Encoding UTF8
    $assetMatch = [regex]::Match($indexText, 'src="(?<path>/assets/[^"'']+.js)"')
    if (-not $assetMatch.Success) {
        throw "Unable to find the main JavaScript asset in dist/index.html."
    }
    $assetRelativePath = $assetMatch.Groups["path"].Value.TrimStart("/")
    $assetLocalPath = Join-Path $distRoot ($assetRelativePath -replace "/", "\")
    if (-not (Test-Path -LiteralPath $assetLocalPath -PathType Leaf)) {
        throw "Build references a missing asset: $assetRelativePath"
    }

    $preflight = New-RemoteCommand @(
        "set -eu",
        "test ! -e $stageQuoted",
        "test ! -e $backupQuoted",
        "test ! -e $failedQuoted",
        "install -d -m 755 $stageQuoted"
    )
    Invoke-SshChecked $preflight

    Write-Host "Uploading build to the remote staging directory."
    tar.exe -cf - -C $distRoot . | ssh.exe $SshHost ("tar -xf - -C $stageQuoted")
    if ($LASTEXITCODE -ne 0) {
        throw "Build upload failed with exit code $LASTEXITCODE."
    }

    $indexHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $indexPath).Hash.ToLowerInvariant()
    $assetHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $assetLocalPath).Hash.ToLowerInvariant()
    $remoteIndexHash = (Invoke-SshText ("sha256sum $stageQuoted/index.html")).Split(" ")[0].ToLowerInvariant()
    $remoteAssetHash = (Invoke-SshText ("sha256sum $stageQuoted/$assetRelativePath")).Split(" ")[0].ToLowerInvariant()
    if ($indexHash -ne $remoteIndexHash -or $assetHash -ne $remoteAssetHash) {
        throw "Remote build hash does not match the local build."
    }

    $assetRemotePath = ConvertTo-BashSingleQuoted "$stagePath/$assetRelativePath"
    $swap = New-RemoteCommand @(
        "set -eu",
        "test -f $stageQuoted/index.html",
        "test -f $assetRemotePath",
        "chown -R root:root $stageQuoted",
        "find $stageQuoted -type d -exec chmod 755 {} +",
        "find $stageQuoted -type f -exec chmod 644 {} +",
        "mv $rootQuoted $backupQuoted",
        "mv $stageQuoted $rootQuoted",
        "if ! nginx -t; then mv $rootQuoted $failedQuoted; mv $backupQuoted $rootQuoted; exit 1; fi",
        "if ! systemctl reload $nginxQuoted; then mv $rootQuoted $failedQuoted; mv $backupQuoted $rootQuoted; systemctl reload $nginxQuoted || true; exit 1; fi",
        "printf 'deployed-v$version\\n'",
        "stat -c '%n | %y' $rootQuoted/index.html $backupQuoted/index.html"
    )
    Write-Host "Switching the live directory and reloading Nginx."
    Invoke-SshChecked $swap

    $siteBaseUrl = $SiteUrl.TrimEnd("/")
    $liveIndex = & curl.exe -fsS "$siteBaseUrl/"
    if ($LASTEXITCODE -ne 0) {
        throw "Online homepage verification failed."
    }
    if (-not (($liveIndex -join "`n") -match [regex]::Escape($assetRelativePath))) {
        throw "Online homepage does not reference the deployed JavaScript asset."
    }

    $assetStatus = (& curl.exe -fsS -o NUL -w "%{http_code}" "$siteBaseUrl/$assetRelativePath").Trim()
    if ($LASTEXITCODE -ne 0 -or $assetStatus -ne "200") {
        throw "Online asset verification failed with HTTP status $assetStatus."
    }

    Write-Host "Published v$version successfully."
    Write-Host "Backup: $backupPath"
}
finally {
    Pop-Location
}
