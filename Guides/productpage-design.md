---
version: alpha
name: "Amazon Interstitial / Gate Page"
description: "Typography baseline relies on Arial for primary body text, row content, info message text — most frequent tuple (18 hits)."
colors:
  amazon-amber-button: "#f0c14b"
  light-grey-panel: "#f6f6f6"
  link-blue: "#0066c0"
  white-surface: "#ffffff"
  body-text: "#333333"
  button-text-dark: "#111111"
  secondary-text: "#4d4d4d"
  amber-button-border: "#cba957"
  card-border-blue-grey: "#bbd3de"
  divider-grey: "#dddddd"
typography:
  body-default:
    fontFamily: "Arial"
    fontSize: "13px"
    fontWeight: "400"
    lineHeight: "19px"
  small-label-footer:
    fontFamily: "Arial"
    fontSize: "11px"
    fontWeight: "400"
    lineHeight: "16.115px"
  section-heading:
    fontFamily: "Arial"
    fontSize: "17px"
    fontWeight: "400"
    lineHeight: "21.335px"
  body-relaxed:
    fontFamily: "Arial"
    fontSize: "13px"
    fontWeight: "400"
    lineHeight: "29px"
rounded:
  card: "4px"
  inner-panel: "3px"
spacing:
  xs: "10px"
  sm: "11px"
  md: "14px"
  md-lg: "18px"
  lg: "20px"
  xl: "26px"
  2xl: "44px"
  icon-offset: "60px"
  content-width: "465px"
components:
  button-primary:
    backgroundColor: "{colors.amazon-amber-button}"
    borderColor: "{colors.amber-button-border}"
    borderWidth: "1px"
    rounded: "{rounded.card}"
    textColor: "{colors.button-text-dark}"
    fontSize: "13px"
    padding: "0px 10px 0px 11px"
    boxShadow: "rgba(255, 255, 255, 0.4) 0px 1px 0px 0px inset"
    fontFamily: "Arial"
  card-info-box:
    backgroundColor: "{colors.white-surface}"
    borderColor: "{colors.card-border-blue-grey}"
    borderWidth: "1px"
    rounded: "{rounded.card}"
    boxShadow: "none"
    fontSize: "13px"
    textColor: "{colors.body-text}"
  card-inner-panel:
    backgroundColor: "{colors.light-grey-panel}"
    rounded: "{rounded.card}"
    padding: "14px 18px 14px 60px"
    textColor: "{colors.body-text}"
    fontSize: "13px"
  heading-h4:
    textColor: "{colors.secondary-text}"
    fontSize: "17px"
    fontWeight: "400"
    lineHeight: "21.335px"
    fontFamily: "Arial"
    padding: "0px"
    rounded: "0px"
  layout:
    padding: "44px 0px"
    maxWidth: "{spacing.content-width}"
    textColor: "{colors.body-text}"
    backgroundColor: "transparent"
  link:
    textColor: "{colors.link-blue}"
    fontSize: "11px"
    fontWeight: "400"
    lineHeight: "16.115px"
    fontFamily: "Arial"
    backgroundColor: "transparent"
---

## Overview

Typography baseline relies on Arial for primary body text, row content, info message text — most frequent tuple (18 hits).

This system uses a 14px base grid with scale values 10, 11, 14, 18, 20, 26, 44, 60.

**Signature traits:**
- Core token rhythm: Token evidence indicates consistent color, spacing, and radius rhythm across visible UI.

## Colors

The palette uses 10 validated color tokens across 1 theme profile. Semantic roles stay attached to observed usage so generation agents can choose accents without inventing new color meaning.

**Semantic naming:**
- **content-text** maps to `body-text`: Role "text" is grounded by usage context "Primary body text, row text, general content labels — highest frequency color (47 hits)".
- **surface-background** maps to `white-surface`: Role "background" is grounded by usage context "Card and page background surface".
- **action-background** maps to `amazon-amber-button`: Role "background" is grounded by usage context "Primary CTA button background — Amazon's signature golden yellow".
- **action-border** maps to `amber-button-border`: Role "border" is grounded by usage context "Border of the primary CTA button".

