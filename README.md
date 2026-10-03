# Z Games Hub

Build a completely separate website called Z Games.

This is a new project. Do NOT modify my existing ZChat project unless I explicitly ask you to later.

Goal:
Z Games will be a polished game hub.
I do NOT want you to create the actual games yourself.
I want the website to display/play games from the same kind of external game source/catalog that sites such as WatchDocumentaries use, because those sites do not create all of the games themselves.

VERY IMPORTANT:
Do NOT:
* recreate games from scratch
* generate fake games
* make placeholder games
* copy game source code
* scrape WatchDocumentaries
* proxy WatchDocumentaries
* copy WatchDocumentaries’ website design
* download/copy copyrighted game files
* pretend that games are hosted by Z Games when they are actually hosted elsewhere
* bypass access restrictions or network blocks

Instead, design Z Games so that games can come from a legitimate external game catalog/provider (such as GameDistribution, GamePix, GameMonetize, or Playgama embed iframe/API feeds).
Do not invent an API or pretend a provider exists.

Z Games design:
Make the site feel like a real gaming platform.
Dark modern gaming aesthetic, but keep it clean rather than overly flashy.

Homepage:
* Z GAMES logo/branding
* Search games
* Featured games
* Popular games
* Recently added
* Game categories
* Game cards with thumbnail, title, category
* Responsive desktop/mobile layout
* Smooth but subtle animations
* Fast loading
* Proper empty/loading/error states

Game cards should be designed so that an external game's:
* title
* thumbnail
* category
* description
* play URL/embed URL
can be supplied by a future legitimate game provider.

Game page:
Create the UI for:
* Game title
* Game thumbnail
* Description
* Category
* Play button
* Fullscreen button where supported
* Back to games
* Related games
Do NOT create fake playable games.
If there is no legitimate game source connected yet, make the UI ready for one without pretending it is connected. Provide a clear, polished state explaining how an external provider embed URL or feed connects.

ZChat login:
I want users to be able to log into Z Games using their existing ZChat account.
* Use existing Supabase authentication.
* Do NOT create a separate username/password system.
* Do NOT duplicate ZChat accounts.
* Do NOT copy passwords or authentication secrets.
* Provide a clean "Sign in with ZChat" modal/view.

Z Games account UI:
Once authenticated, provide:
* Profile/avatar
* Display name
* Sign out
* Account state
* Recently played games UI
Keep the account system simple. Do not add unnecessary social features yet.

Architecture:
Keep Z Games separate from ZChat.
Do not modify ZChat right now.
Do not add unnecessary backend infrastructure.
Do not add a database unless it is actually required.
Do not add fake APIs or fake game data.
Make the initial result look polished and production-ready even if the external game catalog has not been connected yet.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/541cea4d-c7de-46d9-841e-50861ab6f436).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
