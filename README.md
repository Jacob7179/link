# link

**A customizable, multi-user link-in-bio website for GitHub Pages.**

`link` is a static alternative to a Linktree-style profile. It displays profile details, link cards, social icons, and an optional music player. Visitors can view the bundled default page or load another GitHub user's public `link` repository using `?user=USERNAME`.

No server, database, account system, Node.js, or build command is required.

## Demo URLs

Once deployed from `Jacob7179/link`:

| URL | Purpose |
| --- | --- |
| `https://jacob7179.github.io/link/` | Default page (Jacob7179) |
| `https://jacob7179.github.io/link/?user=Jacob7179` | Load Jacob7179's published GitHub preferences |
| `https://jacob7179.github.io/link/?user=USERNAME` | Load another GitHub user's published preferences |
| `https://jacob7179.github.io/link/editor.html` | Visual editor with live preview |

> These are expected URLs after GitHub Pages is enabled. An account must have a public repository named `link`, containing a valid `preference.js`, for the multi-user lookup to work.

## Features

- **Profile:** display name, handle, bio, profile image, and a customizable browser-tab icon (favicon).
- **Links:** editable card titles, descriptions, URLs, icons, optional card images, visibility, and ordering.
- **Appearance:** five themes (Lavender, Peach, Mint, Sky, Midnight), backgrounds, gradients, colors, widths, card shapes, and card styles (Glass, Solid, Outline, Minimal, Neon).
- **Assets:** image icons, SVGs, optional background image, custom `.css`, and custom `.woff2`/`.woff`/`.ttf`/`.otf` fonts.
- **Social icons:** icon images or symbols, plus an optional shared background with a chosen color and circle, rounded-square, or square shape.
- **Music:** direct audio files/HTTPS audio URLs, YouTube videos/playlists, and supported YouTube Music video/playlist URLs. Optional compact play button.
- **Publishing:** export/import `config.json` and `preference.js`; all editing occurs in the browser.
- **Multi-user:** load profile preferences and referenced assets from each user's public GitHub repository.

## Project structure

```text
link/
├── index.html                    # Public profile page
├── editor.html                   # Visual editor
├── preview.html                  # Embedded live preview
├── config.json                   # Bundled default/fallback profile
├── preference.js                 # Example/published GitHub-user profile
├── site.json                     # Default user and repository lookup settings
├── assets/
│   ├── app.js                    # Renderer, URL resolution, GitHub lookup, music
│   ├── editor.js                 # Editor state, preview, import/export
│   ├── style.css                 # Public page styles
│   ├── editor.css                # Editor styles
│   ├── icons/                    # Example SVG, WebP, and JPG icons
│   └── styles/example-card.css   # Example custom card stylesheet
├── .github/workflows/static.yml # Static GitHub Pages deployment
├── LICENSE
└── README.md
```

## Deploy to GitHub Pages

1. Create a **public** GitHub repository named `link` (or use the existing `Jacob7179/link` repository).
2. Upload **the contents of this project** directly into the repository root. `index.html` must be at the root, not inside another nested folder.
3. Open the repository's **Settings → Pages**.
4. Under **Build and deployment**, select **GitHub Actions**. The included `.github/workflows/static.yml` deploys the site whenever `main` receives a push; you can also run it manually from **Actions**.
5. Check the **Actions** tab for a successful deployment, then visit `https://YOUR-USERNAME.github.io/link/`.

The included workflow watches the `main` branch. If your branch has another name, update `branches: ["main"]` inside `.github/workflows/static.yml`.

### Run locally

The website loads configuration via `fetch`, so opening `index.html` directly as `file://` may fail. From the project directory, run a local server, for example:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000/` or `http://localhost:8000/editor.html`.

## Configure the default page

Edit **`config.json`** to change the profile bundled with the central website. The current sample is Jacob7179 with the Midnight theme, Neon cards, and links to social and music services.

Edit **`site.json`** to configure which GitHub profile is loaded by default:

```json
{
  "profileRepository": "link",
  "preferenceFile": "preference.js",
  "defaultUser": "Jacob7179"
}
```

**Important:** The home page first renders `config.json`, then attempts to load `Jacob7179/link/preference.js`. If that GitHub lookup succeeds, the remote preference **overrides the bundled profile**. If it fails, the bundled default stays visible. To keep the default page consistent, update both `config.json` in the central site and the default account's `preference.js`.

When a visitor explicitly requests `?user=USERNAME`, the website loads that GitHub account's preference. An invalid/missing account or repository shows an unavailable-profile message, not another user's fallback.

## Customize with the visual editor

Open `editor.html` (deployed or through the local server). Use the numbered sections:

