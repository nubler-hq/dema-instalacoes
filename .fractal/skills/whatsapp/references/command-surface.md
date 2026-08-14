# Wacli Command Surface

This reference is based on the current `wacli --help` surface captured from the installed binary in this workspace.

## Global Flags

Most commands support these global flags:

- `--account <name>`: use a named account from `config.yaml`
- `--json`: emit JSON instead of human-readable output
- `--full`: disable truncation in table output
- `--store <path>`: override the local store directory
- `--timeout <duration>`: command timeout for non-sync commands
- `--lock-wait <duration>`: wait for the store lock before failing write commands
- `--events`: emit NDJSON lifecycle events on stderr
- `--read-only`: reject commands that write to WhatsApp or the local store

## Top-Level Commands

- `accounts`: manage named WhatsApp accounts
- `auth`: authenticate with WhatsApp using QR or phone bootstrap, and manage auth status/logout
- `calls`: list call events from the local DB
- `channels`: manage WhatsApp channels
- `chats`: list and manage chats
- `completion`: generate shell completion scripts
- `contacts`: search and manage local contact metadata
- `docs`: print the documentation URL
- `doctor`: diagnostics for store, auth, and search
- `groups`: group management
- `history`: history coverage and backfill
- `media`: media download
- `messages`: list and search messages from the local DB
- `poll`: vote on or inspect a poll
- `polls`: list polls
- `presence`: send typing or paused indicators
- `profile`: manage the WhatsApp profile
- `send`: send messages
- `store`: manage the local data store
- `sync`: sync messages; never shows QR and requires prior auth
- `version`: print version

## Accounts

- `accounts add`: add an account and authenticate it
- `accounts list`: list configured accounts
- `accounts remove`: remove an account from config without deleting its store
- `accounts show`: show one configured account
- `accounts use`: set the default account

## Auth

- `auth status`: show authentication status
- `auth logout`: logout and invalidate the session
- `auth` flags of note:
  - `--follow`: keep syncing after auth
  - `--download-media`: download media in the background during sync
  - `--phone <number>`: pair by phone number instead of QR code
  - `--qr-format terminal|text`: choose QR rendering format
  - `--idle-exit <duration>`: exit after being idle in bootstrap/once modes

## Calls

- `calls list`: list call events

## Channels

- `channels info`: fetch channel info live and update local chats
- `channels join`: join a channel via invite link or code
- `channels leave`: leave or unfollow a channel
- `channels list`: list subscribed channels live and update local chats

## Chats

- `chats archive`
- `chats cleanup`
- `chats list`
- `chats mark-read`
- `chats mark-unread`
- `chats mute`
- `chats pin`
- `chats show`
- `chats unarchive`
- `chats unmute`
- `chats unpin`

## Contacts

- `contacts alias set`
- `contacts alias rm`
- `contacts import-system`: import display names from macOS Contacts
- `contacts refresh`: import contacts from the whatsmeow store into the local DB
- `contacts search`: search synced metadata
- `contacts show`: show one contact
- `contacts tags`: manage local tags

## Doctor

- `doctor`: diagnostics for store/auth/search
- `doctor --connect`: try connecting to WhatsApp and requires the store lock

## Groups

- `groups info`: fetch group info live and update local DB
- `groups invite`: manage group invite links
- `groups join`: join a group by invite code
- `groups leave`: leave a group
- `groups list`: list known groups from local DB
- `groups participants add|demote|promote|remove`: participant management
- `groups prune`: remove old or left groups from local storage
- `groups refresh`: fetch joined groups live and update local DB
- `groups rename`: rename a group

## History

- `history backfill`: request older messages for a chat from the primary device
- `history coverage`: show local archive coverage by chat
- `history fill`: plan multi-chat history backfill

## Media

- `media download`: download media for a message

## Messages

- `messages context`: show message context around a message ID
- `messages delete`: delete a message for everyone or for you
- `messages edit`: edit one of your recent sent text messages
- `messages export`: export messages as JSON
- `messages list`: list messages
- `messages search`: search messages with FTS5 when available, otherwise LIKE
- `messages show`: show one message
- `messages starred`: list starred messages

### Messages Search Flags

