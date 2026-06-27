# CampusConnect Development Rules

This file is the project guardrail for the "make it work, make it right, make it fast" workflow.

## Source Priority

1. `CODE23_CampusConnect_Bireysel_Gorev (1).html` is the assignment reference.
2. `docs/FIGMA_SCREEN_REQUIREMENTS.md` is the screen and state reference.
3. `docs/SECURITY_RULES_DRAFT.md`, `docs/CLOUD_FUNCTIONS_PLAN.md`, and `docs/COMPOSITE_INDEX_PLAN.md` are the Firebase contract reference.

## Development Phases

### Phase 0 - Foundation

- Keep the app JavaScript-first unless TypeScript is restored intentionally.
- Create the modular `src/` structure before feature coding.
- Keep screens thin: layout, user input, loading/error/empty states, and context calls only.
- Keep Firebase reads/writes in `src/services/`.
- Keep shared state in `src/context/` and state transitions in `src/reducers/`.

### Phase 1 - Make It Work

- Wire Firebase config, Auth, Firestore, Storage, FCM, Analytics, and basic Functions.
- Build Auth flow first: Login, Register, ForgotPassword, ProfileCompletion.
- Add the 5 required contexts: Auth, Event, Community, Market, Chat, plus Theme.
- Use `useReducer` for EventContext, CommunityContext, and MarketContext.
- Create empty navigation routes for all required screens before filling UI.
- Make Discover work with real Firestore data and `onSnapshot`.

### Phase 2 - Make It Right

- Match every screen to the Figma design and Firestore field contract.
- Add validation, permission-aware UI, loading, empty, error, and dark-mode states.
- Move repeated UI into module components.
- Keep Cloud Function-owned counters out of client writes.
- Verify each screen against the security rules and index plan.

### Phase 3 - Make It Fast

- Optimize FlatList screens with stable keys, memoized render items, pagination, and clipped subviews.
- Reduce redundant listeners and unsubscribe every `onSnapshot` listener.
- Add skeleton shimmer, detail hero fade-in, form step transitions, and tab badge pulse.
- Profile slow screens after behavior is correct.

## Architecture Rules

- `screens/`: screen composition only.
- `components/`: reusable UI pieces, grouped by module.
- `context/`: provider state and public actions.
- `reducers/`: pure state transitions.
- `services/`: Firebase API boundaries.
- `hooks/`: reusable UI/data hooks.
- `navigation/`: stack/tab route definitions.
- `constants/`: route names, collection names, theme tokens.
- `utils/`: pure helpers and formatters.

## Firebase Rules

- Firestore is the realtime database. Do not add Realtime Database unless the assignment changes.
- `users`, `events`, `communities`, `listings`, and `chats` are the core collections.
- `chats/{chatId}/messages` is the only message storage path.
- Use `relatedListingId` to connect market chats to listings.
- Client code must not directly update counter fields such as `attendeeCount`, `memberCount`, `likeCount`, `viewCount`, `savedCount`, `followersCount`, or `followingCount`.
- Firebase config files must not be committed.

## Commit Rules

- Prefer small commits by phase or feature.
- Commit messages should explain the feature and Firebase impact.
- Avoid vague messages like "firebase added" or "fix".
