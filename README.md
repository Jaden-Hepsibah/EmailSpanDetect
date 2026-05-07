# SpamShield – Email Spam Detection System 

The project features a modern user interface inspired by email platforms and includes Inbox, Spam, and Trash management systems along with spam probability analysis.

##  Features

- Email spam detection using keyword matching
- Spam probability calculation
- Detection of suspicious keywords
- Spam folder for detected spam emails
- Responsive sidebar navigation
- Modern and interactive UI

## Technologies Used

- HTML5
- CSS3
- JavaScript

## How It Works

1. User enters:
   - Sender Email
   - Subject
   - Email Body
2. The system scans the email content for spam-related keywords.
3. A spam score and spam probability percentage are calculated.
4. The email is classified as:
   - Legitimate Email
   - Spam Email
5. Emails can be saved into:
   - Inbox
   - Spam Folder
   - Trash

##  Spam Detection Logic

The system uses a Keyword Matching Algorithm.
The algorithm:
- Combines all email text
- Converts text to lowercase
- Matches predefined spam keywords
- Calculates spam probability
- Displays the final result
