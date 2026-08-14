---
name: whatsapp
description: "WhatsApp CLI operations with wacli: auth/bootstrap, sync, search, read, send text/files/polls/reactions/status, manage chats/groups/channels/contacts, download media, handle presence/profile/history/store/doctor. Trigger when the user asks to use WhatsApp through the CLI, manage messages, chats, groups, channels, contacts, polls, sync, or any wacli command. Assume the account is already configured and the default account/store should be used unless the user asks to re-authenticate or switch accounts."
---

# WhatsApp CLI

Use this skill to operate WhatsApp through `wacli` with a workflow-first mindset: inspect, choose the correct command group, validate the exact syntax with `--help`, execute, and verify the result.

## Mission

1. Treat `wacli` as the source of truth for WhatsApp operations in this workspace.
2. Prefer read-only commands first when the task is exploratory.
3. Use the existing configured account by default.
4. Re-authenticate only when authentication is broken, missing, or explicitly requested.
5. Keep `wacli` command examples close to the current CLI surface and update references when the binary changes.

## Mandatory Rules

1. Read `wacli <command> --help` before using any command you have not already validated in this session.
2. Use `--json` when you need structured output for parsing or follow-up automation.
3. Use `--read-only` for inspection tasks and diagnostics when the command supports it.
4. Do not guess flags for send, sync, or history commands; confirm them with `--help` first.
5. Prefer `messages`, `chats`, `groups`, `channels`, `contacts`, `polls`, `history`, `store`, and `doctor` for inspection and maintenance.
6. Use `auth` only for QR bootstrap, logout, or status checks that require auth repair.
7. Use `sync` for local database refreshes; it never shows a QR code.
8. Assume the WhatsApp account is already configured in this workspace unless the user asks to pair a different one.

## Workflow

1. Identify the user goal: read, send, manage, sync, diagnose, or configure.
2. Pick the narrowest command group that fits the goal.
3. Inspect the command help if the exact syntax is not already known.
4. Execute the command with the configured account and store.
5. Verify the result with a read command, `doctor`, or a second targeted lookup.
6. If the command fails, check auth, account selection, store lock, and sync state before retrying.

## Common Command Groups

1. `wacli messages` for reading, searching, exporting, editing, deleting, and inspecting message context.
2. `wacli send` for sending text, files, stickers, voice notes, polls, reactions, and status updates.
3. `wacli chats` for listing, showing, muting, pinning, archiving, marking read/unread, and cleanup.
4. `wacli groups` for group info, invitations, membership, participants, renaming, and pruning.
5. `wacli channels` for joining, leaving, listing, and refreshing channels.
6. `wacli contacts` for aliases, tags, search, refresh, and importing names from system contacts.
7. `wacli auth` for authentication status and logout.
8. `wacli sync` for refreshing the local store and optionally downloading media or refreshing contacts/groups/channels.
9. `wacli history` for backfill and archive coverage.
10. `wacli store` and `wacli doctor` for diagnostics and store health.

## Verification And Recovery

1. After a send action, confirm delivery by checking the related chat or message list.
2. After sync, confirm the local store updated with `messages list`, `chats list`, or `groups list`.
3. If auth seems broken, run `wacli auth status` first and then `wacli doctor`.
4. If the store looks stale, run `wacli sync --once` before retrying a read.
5. If a command reports ambiguous recipients, resolve the target explicitly with JID, phone number, or a unique contact/chat name.

## Reference Map

1. Command surface and flags: [references/command-surface.md](references/command-surface.md)
2. Common workflows and safe sequences: [references/workflows.md](references/workflows.md)

## Operational Notes

1. Use the configured default account unless the user asks for another account.
2. Keep message IDs, chat JIDs, and sender JIDs explicit when replying, reacting, or voting.
3. When in doubt, prefer a read-only probe over a write action.
4. Do not use `auth` as a routine step when `sync` or read-only commands are enough.
5. If the user asks for a command that has not been documented yet, inspect `wacli <command> --help` and extend the references.