1. **Your profile:** name, username, bio, avatar.
2. **Appearance:** theme, card shape, background type.
3. **Design and colors:** card style, layout, width, custom CSS paths, background, palette.
4. **Typography and media:** font, font sizes, avatar image path, favicon, default card icon.
5. **Background music:** music URL/path, title, looping, player visibility, play-button-only mode.
6. **Your links:** add/edit/reorder links, icons, card images, visibility.
7. **Social icons:** add/remove social URLs and set background on/off, shape, and color.

The live preview updates as you edit. **Editor changes are stored in your current browser's local storage; they are not automatically pushed to GitHub.**

- Click **Export config.json** to publish a revised bundled default page.
- Click **Export preference.js** to publish a profile in a GitHub user's repository.
- Click **Import JSON / JS** to load an existing exported configuration.
- **Reset** returns the editor to the `config.json` served by the central site.

After exporting, upload the file to the correct repository and commit the changes.

## Multi-user profile publishing

Every user who wants a page needs a **public GitHub repository called `link`** with a `preference.js` at its root. For example:

```text
USERNAME/link/
├── preference.js
└── assets/
    ├── icons/
    │   └── youtube.svg
    ├── images/
    │   └── avatar.png
    └── music/
        └── background.mp3
```

Visitors then open:

```text
https://jacob7179.github.io/link/?user=USERNAME
```

The site checks the public account and repository via GitHub's API, reads `preference.js` from the repository's **default branch**, and loads relative asset paths from the **same user's repository**. Public GitHub API requests can be rate-limited.

### `preference.js` format

The file **must** use `const preference =` followed by **valid JSON syntax**. It is parsed as data, not executed as arbitrary JavaScript. In particular, use double-quoted keys and strings; avoid comments, trailing commas, JavaScript expressions, or functions.

```javascript
const preference = {
  "name": "Your Name",
  "handle": "@yourname",
  "bio": "Welcome to my page",
  "avatar": "https://example.com/avatar.png",
  "theme": "midnight",
  "shape": "rounded",
  "background": "solid",
  "links": [
    {
      "title": "GitHub",
      "subtitle": "My projects",
      "url": "https://github.com/USERNAME",
      "iconPath": "assets/icons/github.svg",
      "enabled": true
    }
  ],
  "socials": [
    {
      "label": "GitHub",
      "url": "https://github.com/USERNAME",
      "iconPath": "assets/icons/github.svg"
    }
  ],
  "design": { "layout": "centered", "maxWidth": 510, "cardStyle": "neon" },
  "typography": { "fontFamily": "DM Sans", "nameSize": 29 },
  "assets": { "faviconPath": "assets/icons/favicon.png" },
  "socialStyle": {
    "backgroundEnabled": true,
    "shape": "circle",
    "backgroundColor": "#ffffff"
  },
  "music": {
    "path": "",
    "title": "Background music",
    "autoplay": false,
    "loop": true,
    "volume": 0.35,
    "showPlayer": true,
    "buttonOnly": true
  }
};
```

Start from the shipped `preference.js` or export from the editor for a full configuration with every field.

## Images, icons, and other asset paths

Relative paths are resolved **from the corresponding profile owner's repository** when using `?user=USERNAME`; the bundled `config.json` uses files on the central site.

Examples:

| Asset | Configuration path |
| --- | --- |
| Link icon | `assets/icons/YouTube Music.webp` |
| Playlist cover | `assets/icons/OFFICIAL HIGE DANDISM - Album.jpg` |
| Social icon | `assets/icons/github.svg` |
| Profile image | `assets/images/avatar.png` |
| Tab favicon | `assets/icons/favicon.png` |
| Custom font | `assets/fonts/custom.woff2` |
| Background image | `assets/images/background.webp` |
| Custom CSS | `assets/styles/custom.css` |

Paths may contain spaces and Unicode characters (for example, Japanese text), but they must match the **exact spelling, capitalization, extension, and directory** of uploaded files. The renderer URL-encodes path components. For example, `assets/icons/YouTube Music.webp` becomes a request for `assets/icons/YouTube%20Music.webp`.

Icons can be set via `iconPath` (preferred for an image), or in `icon` as an image filename or a Unicode symbol. A broken or missing image falls back to an arrow. The favicon can be a relative path or HTTPS URL, for example:

```json
"assets": {
  "faviconPath": "https://avatars.githubusercontent.com/u/70430960?v=4"
}
```

> Custom CSS and fonts are fetched from the owner repository for remote profiles. Only reference files you trust. Asset URLs must be public to load in visitors' browsers.

## Background music

Specify `music.path` in `preference.js` or in the editor. Examples:

