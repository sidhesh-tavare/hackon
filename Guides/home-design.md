---
version: alpha
name: "Linear Design System"
description: "Primary visual anchor uses #ffffff with primary borders, dividers, and outline strokes. Typography baseline relies on Inter Variable for hero and page-level headings."
colors:
  border-default: "#ffffff"
  error-state: "#eb5757"
  background-primary: "#08090a"
  primary-action: "#5e6ad2"
  success-state: "#27a644"
  info-state: "#8fa6ff"
  text-primary: "#f7f8f8"
  text-quaternary: "#62666d"
  text-secondary: "#d0d6e0"
  text-tertiary: "#8a8f98"
  warning-state: "#ffdf9f"
  border-subtle: "#e2e4e7"
typography:
  heading-xl:
    fontFamily: "Inter Variable"
    fontSize: "40px"
    fontWeight: "510"
    lineHeight: "44px"
    letterSpacing: "-0.88px"
  heading-l:
    fontFamily: "Inter Variable"
    fontSize: "18px"
    fontWeight: "400"
    lineHeight: "28.8px"
    letterSpacing: "-0.165px"
  heading-m:
    fontFamily: "Inter Variable"
    fontSize: "15px"
    fontWeight: "510"
    lineHeight: "24px"
    letterSpacing: "-0.165px"
  body-regular:
    fontFamily: "Inter Variable"
    fontSize: "16px"
    fontWeight: "400"
    lineHeight: "24px"
  body-small:
    fontFamily: "Inter Variable"
    fontSize: "13px"
    fontWeight: "400"
    lineHeight: "19.5px"
    letterSpacing: "-0.13px"
  label-medium:
    fontFamily: "Inter Variable"
    fontSize: "13px"
    fontWeight: "510"
  label-small:
    fontFamily: "Inter Variable"
    fontSize: "12px"
    fontWeight: "510"
    lineHeight: "16.8px"
  label-tiny:
    fontFamily: "Inter Variable"
    fontSize: "10px"
    fontWeight: "510"
    lineHeight: "15px"
  code-regular:
    fontFamily: "Berkeley Mono"
    fontSize: "14px"
    fontWeight: "400"
    lineHeight: "24px"
  code-small:
    fontFamily: "Berkeley Mono"
    fontSize: "12px"
    fontWeight: "400"
    lineHeight: "16.8px"
rounded:
  radius-xs: "2px"
  radius-sm: "4px"
  radius-md: "6px"
  radius-lg: "8px"
  radius-xl: "12px"
  radius-full: "9999px"
spacing:
  spacing-xs: "2px"
  spacing-2xs: "3px"
  spacing-xs: "4px"
  spacing-sm: "6px"
  spacing-sm: "8px"
  spacing-md: "12px"
  spacing-lg: "16px"
  spacing-xl: "24px"
  spacing-2xl: "32px"
  spacing-3xl: "48px"
  spacing-4xl: "96px"
---

## Overview

Primary visual anchor uses #ffffff with primary borders, dividers, and outline strokes. Typography baseline relies on Inter Variable for hero and page-level headings.

This system uses a 4px base grid with scale values 2, 3, 4, 6, 8, 12, 16, 24, 32, 48, 96.

**Signature traits:**
- Core token rhythm: Token evidence indicates consistent color, spacing, and radius rhythm across visible UI.

## Colors

The palette uses 24 validated color tokens across 2 theme profiles. Semantic roles stay attached to observed usage so generation agents can choose accents without inventing new color meaning.

**Semantic naming:**
- **content-text** maps to `text-primary`: Role "text" is grounded by usage context "Primary body text, headings, and foreground content in dark theme".
- **surface-background** maps to `background-primary`: Role "background" is grounded by usage context "Main page background and primary surface in dark theme".
- **border-primary** maps to `border-default`: Role "primary" is grounded by usage context "Primary borders, dividers, and outline strokes".
- **border-border** maps to `border-subtle`: Role "border" is grounded by usage context "Subtle dividers and secondary border treatments".

### Dark Theme

