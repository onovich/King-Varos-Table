param([string]$BlenderPath = 'D:\Programs\Blender\blender.exe', [ValidateSet('Tableware','Hall','Lighting','Furniture')][string]$Study = 'Tableware')
$ErrorActionPreference = 'Stop'
if (-not (Test-Path -LiteralPath $BlenderPath)) { throw "Blender not found: $BlenderPath" }
$taskScript = Join-Path $PSScriptRoot $(switch ($Study) { 'Hall' { 'build_blender_hall.py' } 'Lighting' { 'bake_imperial_lighting.py' } 'Furniture' { 'build_blender_furniture.py' } default { 'build_blender_tableware.py' } })
$taskLog = Join-Path $env:TEMP ('varos-blender-' + $Study + '.log')
$taskErrorLog = Join-Path $env:TEMP ('varos-blender-' + $Study + '.err')
$taskProcess = Start-Process -FilePath $BlenderPath -ArgumentList @(
    '--background', '--factory-startup', '--threads', '2', '--python-exit-code', '1',
    '--python', ('"' + $taskScript + '"')
) -WindowStyle Hidden -RedirectStandardOutput $taskLog -RedirectStandardError $taskErrorLog -PassThru
$null = $taskProcess.Handle
$taskProcess.PriorityClass = 'BelowNormal'
$taskProcess.ProcessorAffinity = if ([Environment]::ProcessorCount -ge 2) { 3 } else { 1 }
$taskProcess.WaitForExit()
$taskProcess.Refresh()
if ($null -ne $taskProcess.ExitCode -and $taskProcess.ExitCode -ne 0) {
    Get-Content -LiteralPath $taskErrorLog
    throw "Blender failed. See $taskLog"
}
Get-Content -LiteralPath $taskLog -Tail 8
