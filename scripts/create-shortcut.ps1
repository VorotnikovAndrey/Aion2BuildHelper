# Создаёт ярлык Aion2 Build Helper на рабочем столе и в меню «Пуск».
# Использование: npm run shortcut
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$launcher = Join-Path $root 'Aion2BuildHelper.vbs'
$icon = Join-Path $root 'build\icon.ico'
$shell = New-Object -ComObject WScript.Shell

$targets = @(
  [Environment]::GetFolderPath('Desktop'),
  [Environment]::GetFolderPath('Programs')
)

foreach ($folder in $targets) {
  $path = Join-Path $folder 'Aion2 Build Helper.lnk'
  $lnk = $shell.CreateShortcut($path)
  $lnk.TargetPath = Join-Path $env:WINDIR 'System32\wscript.exe'
  $lnk.Arguments = '"' + $launcher + '"'
  $lnk.WorkingDirectory = $root
  $lnk.IconLocation = "$icon,0"
  $lnk.Description = 'Aion2 Build Helper — помощник по билду персонажа'
  $lnk.Save()
  Write-Output "Ярлык: $path"
}
