# Factora Multimodal — Design System & UI/UX Specification

## 🎨 1. Design Philosophy: Warm Luxury Editorial Intelligence
Factora Multimodal merges **journalistic prestige** with **cutting-edge AI forensic tooling**. Unlike sterile, cold AI interfaces or generic blue dashboards, Factora uses a warm, editorial luxury aesthetic inspired by timeless print publications and modern investigative bureaus.

---

## 🏛️ 2. Color Palette & Token System

### Core Neutral & Editorial Palette
| Token | Hex Value | Role & Usage |
| :--- | :--- | :--- |
| `--color-ivory` | `#F4EFE4` | Primary page canvas / warm ambient background |
| `--color-ivory-light` | `#FAF7F0` | Card elevation, elevated surfaces |
| `--color-beige-light` | `#DFD9CA` | Subtle panel borders, dividers, inactive states |
| `--color-beige` | `#C9C2AD` | Secondary card outlines, tab containers |
| `--color-charcoal-dark`| `#3A3835` | Primary headlines, emphatic titles, modal headers |
| `--color-charcoal` | `#4A4845` | High-contrast body text, button text, labels |
| `--color-gray` | `#706B66` | Secondary body text, timestamps, captions, metadata |

### Primary Brand Accents
| Token | Hex Value | Role & Usage |
| :--- | :--- | :--- |
| `--color-terracotta` | `#B67C62` | Primary brand accent, CTA buttons, active tabs |
| `--color-terracotta-dark` | `#9A6752` | Hover state for buttons, active navigation markers |
| `--color-terracotta-light`| `#C89580` | Subtle tag backgrounds, badge accents |
| `--color-terracotta-soft` | `rgba(182, 124, 98, 0.12)` | Focus rings, card highlights, glow effects |

### Veracity & Credibility Status Indicators
| Status | Hex Value | Background / Glow | Usage |
| :--- | :--- | :--- | :--- |
| **Credible / Real** | `#7FA686` (Sage Green) | `rgba(127, 166, 134, 0.15)` | Veracity score > 75%, verified sources |
| **Suspicious / Mixed** | `#D4A574` (Warm Ochre) | `rgba(212, 165, 116, 0.15)` | Veracity score 45–74%, conflicting evidence |
| **Manipulated / Fake** | `#C66B6B` (Crimson Rose)| `rgba(198, 107, 107, 0.15)` | Veracity score < 45%, manipulated imagery |

---

## ✍️ 3. Typography Hierarchy (Triple-Stack System)

```html
<!-- Google Fonts Imports -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Playfair+Display:ital,wght@0,500;0,600;0,700;0,900;1,400&display=swap" rel="stylesheet">
```

1. **Display & Headlines (`font-serif`) — Playfair Display**:
   - Conveys institutional trust, investigative journalism, and elegance.
   - H1: `Playfair Display, 700 / 900`, tracking `-0.02em`.
   - H2 / Section Headers: `Playfair Display, 600`, tracking `-0.01em`.
2. **Interface & Narrative Body (`font-sans`) — Inter**:
   - Ultra-clean readability for dense claim reading, forms, and navigation.
   - Body: `Inter, 400 / 500`, line-height `1.65`.
   - Labels / Buttons: `Inter, 600`, letter-spacing `0.02em`.
3. **Forensic Telemetry & Code (`font-mono`) — JetBrains Mono**:
   - Precision monospaced type for confidence scores, EXIF metadata, timestamps, and model hashes.
   - Tags / Hash / Scores: `JetBrains Mono, 500`, uppercase, letter-spacing `0.05em`.

---

## 🧩 4. Component Design System

### A. Unified Multimodal Submission Hub
- **Tab Selector**: Segmented pill control (`All Modalities`, `Text Claim`, `Image Forensic`, `News URL`).
- **Dropzone Area**: Dashed border with terracotta hover transition, drag-and-drop file support (`.png`, `.jpg`, `.jpeg`, `.webp`), live client-side image preview with dimension & size pills.
- **Claim Textarea**: Expandable input with live word counter, reading duration, and linguistic indicator.
- **One-Click Analyze Button**: Terracotta pill button with smooth hover elevation (`translateY(-2px)`), warm drop-shadow (`box-shadow: 0 10px 25px -5px rgba(182, 124, 98, 0.3)`), and spinner on submission.

### B. Credibility Radar & Verdict Card
- **Verdict Ring**: Circular SVG progress gauge showing 0–100% composite veracity score.
- **Pillar Score Cards**:
  1. *Semantic Model (DeBERTa-v3)*: Deep NLP claim truth probability.
  2. *Vision Forensics (ELA & EXIF)*: Image compression integrity & tampering markers.
  3. *Linguistic Stance*: Clickbait index, emotional polarity, sensationalism flags.
  4. *Publisher Trust*: Domain reputation tier, Wikipedia verification status.
- **Interactive Evidence Inspector**: Expandable drawer with highlighted sentences (color-coded by suspect weight) and visual difference heatmaps.

### C. Glassmorphism & Elevation System
- **Surface Elevation 1**: `background: rgba(250, 247, 240, 0.85); backdrop-filter: blur(12px); border: 1px solid var(--color-beige-light);`
- **Surface Elevation 2**: `background: #FAF7F0; box-shadow: 0 12px 32px -4px rgba(74, 72, 69, 0.08);`
- **Border Radius Standards**:
  - Cards & Panels: `16px` / `20px`
  - Buttons & Badges: `9999px` (Full Pill)
  - Inputs & Dropzones: `12px`

---

## ⚡ 5. Micro-Animations & Interactivity
- **State Transitions**: `transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);`
- **Scan Animation**: Linear scanning beam gradient sweeping across image dropzones during analysis.
- **Hover Micro-lift**: Subtle translateY(-2px) for cards and buttons.
- **Motion Accessibility**: Full support for `@media (prefers-reduced-motion: reduce)`.
