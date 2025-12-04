# Mail

This repository contains a single-page mail client built with Django for the backend and HTML/CSS/JavaScript for the frontend.  
The application implements inbox, sent, and archived mailboxes, composing and sending mail, viewing messages, archiving/unarchiving, and replying — all while using a JSON API provided by the Django app. The front-end is a single-page application: navigation and views are controlled entirely via JavaScript.

## Overview / Behavior
- The app is a SPA: the server serves one main page (rendered by `index`), and the client-side JavaScript (`inbox.js`) controls which view is visible (Inbox, Sent, Archive, Compose, and individual message view) without full page reloads.
- All emails are stored in the project's database and are not sent to real SMTP servers — use any email address to register for testing (e.g. `foo@example.com`).

## Features

### Send Mail
- Compose a new message using the Compose form (recipients, subject, body).
- Submitting the form sends a `POST` request to `/emails` and, on success, loads the Sent mailbox.

### Mailboxes
- Inbox, Sent, and Archive mailboxes are loaded dynamically by calling `GET /emails/<mailbox>`.
- Each mailbox displays emails in reverse chronological order with sender, subject, timestamp, and visual read/unread state (unread = white background; read = gray background).

### View Email
- Clicking an email loads the full message via `GET /emails/<id>` and displays sender, recipients, subject, timestamp, and body in a dedicated view.
- Opening an email marks it as read by issuing a `PUT /emails/<id>` with `{ read: true }`.

### Archive / Unarchive
- From an Inbox email view, a signed-in user can archive the message by sending `PUT /emails/<id>` with `{ archived: true }`.
- From an Archive email view, a signed-in user can unarchive the message with `{ archived: false }`.
- After archiving/unarchiving, the Inbox is reloaded.

### Reply
- While viewing an email, the user can click **Reply** to open the Compose view pre-filled:
  - `recipients` set to the original sender,
  - `subject` prefixed with `Re:` if not already present,
  - `body` pre-filled with a quoted line like `On <timestamp> <sender> wrote:` followed by the original message.
- Submitting the reply performs a `POST /emails` request and then loads Sent.

### API (used by frontend)
- `GET /emails/<mailbox>` — returns list of emails in mailbox (`inbox`, `sent`, `archive`).
- `GET /emails/<id>` — returns json for a single email.
- `POST /emails` — send a new email; expects `{ recipients, subject, body }`.
- `PUT /emails/<id>` — update `read` and/or `archived` status (e.g. `{ read: true }`, `{ archived: true }`).

## Notes about frontend
- The client-side app logic and all required behavior for grading are expected to be implemented in `mail/static/mail/inbox.js`.  
- The HTML template `mail/templates/mail/inbox.html` contains three primary view containers that are shown/hidden by JavaScript: the mailbox list view, the compose view, and the single-email view. Buttons in the header trigger JavaScript functions to switch views and make API calls.

## Running Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/matheusesilva/mail.git
   cd mail

2. Create and activate a virtual environment
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   
4. Install dependencies
   ```bash
   pip install django
   
6. Apply migrations
   ```bash
   python manage.py makemigrations mail
   python manage.py migrate
   
8. Run the development server
   ```bash
   python manage.py runserver
   
10. Open the app
    ```bash
    http://127.0.0.1:8000/

## Quick testing checklist

- Compose a message and confirm it appears in Sent.

- Open each mailbox (Inbox, Sent, Archive) and verify emails render.

- Click an email to view it and confirm it is marked read.

- Archive and unarchive messages and verify inbox updates.

- Reply to a message and confirm Sent contains the reply.

### License

This project is provided under the MIT License.