### Primary Brand
- **Border Default** (#ffffff): Primary borders, dividers, and outline strokes. Role: primary. {authored: rgb(255, 255, 255), space: rgb, alpha: 0.01}
- **Error State** (#eb5757): Error messages, destructive actions, and failure indicators. Role: accent. {authored: rgb(235, 87, 87), space: rgb}

### Text Scale
- **Info State** (#8fa6ff): Informational messages and neutral status indicators. Role: text. {authored: rgb(143, 166, 255), space: rgb}
- **Text Primary** (#f7f8f8): Primary body text, headings, and foreground content in dark theme. Role: text. {authored: rgb(247, 248, 248), space: rgb, alpha: 0.05}
- **Text Quaternary** (#62666d): Quaternary text, disabled states, and minimal-contrast content. Role: text. {authored: rgb(98, 102, 109), space: rgb}
- **Text Secondary** (#d0d6e0): Secondary text, labels, and reduced-emphasis content. Role: text. {authored: rgb(208, 214, 224), space: rgb}
- **Text Tertiary** (#8a8f98): Tertiary text, hints, and low-emphasis labels. Role: text. {authored: rgb(138, 143, 152), space: rgb}
- **Warning State** (#ffdf9f): Warning messages and caution indicators. Role: text. {authored: rgb(255, 223, 159), space: rgb}

### Interactive
- **Border Subtle** (#e2e4e7): Subtle dividers and secondary border treatments. Role: border. {authored: rgb(226, 228, 231), space: rgb}

### Surface & Shadows
- **Background Primary** (#08090a): Main page background and primary surface in dark theme. Role: background. {authored: rgb(8, 9, 10), space: rgb}
- **Primary Action** (#5e6ad2): Primary buttons, key interactive elements, and brand-forward CTAs. Role: background. {authored: rgb(94, 106, 210), space: rgb, alpha: 0.15}
- **Success State** (#27a644): Success indicators, positive status badges, and confirmation states. Role: background. {authored: rgb(39, 166, 68), space: rgb, alpha: 0.07}

### Light Theme

### Primary Brand
- **Border Default** (#ffffff): Primary borders and dividers. Role: primary. {authored: rgb(255, 255, 255), space: rgb, alpha: 0.01}
- **Error State** (#eb5757): Error messages and destructive actions. Role: accent. {authored: rgb(235, 87, 87), space: rgb}

### Text Scale
- **Info State** (#8fa6ff): Informational messages. Role: text. {authored: rgb(143, 166, 255), space: rgb}
- **Text Primary** (#f7f8f8): Primary body text and headings in light theme. Role: text. {authored: rgb(247, 248, 248), space: rgb, alpha: 0.05}
- **Text Quaternary** (#62666d): Quaternary text and disabled states. Role: text. {authored: rgb(98, 102, 109), space: rgb}
- **Text Secondary** (#d0d6e0): Secondary text and labels. Role: text. {authored: rgb(208, 214, 224), space: rgb}
- **Text Tertiary** (#8a8f98): Tertiary text and hints. Role: text. {authored: rgb(138, 143, 152), space: rgb}
- **Warning State** (#ffdf9f): Warning messages and caution indicators. Role: text. {authored: rgb(255, 223, 159), space: rgb}

### Interactive
- **Border Subtle** (#e2e4e7): Subtle dividers and secondary borders. Role: border. {authored: rgb(226, 228, 231), space: rgb}

### Surface & Shadows
- **Background Primary** (#08090a): Main page background in light theme. Role: background. {authored: rgb(8, 9, 10), space: rgb}
- **Primary Action** (#5e6ad2): Primary buttons and key CTAs. Role: background. {authored: rgb(94, 106, 210), space: rgb, alpha: 0.15}
- **Success State** (#27a644): Success indicators and positive states. Role: background. {authored: rgb(39, 166, 68), space: rgb, alpha: 0.07}

## Typography

Typography uses Inter Variable, Berkeley Mono across extracted hierarchy roles. Keep hierarchy mapped to these token rows before adding decorative type styles.

Mixes Inter Variable and Berkeley Mono for visual contrast. Weight range spans semi-bold, regular. Sizes range from 10px to 40px.

### Type Scale Evidence
| Role | Font | Size | Weight | Line Height | Letter Spacing | Stack / Features | Notes |
|------|------|------|--------|-------------|----------------|------------------|-------|
| Hero and page-level headings | Inter Variable | 40px | 510 | 44px | -0.88px | Inter Variable, SF Pro Display, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Open Sans, Helvetica Neue, sans-serif; features: "cv01", "ss03" | Extracted token |
| Section headings and major content divisions | Inter Variable | 18px | 400 | 28.8px | -0.165px | Inter Variable, SF Pro Display, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Open Sans, Helvetica Neue, sans-serif; features: "cv01", "ss03" | Extracted token |
| Subsection headings and card titles | Inter Variable | 15px | 510 | 24px | -0.165px | Inter Variable, SF Pro Display, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Open Sans, Helvetica Neue, sans-serif; features: "cv01", "ss03" | Extracted token |
| Primary body text and paragraph content | Inter Variable | 16px | 400 | 24px | normal | Inter Variable, SF Pro Display, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Open Sans, Helvetica Neue, sans-serif; features: "cv01", "ss03" | Extracted token |
| Secondary body text, descriptions, and metadata | Inter Variable | 13px | 400 | 19.5px | -0.13px | Inter Variable, SF Pro Display, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Open Sans, Helvetica Neue, sans-serif; features: "cv01", "ss03" | Extracted token |
| Button labels, form labels, and UI labels | Inter Variable | 13px | 510 | normal | normal | Inter Variable, SF Pro Display, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Open Sans, Helvetica Neue, sans-serif; features: "cv01", "ss03" | Extracted token |
| Small labels, badges, and tag text | Inter Variable | 12px | 510 | 16.8px | normal | Inter Variable, SF Pro Display, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Open Sans, Helvetica Neue, sans-serif; features: "cv01", "ss03" | Extracted token |
| Micro labels and minimal-text UI elements | Inter Variable | 10px | 510 | 15px | normal | Inter Variable, SF Pro Display, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Open Sans, Helvetica Neue, sans-serif; features: "cv01", "ss03" | Extracted token |
| Code blocks and monospace content | Berkeley Mono | 14px | 400 | 24px | normal | Berkeley Mono, ui-monospace, SF Mono, Menlo, monospace | Extracted token |
| Inline code and small code snippets | Berkeley Mono | 12px | 400 | 16.8px | normal | Berkeley Mono, ui-monospace, SF Mono, Menlo, monospace | Extracted token |

## Layout

Responsive system uses 2 breakpoint tier(s): mobile, desktop.

### Responsive Strategy
- **mobile (<= 1280px)**: Constrain layout for small viewports and prioritize vertical stacking.
- **desktop (Unknown)**: Expand layout density and horizontal composition for wide viewports.

### Spacing System
| Token | Value | Px | Notes |
|------|-------|----|-------|
| Spacing XS | 2px | 2 | Extracted spacing token |
| Spacing 2XS | 3px | 3 | Extracted spacing token |
| Spacing XS+ | 4px | 4 | Extracted spacing token |
| Spacing SM | 6px | 6 | Extracted spacing token |
| Spacing SM+ | 8px | 8 | Extracted spacing token |
| Spacing MD | 12px | 12 | Extracted spacing token |
| Spacing LG | 16px | 16 | Extracted spacing token |
| Spacing XL | 24px | 24 | Extracted spacing token |
| Spacing 2XL | 32px | 32 | Extracted spacing token |
| Spacing 3XL | 48px | 48 | Extracted spacing token |
| Spacing 4XL | 96px | 96 | Extracted spacing token |

## Elevation & Depth

Keep depth flat unless validated shadow or interaction evidence appears in the extraction payload. Do not invent shadows beyond this evidence boundary.

### Shadow Evidence
| Shadow Token | Layers | Details |
|--------------|--------|---------|
| n/a | 0 | No validated shadow payload |

### Interaction Signals
| Theme | Signal | Evidence |
|-------|--------|----------|
| Light | backdrop-filter | blur(20px) |
| Light | outline-color | rgba(0, 0, 0, 0) ; rgb(247, 248, 248) ; rgb(208, 214, 224) |
| Light | outline-width | 3px |
| Light | outline-offset | 0px |
| Light | transform | matrix(1, 0, 0, 1, 0, 0) ; matrix(0, 0, 0, 0, 0, 0) ; matrix(1, 0, 0, 1, -200, -200) |
| Dark | backdrop-filter | blur(20px) |
| Dark | outline-color | rgba(0, 0, 0, 0) ; rgb(247, 248, 248) ; rgb(208, 214, 224) |
| Dark | outline-width | 3px |
| Dark | outline-offset | 0px |
| Dark | transform | matrix(1, 0, 0, 1, 0, 0) ; matrix(0, 0, 0, 0, 0, 0) ; matrix(1, 0, 0, 1, -200, -200) |

## Shapes

Shape language maps directly to rounded tokens. Keep component corners consistent with the role mapping below before introducing bespoke geometry.

### Radius Roles
| Token | Value | Px | Role Mapping |
|------|-------|----|--------------|
| Radius XS | 2px | 2 | Hairline corner |
| Radius SM | 4px | 4 | Subtle corner |
| Radius MD | 6px | 6 | Subtle corner |
| Radius LG | 8px | 8 | Control corner |
| Radius XL | 12px | 12 | Control corner |
| Radius Full | 9999px | 9999 | Large surface corner |

### Geometry Evidence
| Radius Token | Shape | Units |
|--------------|-------|-------|
| Radius XS | 2px | px |
| Radius SM | 4px | px |
| Radius MD | 6px | px |
| Radius LG | 8px | px |
| Radius XL | 12px | px |
| Radius Full | 9999px | px |

## Components

(none detected)

## Do's and Don'ts

Guardrails protect Core token rhythm without adding unsupported visual claims.

| Do | Don't |
|----|---------|
| Do maintain consistent spacing using the base grid | Don't make unsupported claims about absent visual features |
| Do maintain WCAG AA contrast ratios (4.5:1 for normal text) | Don't mix rounded and sharp corners in the same view |
| Do use the primary color only for the single most important action per screen |  |
| Do verify evidence before writing new design-system guidance |  |

## Responsive Evidence

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile | <= 600px | (max-width: 600px) |
| Mobile | <= 640px | (max-width: 640px) |
| Breakpoint 3 | <= 768px | (max-width: 768px) |
| Breakpoint 4 | <= 1024px | (max-width: 1024px) |
| Breakpoint 5 | <= 1280px | (max-width: 1280px) |
| Breakpoint 6 | Unknown | (hover: none) and (pointer: coarse) |

## Agent Prompt Guide

### Example Component Prompts
- Create button component using validated primary color role and spacing tokens.
- Create card component with mapped radius role and evidence-backed elevation.
- Create form input component using inferred typography hierarchy and border roles.

### Iteration Guide
1. Start with extracted palette and typography roles only.
2. Map spacing and radius directly from token tables before visual polish.
3. Apply component patterns one section at a time and compare against source intent.
4. Keep elevation claims tied to explicit evidence in output.
5. Iterate with smallest diffs and re-check section hierarchy after each change.
