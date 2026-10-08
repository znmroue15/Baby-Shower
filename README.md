# Baby shower site: setup (about 20 minutes, all free)

What you get:
- **/** the invitation with RSVP. Every RSVP is saved and **emailed to znmroue@gmail.com** automatically.
- **/tracker.html** your private tally (password protected). It updates by itself.
- After RSVPing, guests can add the shower to their calendar (Google, or Apple/Outlook with a Monday reminder).

## 1. Get an email key (Resend)
1. Go to resend.com and sign up using **znmroue@gmail.com** (use this exact email).
2. In Resend, open **API Keys**, create a key, and copy it. You will paste it in step 3.

## 2. Put the site online (Netlify)
1. Create a free account at github.com and make a new repository. Upload everything in this folder (use "Add file > Upload files"; keep the `public` and `netlify` folders).
2. Create a free account at netlify.com. Choose **Add new site > Import an existing project**, pick GitHub, and select your repository. Leave the build settings as they are and click Deploy.

## 3. Add your settings
In Netlify: **Site configuration > Environment variables**, add:
- `RESEND_API_KEY` = the key from step 1
- `NOTIFY_EMAIL` = znmroue@gmail.com
- `TRACKER_PASSWORD` = any password you choose (this opens the tracker page)

Then go to **Deploys > Trigger deploy > Deploy site** so the settings take effect.

## 4. Test it
1. Open your Netlify address, send a test RSVP, and check znmroue@gmail.com (look in spam the first time).
2. Open `your-address/tracker.html`, enter your password, and confirm the test RSVP appears. Use **Remove** to delete it.

## Notes
- Texts are not included (they need a paid service). The Gmail app on your phone can notify you for each RSVP.
- Guests can RSVP more than once. Remove duplicates in the tracker.
- To change details (time, address, registry), edit `public/index.html` and re-upload it to GitHub. Netlify updates itself.
