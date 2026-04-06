# Validate-ControlTower.ps1
# Script to ensure synchronization and integrity of the Control Tower system.

$ControlTowerPath = "C:\Rental Docs\00_Control_Tower"
$TaskQueuePath = "$ControlTowerPath\MASTER_TASK_QUEUE.csv"
$SystemStatusPath = "$ControlTowerPath\SYSTEM_STATUS.json"
$DashboardPath = "$ControlTowerPath\MASTER_DASHBOARD.md"

Write-Host "--- CONTROL TOWER INTEGRITY CHECK ---" -ForegroundColor Cyan

# 1. Check for missing files
$FilesToCheck = @($TaskQueuePath, $SystemStatusPath, $DashboardPath)
foreach ($file in $FilesToCheck) {
    if (-not (Test-Path $file)) {
        Write-Error "CRITICAL: Missing file: $file"
        exit 1
    }
}
Write-Host "[OK] All core files present." -ForegroundColor Green

# 2. Validate Task Queue integrity
$tasks = Import-Csv $TaskQueuePath
$uniqueIds = $tasks | Group-Object Task_ID
if ($uniqueIds.Count -ne $tasks.Count) {
    Write-Warning "[FAIL] Duplicate Task IDs found in $TaskQueuePath"
    $uniqueIds | Where-Object { $_.Count -gt 1 } | ForEach-Object { Write-Host "   Duplicate ID: $($_.Name)" -ForegroundColor Yellow }
} else {
    Write-Host "[OK] No duplicate Task IDs." -ForegroundColor Green
}

# 3. Validate Source_File links
$missingFiles = @()
foreach ($task in $tasks) {
    $fullPath = Join-Path "C:\Rental Docs" $task.Source_File
    if (-not (Test-Path $fullPath)) {
        $missingFiles += $task.Source_File
    }
}
if ($missingFiles.Count -gt 0) {
    Write-Warning "[FAIL] Found $($missingFiles.Count) broken source file links."
    $missingFiles | Select-Object -Unique | ForEach-Object { Write-Host "   Missing Source: $_" -ForegroundColor Yellow }
} else {
    Write-Host "[OK] All Source_File links are valid." -ForegroundColor Green
}

# 4. Synchronize metrics between CSV and JSON
$totalCount = $tasks.Count
$completedCount = ($tasks | Where-Object { $_.Status -match 'Completed|Closed|Done' }).Count
$inProgressCount = ($tasks | Where-Object { $_.Status -match 'In Progress|Researching' }).Count
$completionPct = [math]::Round(($completedCount / $totalCount) * 100, 2)

$statusData = Get-Content $SystemStatusPath | ConvertFrom-Json
$jsonTotal = $statusData.overall_metrics.total_tasks
$jsonCompleted = $statusData.overall_metrics.completed_tasks

if ($totalCount -ne $jsonTotal -or $completedCount -ne $jsonCompleted) {
    Write-Warning "[FAIL] Synchronization mismatch between CSV and JSON."
    Write-Host "   CSV Total: $totalCount vs JSON Total: $jsonTotal" -ForegroundColor Yellow
    Write-Host "   CSV Completed: $completedCount vs JSON Completed: $jsonCompleted" -ForegroundColor Yellow
    
    # Recalculate and update JSON for consistency
    $categories = $tasks | Group-Object Category
    $catStats = foreach ($cat in $categories) {
        $catTotal = $cat.Count
        $catCompleted = ($cat.Group | Where-Object { $_.Status -match 'Completed|Closed|Done' }).Count
        $catPct = [math]::Round(($catCompleted / $catTotal) * 100, 2)
        [PSCustomObject]@{
            name = $cat.Name
            total_tasks = $catTotal
            completed_tasks = $catCompleted
            completion_percentage = $catPct
            blockers = @()
        }
    }

    $statusData.categories = $catStats
    $statusData.overall_metrics.total_tasks = $totalCount
    $statusData.overall_metrics.completed_tasks = $completedCount
    $statusData.overall_metrics.in_progress_tasks = $inProgressCount
    $statusData.overall_metrics.overall_completion_percentage = $completionPct
    $statusData.last_updated = (Get-Date -Format "yyyy-MM-dd")

    $statusData | ConvertTo-Json -Depth 5 | Set-Content $SystemStatusPath
    Write-Host "[REPAIR] Updated SYSTEM_STATUS.json to match latest task queue." -ForegroundColor Green
} else {
    Write-Host "[OK] CSV and JSON metrics are synchronized." -ForegroundColor Green
}

Write-Host "--- VALIDATION COMPLETE ---" -ForegroundColor Cyan
