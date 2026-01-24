# Dark Mode Changes Applied to Landing Pages

## Files Updated:
1. ✅ CoreAILanding.jsx
2. ✅ StoxAILanding.jsx
3. ✅ MargenAILanding.jsx
4. ⏳ StoxRetailLanding.jsx (in progress)
5. ⏳ OrdlyAILanding.jsx (in progress)
6. ⏳ O2CAILanding.jsx (in progress)
7. ⏳ RouteAILanding.jsx (in progress)
8. ⏳ ReveqAILanding.jsx (in progress)
9. ⏳ TraxxAILanding.jsx (in progress)
10. ⏳ DocumentIntelligenceLanding.jsx (in progress)

## Changes Applied Pattern:
- Added getColors() function
- Added darkMode prop to component
- Updated Box bgcolor to use colors.background
- Updated Paper bgcolor to use colors.paper
- Updated Card bgcolor to use colors.cardBg
- Updated Card border to use colors.border
- Updated Card boxShadow to be darkMode-aware
- Updated Avatar bgcolor to use alpha(color, darkMode ? 0.2 : 0.1)
- Updated Typography to use colors.text and colors.textSecondary
- Updated Chip bgcolor to use darkMode-aware alpha values
- Updated footer borders to use darkMode-aware alpha values
