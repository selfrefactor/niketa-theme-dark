# Niketa Dark

[![Installs](https://img.shields.io/vscode-marketplace/i/selfrefactor.niketa-dark-theme.svg?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=selfrefactor.niketa-dark-theme)
[![Downloads](https://img.shields.io/vscode-marketplace/d/selfrefactor.niketa-dark-theme.svg?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=selfrefactor.niketa-dark-theme)

9 Dark VSCode Themes with same background

## Screens

### American Dad

![VSCode theme screen](screens/american.dad.png)

### Aqua Teen Hunger Force

![VSCode theme screen](screens/aqua.teen.hunger.force.png)

### Archer

![VSCode theme screen](screens/archer.png)

### Cleveland Show

![VSCode theme screen](screens/cleveland.show.png)

### Dilbert

![VSCode theme screen](screens/dilbert.png)

### Home Movies

![VSCode theme screen](screens/home.movies.png)

### South Park

![VSCode theme screen](screens/south.park.png)

### Trip Tank

![VSCode theme screen](screens/trip.tank.png)

### Ugly Americans

![VSCode theme screen](screens/ugly.americans.png)

## Naming

These are some of my favorite TV series

## Light theme

This set of themes is based on [Niketa theme](https://marketplace.visualstudio.com/items?itemName=selfrefactor.Niketa-theme), which is set of 9 light themes.

## Zed extension

`yarn out` (or `yarn out:zed`) also generates a [Zed](https://zed.dev) theme extension into `zed-extension/`
containing all dark themes from this repo plus the light themes from the sibling
[Niketa theme](https://marketplace.visualstudio.com/items?itemName=selfrefactor.Niketa-theme) repo
(when present; point `LIGHT_THEMES_DIR` elsewhere if that repo lives elsewhere):

1. Run `yarn out` to regenerate the themes and the extension.
2. In Zed open the Extensions panel (`zed: extensions`).
3. Click **Install Dev Extension** (or run `zed: install dev extension`).
4. Select the `zed-extension/` directory.
5. Pick a theme via `theme selector: toggle` (`cmd-k cmd-t`).

The conversion is a best-effort port of the VS Code themes (TextMate scopes are folded into
Zed's syntax tags, UI colors into Zed's style keys); unmapped scopes are reported by
`out:zed` so the table in [`src/lib/vscode-to-zed.js`](src/lib/vscode-to-zed.js) can be extended.
