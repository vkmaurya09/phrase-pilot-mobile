# Phrase Pilot Mobile

A cross-platform mobile application for system-wide text rephrasing powered by AI language models.

## Overview

Phrase Pilot Mobile integrates with your mobile device to provide AI-powered text rephrasing. It works in two modes:

1. **Android:** A floating bubble overlay that can be accessed from any app
2. **iOS:** A keyboard extension that integrates with the standard keyboard

The app uses Capacitor to convert a React web application into a native mobile app with access to system features.

## Features

- Toggle to enable/disable rephrasing functionality
- Android floating bubble that can be positioned anywhere on screen
- iOS keyboard extension for in-app rephrasing
- Support for multiple AI providers (OpenAI, Hugging Face, Azure, Gemini, Local LLM)
- Clipboard integration
- Simple, intuitive interface

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Android Studio (for Android development)
- Xcode (for iOS development)
- Capacitor CLI

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/phrase-pilot-mobile.git
cd phrase-pilot-mobile
```

2. Install dependencies:
```bash
npm install
```

3. Build the web app:
```bash
npm run build
```

4. Add platforms:
```bash
npx cap add android
npx cap add ios
```

5. Sync Capacitor with your build:
```bash
npx cap sync
```

### Development

For web development and testing:
```bash
npm run dev
```

To open in Android Studio:
```bash
npx cap open android
```

To open in Xcode:
```bash
npx cap open ios
```

## Configuration

On first launch, the app will guide you through setting up your preferred AI provider:

1. **OpenAI:** Use GPT models (requires API key)
2. **Hugging Face:** Access open-source models
3. **Azure OpenAI:** For enterprise deployments
4. **Local LLM:** Connect to a self-hosted model
5. **Gemini:** Google's AI model

## How It Works

### Android Implementation

The Android version uses the Capacitor overlay permissions to create a floating bubble that can be accessed from any app. When clicked, it expands to show a text input interface where you can:

1. Enter or paste text
2. Click "Rephrase" to process with the configured AI
3. Copy the rephrased text back to your clipboard
4. Paste it into any application

### iOS Implementation

The iOS version uses a keyboard extension that adds a "Rephrase" button to your keyboard. When typing:

1. Write your text normally
2. Tap the "Rephrase" button
3. The text will be processed and replaced with the AI-generated alternative

## Android Permissions

The Android version requires the `SYSTEM_ALERT_WINDOW` permission to create the overlay bubble. You'll be prompted to grant this permission on first use.

## iOS Setup

For iOS, you'll need to enable the keyboard extension in your device settings:

1. Go to Settings > General > Keyboard > Keyboards
2. Add Phrase Pilot Keyboard
3. Enable "Allow Full Access"

## Troubleshooting

If you encounter issues:

- Ensure your API keys are correctly configured
- Check your internet connection
- For Android overlay issues, verify the app has permission to display over other apps
- For iOS keyboard issues, ensure full access is granted

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with React, Tailwind CSS, and Capacitor
- UI components from shadcn/ui
- Icons from Lucide