### Text Scale
- **Body Text** (#333333): Primary body text, row text, general content labels — highest frequency color (47 hits). Role: text. {authored: rgb(51, 51, 51), space: rgb}
- **Button Text Dark** (#111111): Text inside the primary CTA button. Role: text. {authored: rgb(17, 17, 17), space: rgb}
- **Secondary Text** (#4d4d4d): Heading text (h4), secondary labels. Role: text. {authored: rgb(77, 77, 77), space: rgb}

### Interactive
- **Amber Button Border** (#cba957): Border of the primary CTA button. Role: border. {authored: rgb(203, 169, 87) rgb(191, 148, 42) rgb(170, 131, 38), space: rgb}
- **Card Border Blue-Grey** (#bbd3de): Border of the a-box card container. Role: border. {authored: rgb(187, 211, 222), space: rgb}
- **Divider Grey** (#dddddd): Horizontal rule / section divider. Role: border. {authored: rgb(221, 221, 221), space: rgb}

### Surface & Shadows
- **Amazon Amber Button** (#f0c14b): Primary CTA button background — Amazon's signature golden yellow. Role: background. {authored: rgb(240, 193, 75), space: rgb}
- **Light Grey Panel** (#f6f6f6): Inner panel / info box background (a-box-inner). Role: background. {authored: rgb(246, 246, 246), space: rgb}
- **Link Blue** (#0066c0): Footer hyperlinks (Conditions of Use & Sale, Privacy Notice). Role: background. {authored: rgb(0, 102, 192), space: rgb}
- **White Surface** (#ffffff): Card and page background surface. Role: background. {authored: rgb(255, 255, 255), space: rgb}

## Typography

Typography uses Arial across extracted hierarchy roles. Keep hierarchy mapped to these token rows before adding decorative type styles.

Uses Arial throughout for a uniform feel. Sizes range from 11px to 17px.

### Font Roles
- **Headline Font**: Arial
- **Body Font**: Arial

### Type Scale Evidence
| Role | Font | Size | Weight | Line Height | Letter Spacing | Stack / Features | Notes |
|------|------|------|--------|-------------|----------------|------------------|-------|
| Primary body text, row content, info message text — most frequent tuple (18 hits) | Arial | 13px | 400 | 19px | normal | Arial, sans-serif | Extracted token |
| Footer links, small labels, secondary metadata (9 hits) | Arial | 11px | 400 | 16.115px | normal | Arial, sans-serif | Extracted token |
| h4 heading — section or card title | Arial | 17px | 400 | 21.335px | normal | Arial, sans-serif | Extracted token |
| Body text with relaxed line height for readability in message areas | Arial | 13px | 400 | 29px | normal | Arial, sans-serif | Extracted token |

## Layout

Layout rhythm is inferred from spacing tokens and responsive breakpoint evidence.

### Spacing System
| Token | Value | Px | Notes |
|------|-------|----|-------|
| xs | 10px | 10 | Extracted spacing token |
| sm | 11px | 11 | Extracted spacing token |
| md | 14px | 14 | Extracted spacing token |
| md-lg | 18px | 18 | Extracted spacing token |
| lg | 20px | 20 | Extracted spacing token |
| xl | 26px | 26 | Extracted spacing token |
| 2xl | 44px | 44 | Extracted spacing token |
| icon-offset | 60px | 60 | Extracted spacing token |
| content-width | 465px | 465 | Extracted spacing token |

## Elevation & Depth

Keep depth flat unless validated shadow or interaction evidence appears in the extraction payload. Do not invent shadows beyond this evidence boundary.

### Shadow Evidence
| Shadow Token | Layers | Details |
|--------------|--------|---------|
| Button Inset Highlight | 1 | inset 0px 1px 0px 0px rgba(255, 255, 255, 0.4) |

### Interaction Signals
| Theme | Signal | Evidence |
|-------|--------|----------|
| Light | outline-color | rgb(51, 51, 51) ; rgb(0, 102, 192) ; rgb(17, 17, 17) |
| Light | outline-width | 3px ; 0px |
| Light | outline-offset | 0px |

## Shapes

Shape language maps directly to rounded tokens. Keep component corners consistent with the role mapping below before introducing bespoke geometry.

### Radius Roles
| Token | Value | Px | Role Mapping |
|------|-------|----|--------------|
| inner-panel | 3px | 3 | Subtle corner |
| card | 4px | 4 | Subtle corner |

### Geometry Evidence
| Radius Token | Shape | Units |
|--------------|-------|-------|
| card | 4px | px |
| inner-panel | 3px | px |

## Components

Components should be recreated from token references first, then tuned with variant notes and probe-backed state guidance.
- **Primary CTA Button**: Amazon's signature amber/golden CTA button with dark text, subtle inset highlight shadow, and rounded corners. Used for the primary 'Continue shopping' action.
- **Info Card**: White card container with a light blue-grey border (#bbd3de) and 4px border radius. Contains an inner grey panel for the info message with an info icon.
- **Section Heading**: h4 heading used for section or card titles, rendered in Arial 17px at #4d4d4d.
- **Footer Link**: Small blue hyperlinks used in the footer for legal/policy navigation.
- **Page Container**: Centered content container with generous vertical padding, constraining content to ~465px width.

### Button

**Primary**
- backgroundColor: #f0c14b
- borderColor: #cba957
- borderWidth: 1px
- rounded: 4px
- textColor: #111111
- fontSize: 13px
- padding: 0px 10px 0px 11px
- boxShadow: rgba(255, 255, 255, 0.4) 0px 1px 0px 0px inset
- fontFamily: Arial
- State guidance: Probe-backed: button.a-button-text with color #111111. Outer wrapper carries the amber background and border.

### Card

**Info Box**
- backgroundColor: #ffffff
- borderColor: #bbd3de
- borderWidth: 1px
- rounded: 4px
- boxShadow: none
- fontSize: 13px
- textColor: #333333
- State guidance: Probe-backed: div.a-box with borderColor rgb(187,211,222) and borderRadius 4px.

**Inner Panel**
- backgroundColor: #f6f6f6
- rounded: 4px
- padding: 14px 18px 14px 60px
- textColor: #333333
- fontSize: 13px
- State guidance: Probe-backed: div.a-box-inner with padding 14px 18px 14px 60px — left padding accommodates info icon.

### Heading

**h4**
- textColor: #4d4d4d
- fontSize: 17px
- fontWeight: 400
- lineHeight: 21.335px
- fontFamily: Arial
- padding: 0px
- rounded: 0px
- State guidance: Probe-backed: h4 with color rgb(77,77,77).

### Layout

**Default**
- padding: 44px 0px
- maxWidth: 465px
- textColor: #333333
- backgroundColor: transparent
- State guidance: Probe-backed: div.a-container with padding 44px 0px.

### Link

**Default**
- textColor: #0066c0
- fontSize: 11px
- fontWeight: 400
- lineHeight: 16.115px
- fontFamily: Arial
- backgroundColor: transparent
- State guidance: Probe-backed: anchor element with color rgb(0,102,192) at 11px.

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

No distinct responsive breakpoints were extracted.

## Agent Prompt Guide

### Example Component Prompts
- Create Footer Link variant that preserves Small blue hyperlinks used in the footer for legal/policy navigation..
- Create Info Card variant that preserves White card container with a light blue-grey border (#bbd3de) and 4px border radius. Contains an inner grey panel for the info message with an info icon..
- Create Page Container variant that preserves Centered content container with generous vertical padding, constraining content to ~465px width..

### Iteration Guide
1. Start with extracted palette and typography roles only.
2. Map spacing and radius directly from token tables before visual polish.
3. Apply component patterns one section at a time and compare against source intent.
4. Keep elevation claims tied to explicit evidence in output.
5. Iterate with smallest diffs and re-check section hierarchy after each change.
