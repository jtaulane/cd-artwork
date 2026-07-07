# Display Page Visual Updates - Tracklist Implementation

## Summary of Changes

The display page has been redesigned from a single-column layout to a two-column layout optimized for the 1024x600 7-inch IPS display. Album artwork and metadata now occupy the left side, while a scrollable tracklist occupies the right side.

## Layout Changes

### Before: Single Column
```
┌────────────────────────────────────────┐
│                                        │
│         Album Artwork (500px)          │
│                                        │
│         Album Title                    │
│         Artist Name                    │
│                                        │
│    Year | Genre | Disc #               │
│                                        │
│      [Connected/Disconnected]          │
│                                        │
│      (Empty right side)                │
└────────────────────────────────────────┘
```

### After: Two Column
```
┌──────────────────┬──────────────────────┐
│                  │                      │
│  Artwork (400px) │  Tracklist (title)   │
│                  │  ──────────────────  │
│  Title           │  1. Track One   3:45 │
│  Artist          │  2. Track Two   4:12 │
│                  │  3. Track Three 3:30 │
│  Year|Genre|Disc │  4. Track Four  4:05 │
│                  │  5. Track Five  3:55 │
│  [Connected]     │  6. Track Six   4:20 │
│                  │  7. Track Seven 3:40 │
│                  │  ... scrolls ...     │
│                  │                      │
└──────────────────┴──────────────────────┘
```

## Responsive Breakpoints

### 1024x600 (7-inch Display) - Primary Target
- **Grid**: 2 columns with 2rem gap
- **Padding**: 2rem
- **Artwork**: max-height 400px, centered
- **Font Sizes**:
  - Album Title: 1.5rem
  - Artist: 1rem
  - Details: 0.75rem-0.9rem
  - Tracklist Title: 1.25rem
  - Track items: 0.9rem

### Tablet (max-width: 1024px)
- **Grid**: Stacks to single column (100% width)
- **Gap**: 1.5rem
- **Padding**: 1.5rem
- **Artwork**: max-height 300px
- **Font Sizes**: Slightly reduced

### Mobile (max-width: 640px)
- **Grid**: Single column, compact
- **Padding**: 1rem
- **Artwork**: max-height 250px
- **Font Sizes**: Further reduced
- **Track Items**: Tight spacing

## Styling Details

### Artwork Container
- Centered flex layout
- Max height to prevent overflow
- Box shadow for depth
- Border radius: 12px
- Maintains aspect ratio with `object-fit: contain`

### Album Info (Left Column)
- Centered text alignment
- Semi-ellipsis for long titles (max 2 lines)
- Horizontal layout for details (Year | Genre | Disc)
- Connection status indicator with color coding:
  - Red/pulsing: Disconnected
  - Green/pulsing: Connected

### Tracklist Section (Right Column)
- Dark background with transparency: `rgba(0, 0, 0, 0.3)`
- Rounded corners: 8px
- Padding: 1.5rem
- Title styling matches album info
- Scrollable container with max-height

### Track Items
- Grid layout: `3rem | 1fr | 3rem`
- Columns: Track# | Title | Duration
- Hover effect: `background-color: rgba(255, 255, 255, 0.1)`
- Subtle text colors:
  - Track number: `#aaa` (light gray)
  - Title: `white`
  - Duration: `#bbb` (lighter gray)

### Custom Scrollbar
- Width: 8px
- Track: `rgba(255, 255, 255, 0.05)`
- Thumb: `rgba(255, 255, 255, 0.2)`
- Thumb Hover: `rgba(255, 255, 255, 0.3)`
- Border radius: 4px

## Color Palette

```
Primary Background:   Gradient (#1e1e1e → #2d2d2d)
Text Primary:         #ffffff
Text Secondary:       #bbb
Text Tertiary:        #aaa
Tracklist BG:         rgba(0, 0, 0, 0.3)
Scrollbar Track:      rgba(255, 255, 255, 0.05)
Scrollbar Thumb:      rgba(255, 255, 255, 0.2)
Connection Good:      #28a745 (green)
Connection Bad:       #dc3545 (red)
```

## Grid System

### 1024x600 Layout
- Total columns: 2 equal columns (1fr 1fr)
- Gap between columns: 2rem
- Container padding: 2rem
- Available space per column: ~484px (after gap and padding)

### Column 1 (Left/Artwork)
- Width: ~484px
- Contains:
  - Artwork container (400px max)
  - Album title
  - Artist name
  - Album details
  - Connection status

### Column 2 (Right/Tracklist)
- Width: ~484px
- Contains:
  - Tracklist title
  - Scrollable track list (max-height fills remaining space)

## Special Features

### Duration Format
- Input: seconds (integer)
- Display: `MM:SS` format
- Example: 180 seconds → "3:00"
- Conversion: `Math.floor(seconds / 60) : (seconds % 60).padStart(2, '0')`

### Track List Scrolling
- Only visible when tracks exceed viewport height
- Scrolls smoothly within the fixed container
- Custom scrollbar maintains design aesthetic
- Doesn't affect page-level scrolling (page has `overflow: hidden`)

### Responsive Behavior on Mobile
- At tablet size: Tracklist moves below artwork
- Both elements centered and full-width
- Tracklist gets max-height to prevent excessive scrolling
- Font sizes scale down appropriately

## CSS Grid Template Areas (Future Enhancement)

```scss
grid-template-areas:
  "artwork tracklist"
  "info tracklist"
  "status tracklist";
```

This could be implemented for more semantic layout control if needed.

## Animation Effects

### Status Indicator Pulse
```scss
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
animation: pulse 2s infinite;
```

### Scrollbar Hover
- Smooth color transition (0.2s)
- From: `rgba(255, 255, 255, 0.2)`
- To: `rgba(255, 255, 255, 0.3)`

## Testing Checklist

- [x] Display page renders with two columns at 1024x600
- [x] Tracklist scrolls when content exceeds height
- [x] Custom scrollbar appears/hides appropriately
- [x] Artwork remains centered and properly sized
- [x] Duration formatting displays correctly (MM:SS)
- [x] Responsive breakpoints work at 1024px and 640px
- [x] No horizontal scrolling at any resolution
- [x] Connection status updates in real-time
- [x] Album changes update tracklist via SignalR
- [x] Font sizes are readable at all breakpoints

## Browser Compatibility

- Chrome/Edge 90+: Full support
- Firefox 88+: Full support
- Safari 14+: Full support
- IE11: Not supported (uses CSS Grid, modern flexbox)

## Performance Considerations

- CSS Grid layout is efficient for this use case
- Custom scrollbar is CSS-only (no JavaScript overhead)
- Track items use simple grid layout
- No animation performance issues (pulse uses transforms)
- Scrollbar is only rendered when needed

## Future Enhancement Ideas

1. **Horizontal Split**: Make columns resizable
2. **Track Details**: Click track to show full details
3. **Search**: Add track search/filter
4. **Keyboard Nav**: Use arrow keys to navigate tracks
5. **Now Playing**: Highlight current track during playback
6. **Mini Player**: Show current track in overlay
7. **Lyrics Display**: Show lyrics in scrollable area
8. **Album Art Effects**: Blur/fade effects on artwork
9. **Time Display**: Show album total duration
10. **Export**: Export tracklist as text/PDF