```javascript
"music": {
  "path": "https://music.youtube.com/watch?v=Lpk3m6wLyrE",
  "title": "Shower (Instrumental)",
  "autoplay": false,
  "loop": true,
  "volume": 0.35,
  "showPlayer": true,
  "buttonOnly": true
}
```

Supported source types:

- Direct HTTPS audio URLs or relative audio files such as `assets/music/background.mp3` (subject to browser format support).
- YouTube video URLs (`watch`, `youtu.be`, `shorts`, and supported live links), and playlist URLs.
- YouTube Music **video or playlist** URLs that can be embedded through YouTube's player.

**Not supported as direct playback sources:** YouTube/YouTube Music channel, artist, album, or profile pages; Spotify and Apple Music page URLs. Some videos may disable embedding.

Music options:

| Setting | Meaning |
| --- | --- |
| `showPlayer: true` | Show the music section. **Required** even when `buttonOnly` is enabled. |
| `buttonOnly: true` | Direct audio: compact Play/Pause button. YouTube: show a Play button first, then reveal the embedded player when clicked. |
| `loop: true` | Request repeat playback. |
| `volume: 0.35` | Set initial volume for direct HTML audio (YouTube uses its own player volume). |
| `autoplay: true` | Setting exists, but current code does **not** silently start music with sound. Browsers commonly restrict autoplay. |

YouTube playback uses a visible embedded video player; this project does not provide an invisible YouTube audio-only player.

## Troubleshooting

**A profile says unavailable:** Check the GitHub username, public `USERNAME/link` repository, presence of `preference.js` on its default branch, and valid JSON syntax inside `const preference = { ... };`. GitHub API rate limits can also affect loading.

**An icon shows an arrow:** Check filename spelling, case, extension (including accidental `.jpg.jpg`), folder, and GitHub public accessibility. Look for a `404` image request in the browser's Developer Tools → Network panel.

**A space or Japanese character doesn't load:** Keep the original filename if desired; confirm that the actual uploaded filename and configured path are identical. The renderer performs URL encoding.

**Editor changes don't appear publicly:** Export `preference.js` or `config.json`, upload it to GitHub, and commit. The editor's saved browser draft isn't the live site.

**The music button is missing:** Set `showPlayer` to `true`, provide a valid `music.path`, and optionally set `buttonOnly` to `true`.

**Music won't autoplay or YouTube won't play:** Browser autoplay policies and YouTube embedding restrictions may prevent playback. Press Play; if a video refuses to embed, use an alternative embeddable URL.

**A direct `file://` preview fails:** Run a local HTTP server as shown above.

## Technology

HTML, CSS, and vanilla JavaScript; hosted on GitHub Pages using the included GitHub Actions workflow. No backend and no secret GitHub token needed for public profile lookup.

## License

See [`LICENSE`](LICENSE) for the project's license terms.

## Hide or show the footer

In `editor.html`, open **08 · Footer** and toggle **Show footer**. This is reflected in the live preview and in exported `config.json` and `preference.js`. Alternatively, set `"showFooter": false` at the top level of your profile preferences to hide the “Made with ♥ · GitHub · Customize · Default page” footer. The default is visible when the option is missing.


### Footer visibility

Set `"showFooter": false` in `config.json` to hide the footer on `/link/`. The default homepage honors this setting even when a remote GitHub profile is displayed. For a direct `?user=xxx` profile, set `"showFooter": false` in that user's `preference.js`. The bundled `preference.js` also has the footer disabled by default.

### Profile photo frame

In **editor.html → 01 · Your profile**, turn **Show profile photo frame** on or off. This is stored as `"avatarFrame": true` or `false` in `config.json` and the exported `preference.js`. When omitted, the frame remains enabled for backwards compatibility. Turning it off removes the avatar’s white ring and drop shadow without changing the image shape.


## Cache behavior

The page requests a fresh version of its CSS, JavaScript, profile configuration, and profile image assets on each navigation. The GitHub API and raw `preference.js` requests use `cache: no-store`. This does not control GitHub Pages/CDN response headers or guarantee that the HTML document itself cannot be cached by upstream services. For a strict `Cache-Control: no-store` response header, use hosting that allows custom HTTP headers.

## Drag and selection controls

In **link Studio → 09 · Drag & selection**, enable **Disable dragging and text selection**. Export and publish your updated `preference.js` (or `config.json` for the bundled page). The setting is:

```json
"interactionStyle": { "disableDragSelect": true }
```

This restricts text selection and drag gestures within the public profile across Android, iOS/iPadOS, macOS, and Windows browsers. Link tapping and page scrolling remain enabled. It does not prevent screenshots, copying via developer tools, or all OS-level gesture actions.
