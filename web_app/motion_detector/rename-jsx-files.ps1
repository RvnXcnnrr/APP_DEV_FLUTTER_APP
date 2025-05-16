# Script to rename .js files containing JSX to .jsx
# Files to rename
$files = @(
    "src\components\AppDrawer.js",
    "src\components\AuthButton.js",
    "src\components\AuthTextField.js",
    "src\components\MotionEventList.js",
    "src\context\UserContext.js",
    "src\pages\DashboardPage.js",
    "src\pages\ProfilePage.js",
    "src\pages\SettingsPage.js",
    "src\pages\SplashScreen.js",
    "src\pages\auth\ForgotPasswordPage.js",
    "src\pages\auth\LoginPage.js",
    "src\pages\auth\RegisterPage.js"
)

# Rename each file
foreach ($file in $files) {
    $newFile = $file -replace '\.js$', '.jsx'
    
    # Check if file exists
    if (Test-Path $file) {
        Write-Host "Renaming $file to $newFile"
        Rename-Item -Path $file -NewName $newFile
    } else {
        Write-Host "File not found: $file"
    }
}

Write-Host "Renaming complete!"
