# CampusConnect src structure

The `src/` folder is organized around the assignment modules: Auth, Events, Communities, Market, Chat, Profile, Settings, and Notifications.

```text
src/
  assets/       static images and icons
  components/   reusable UI by module
  constants/    routes, collection names, theme tokens
  context/      providers and public actions
  hooks/        shared React hooks
  navigation/   route composition
  reducers/     pure reducer logic
  screens/      screen layout and context wiring
  services/     Firebase reads, writes, listeners, uploads, analytics
  utils/        pure helpers
```

Screens should not call Firebase directly. They call context actions. Context actions call services. Reducers update state.
