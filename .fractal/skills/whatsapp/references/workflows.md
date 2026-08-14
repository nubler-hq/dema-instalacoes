# WhatsApp CLI Workflows

This reference captures the safest and most common `wacli` flows for an already configured account.

## 1. Check Authentication

Use this when the user asks whether WhatsApp is connected or the CLI looks stale.

```bash
wacli auth status
wacli doctor
```

If the store or session is out of sync, prefer inspection first and only re-authenticate if necessary.

## 2. Refresh Local Data

Use this after auth or when the local store needs a fresh snapshot.

```bash
wacli sync --once
```

Common add-ons:

- `--download-media` to backfill media in the background
- `--refresh-contacts` to update contact metadata
- `--refresh-groups` to refresh joined groups
- `--refresh-channels` to refresh subscribed channels

## 3. Read Messages

Use search before opening a specific message.

```bash
wacli messages search "keyword" --limit 20
wacli messages show --id <message-id>
wacli messages context --id <message-id>
```

If you need structure for automation, add `--json`.

## 4. Send A Text Message

Use the explicit recipient and message fields.

```bash
wacli send text --to <jid-or-name> --message "Hello"
```

Helpful additions:

- `--reply-to <message-id>` to quote a previous message
- `--mention <jid>` to mention a participant
- `--no-preview` to suppress link previews
- `--ephemeral` and `--ephemeral-duration <duration>` for disappearing messages

## 5. Send Media

### File

```bash
wacli send file --to <jid-or-name> --file <path> --caption "Optional caption"
```

### Sticker

```bash
wacli send sticker --to <jid-or-name> --file <path-to-webp>
```

### Voice Note

```bash
wacli send voice --to <jid-or-name> --file <path-to-ogg-or-opus>
```

### Poll

```bash
wacli send poll --to <jid-or-name> --question "Question?" --option "A" --option "B"
```

### Reaction

```bash
wacli send react --to <jid-or-phone> --id <message-id> --reaction "👍"
```

### Status

```bash
wacli send status --message "Status text"
wacli send status --file <path> --message "Caption or text"
```

## 6. Manage Chats

Use chat commands when the task is about organization rather than message content.

```bash
wacli chats list
wacli chats show --jid <chat-jid>
wacli chats mark-read --jid <chat-jid>
wacli chats mute --jid <chat-jid>
wacli chats pin --jid <chat-jid>
```

## 7. Manage Groups

Use group commands when the task involves membership or participants.

```bash
wacli groups list
wacli groups info --jid <group-jid>
wacli groups participants add --jid <group-jid> --participant <jid>
wacli groups participants promote --jid <group-jid> --participant <jid>
```

## 8. Manage Channels

Use channel commands for channel subscriptions and discovery.

```bash
wacli channels list
wacli channels info --jid <channel-jid>
wacli channels join --invite <invite-link-or-code>
```

## 9. Contacts, Aliases, And Tags

Use this when the user wants local naming assistance or metadata cleanup.

```bash
wacli contacts search "name"
wacli contacts show --jid <jid>
wacli contacts alias set --jid <jid> --alias "Short Name"
wacli contacts tags
```

## 10. History And Backfill

Use history when you need older messages that are not yet in the local store.

```bash
wacli history coverage
wacli history backfill --chat <chat-jid>
```

## 11. Media Download

Use this when a message has attachments that need to be stored locally.

```bash
wacli media download --id <message-id> --chat <chat-jid>
```

## 12. Diagnostics

Use these before escalating a failure.

```bash
wacli doctor --connect
wacli store stats
wacli store cleanup
```

## 13. Safe Execution Order

1. Verify auth or sync state if the task depends on the local store.
2. Search or show before modifying or sending.
3. Use explicit IDs, JIDs, or unique chat names for write actions.
4. Verify the result with a read command.
5. Only fall back to re-authentication if `doctor` or `auth status` indicates a broken session.
