#Requires -RunAsAdministrator

<#
.SYNOPSIS
    Completes the Folder Structure Standard v2.0 migration
.DESCRIPTION
    This script renames all remaining folders to match the NN_FAM__Name standard.
    Run this script AS ADMINISTRATOR after closing all File Explorer windows.
.NOTES
    Created: 2026-04-07
    Backup Location: C:\Rental Docs\Completed Research\90_RET__Backups\PRE_MIGRATION_BACKUP_*
#>

$ErrorActionPreference = "Stop"
$root = "C:\Rental Docs\Completed Research"

Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     FOLDER STRUCTURE STANDARD v2.0 - MIGRATION SCRIPT        ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Force close any Windows Explorer windows viewing these folders
Write-Host "Closing File Explorer windows..." -ForegroundColor Yellow
Get-Process explorer -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2
Start-Process explorer.exe
Start-Sleep -Seconds 1

Write-Host "Starting migration..." -ForegroundColor Green
Write-Host ""

# Define renames (including previously failed ones)
$renames = @(
    @{Old='00_System'; New='00_SYS__System'; Type='SYS'},
    @{Old='01_Planning'; New='01_WRK__Planning'; Type='WRK'},
    @{Old='02_Property_Design'; New='02_WRK__Design'; Type='WRK'},
    @{Old='03_Furnishing_Procurement'; New='03_WRK__Furnishing'; Type='WRK'},
    @{Old='04_Setup_Execution'; New='04_WRK__Setup'; Type='WRK'},
    @{Old='05_Operations'; New='05_WRK__Operations'; Type='WRK'},
    @{Old='06_Guest_Experience'; New='06_WRK__Guest_Experience'; Type='WRK'},
    @{Old='08_Pricing_Revenue'; New='08_WRK__Revenue'; Type='WRK'},
    @{Old='09_Legal_Compliance'; New='09_WRK__Compliance'; Type='WRK'},
    @{Old='10_Maintenance'; New='10_WRK__Maintenance'; Type='WRK'},
    @{Old='92_Prompts'; New='22_SUP__Prompts'; Type='SUP'},
    @{Old='98_Archive'; New='91_RET__Archive'; Type='RET'}
)

$successCount = 0
$skipCount = 0
$failCount = 0
$results = @()

foreach ($rename in $renames) {
    $oldPath = Join-Path $root $rename.Old
    $newPath = Join-Path $root $rename.New
    
    # Check if already renamed
    if (Test-Path $newPath) {
        Write-Host "⏭️  SKIP: $($rename.New) (already exists)" -ForegroundColor Gray
        $skipCount++
        $results += [PSCustomObject]@{
            Action = "SKIP"
            OldName = $rename.Old
            NewName = $rename.New
            Type = $rename.Type
            Status = "Already migrated"
        }
        continue
    }
    
    # Check if source exists
    if (-not (Test-Path $oldPath)) {
        Write-Host "⏭️  SKIP: $($rename.Old) (not found)" -ForegroundColor Gray
        $skipCount++
        $results += [PSCustomObject]@{
            Action = "SKIP"
            OldName = $rename.Old
            NewName = $rename.New
            Type = $rename.Type
            Status = "Source not found"
        }
        continue
    }
    
    # Attempt rename
    try {
        Rename-Item -Path $oldPath -NewName $rename.New -Force -ErrorAction Stop
        Write-Host "✅ $($rename.Old) → $($rename.New)" -ForegroundColor Green
        $successCount++
        $results += [PSCustomObject]@{
            Action = "SUCCESS"
            OldName = $rename.Old
            NewName = $rename.New
            Type = $rename.Type
            Status = "Renamed successfully"
        }
    } catch {
        Write-Host "❌ FAILED: $($rename.Old)" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
        $failCount++
        $results += [PSCustomObject]@{
            Action = "FAIL"
            OldName = $rename.Old
            NewName = $rename.New
            Type = $rename.Type
            Status = $_.Exception.Message
        }
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "MIGRATION SUMMARY" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ Successful: $successCount" -ForegroundColor Green
Write-Host "⏭️  Skipped: $skipCount" -ForegroundColor Gray
Write-Host "❌ Failed: $failCount" -ForegroundColor Red
Write-Host ""

# Export results
$reportPath = Join-Path $root "MIGRATION_RESULTS_$(Get-Date -Format 'yyyy-MM-dd_HHmmss').csv"
$results | Export-Csv -Path $reportPath -NoTypeInformation
Write-Host "Results saved to: $reportPath" -ForegroundColor Yellow

if ($failCount -eq 0) {
    Write-Host ""
    Write-Host "🎉 MIGRATION PHASE 1 COMPLETE!" -ForegroundColor Green
    Write-Host ""
    Write-Host "NEXT STEPS:" -ForegroundColor Cyan
    Write-Host "1. Create 21_SUP__Intake folder" -ForegroundColor White
    Write-Host "2. Handle empty folders (91_Templates, 96_Exports, 99_Legacy)" -ForegroundColor White
    Write-Host "3. Verify all folder names match standard" -ForegroundColor White
    Write-Host "4. Apply internal folder structure to each workstream" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "⚠️  Some folders could not be renamed." -ForegroundColor Yellow
    Write-Host "Please review the errors above and:" -ForegroundColor Yellow
    Write-Host "1. Close all applications using these folders" -ForegroundColor White
    Write-Host "2. Disable cloud sync (OneDrive, Dropbox, etc.)" -ForegroundColor White
    Write-Host "3. Run this script again" -ForegroundColor White
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