- `--after <date|RFC3339>`
- `--before <date|RFC3339>`
- `--chat <jid>`
- `--forwarded`
- `--from <jid>`
- `--has-media`
- `--limit <n>`
- `--starred`
- `--type text|image|video|audio|document`

## Polls

- `poll show`: show a poll question, options, and votes
- `poll vote`: vote on a poll
- `polls list`: list polls stored locally

## Presence

- `presence typing`: send a composing indicator
- `presence paused`: send a paused indicator

## Profile

- `profile set-picture <image>`: set the WhatsApp profile picture; JPEG or PNG and auto-resized to 640px max

## Send

- `send text`: send a text message
- `send file`: send a file
- `send poll`: send a poll
- `send react`: react to a message
- `send status`: send a status broadcast
- `send sticker`: send a WebP sticker
- `send voice`: send a voice note

### Send Text Flags

- `--message <text>`: message body
- `--message-escapes`: interpret backslash escapes in the message text
- `--to <jid|phone|contact/chat/group name>`: target recipient
- `--reply-to <message-id>`: quote or reply to a message
- `--reply-to-sender <jid>`: sender JID of the quoted message
- `--mention <jid>`: mention a user or JID; repeatable
- `--pick <n>`: choose the Nth match when the recipient is ambiguous
- `--no-preview`: disable automatic link previews
- `--ephemeral`: send with the disappearing-message timer
- `--ephemeral-duration <duration>`: override the disappearing timer
- `--post-send-wait <duration>`: keep the connection alive for retry receipts

### Send File Flags

- `--file <path>`: path to the file
- `--filename <name>`: display name for the file
- `--caption <text>`: caption for supported media
- `--mime <type>`: override detected MIME type
- `--ptt`: send OGG/Opus audio as a voice note

### Send Poll Flags

- `--question <text>`
- `--option <text>`: repeat for each option; 2-12 total
- `--multi <n>`: maximum selectable options; `1` means single-select
- `--ephemeral`: wrap the poll in an ephemeral message

### Send React Flags

- `--id <message-id>`
- `--reaction <emoji>`
- `--to <jid|phone|chat name>`
- `--sender <jid>`: required for group messages

### Send Status Flags

- `--message <text>`: text status or media caption
- `--file <path>`: media file for a status update
- `--mime <type>`: override MIME type for status media
- `--background-color <#RRGGBB|#AARRGGBB>`
- `--font <n>`: WhatsApp text status font number

### Send Sticker and Voice Flags

- `send sticker --file <webp>`
- `send voice --file <ogg|opus>`
- Both support `--to`, `--reply-to`, `--reply-to-sender`, and `--post-send-wait`

## Store

- `store cleanup`: clean up old data from the local store
- `store stats`: show store statistics

## Sync

- `sync`: sync messages and optionally refresh contacts, groups, or channels
- Important flags:
  - `--once`: sync until idle and exit
  - `--follow`: keep syncing until Ctrl+C
  - `--download-media`: download media in the background during sync
  - `--idle-exit <duration>`: exit after being idle
  - `--refresh-contacts`: refresh contacts from the session store into the local DB
  - `--refresh-groups`: refresh joined groups live into the local DB
  - `--refresh-channels`: refresh subscribed channels live into the local DB
  - `--max-db-size <size>`: stop sync when local DB usage reaches the limit
  - `--max-messages <n>`: stop sync after a message count cap
  - `--max-reconnect <duration>`: stop reconnect attempts after a limit
  - `--webhook <url>`: POST live message JSON to a webhook
  - `--webhook-secret <secret>`: HMAC-SHA256 signing secret for webhook payloads
  - `--webhook-allow-private`: allow local/private webhook targets

## Default Operating Rules

- Use `wacli auth status` and `wacli doctor` before re-authing or debugging the store.
- Use `wacli sync --once` after auth to populate the local DB.
- Use `wacli messages search` and `wacli messages show` for read flows.
- Use `wacli send text|file|poll|react|status|sticker|voice` for outbound actions.
- Use `wacli chats`, `wacli groups`, `wacli channels`, and `wacli contacts` for metadata management.
- Use `--read-only` for inspection commands when available and avoid it for write flows.
- When a recipient or chat is ambiguous, resolve it explicitly before sending.
