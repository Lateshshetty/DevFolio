<div align="center">

<img src="https://capsule-render.vercel.app/api?type=cylinder&color=0D0D0D&height=160&section=header&text=DevFolio&fontSize=90&fontColor=F5F0E8&fontAlignY=55&desc=Your+developer+identity.+One+link.&descAlignY=75&descColor=FF4D3D&descSize=18&animation=fadeIn" width="100%"/>

<br/>

<a href="https://devfolio-latesh.vercel.app">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=16&pause=3000&color=FF4D3D&center=true&vCenter=true&repeat=true&width=600&height=40&duration=4000&lines=devfolio-latesh.vercel.app%2Fu%2Fyour-slug;Stop+sharing+random+GitHub+links.;Projects+%2B+Stats+%2B+Themes+%E2%80%94+one+URL.;Built+with+Spring+Boot+%2B+React+%2B+MongoDB." alt="Typing SVG" />
</a>

<br/><br/>

<img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black"/>
<img src="https://img.shields.io/badge/Spring_Boot-3.5-6DB33F?style=flat-square&logo=springboot&logoColor=white"/>
<img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white"/>
<img src="https://img.shields.io/badge/Deployed-Vercel-000000?style=flat-square&logo=vercel&logoColor=white"/>
<img src="https://img.shields.io/badge/Payments-Razorpay-02042B?style=flat-square&logo=razorpay&logoColor=white"/>
<img src="https://img.shields.io/badge/OAuth2-GitHub_+_Google-24292e?style=flat-square&logo=github&logoColor=white"/>

</div>

---

## What is DevFolio?

> A shareable developer profile platform — like Linktree, but built for engineers. One clean URL that presents your GitHub projects, coding stats, tech stack, and social links under a theme that actually reflects your personality.

Recruiters want one link. Give them one. Make it unforgettable.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   FRONTEND  (Vercel)                    │
│           React 18 + Vite — Single Page App             │
│      14 Themes  ·  OAuth2 Login  ·  Razorpay UI         │
└──────────────────────┬──────────────────────────────────┘
                       │  REST API  (HTTPS + Session Cookies)
┌──────────────────────▼──────────────────────────────────┐
│                   BACKEND  (Render)                     │
│              Spring Boot 3.5  ·  Java 21                │
│      Spring Security OAuth2  ·  CORS  ·  Sessions       │
└────┬──────────────┬───────────────┬──────────────┬──────┘
     │              │               │              │
     ▼              ▼               ▼              ▼
 MongoDB        Cloudinary      GitHub API    LeetCode +
 (Atlas)        (Images)        (Projects)    Codeforces
```

---

## Features

- **One public URL** — `devfolio-latesh.vercel.app/u/{slug}` — your entire dev identity in one place
- **GitHub project sync** — add a repo URL, everything is auto-fetched. Nightly cron keeps stars, forks, and language fresh
- **Live coding stats** — LeetCode (solved, submissions, ranking) and Codeforces (rating, rank) pulled on every page view
- **14 themes** — Terminal, Samurai, Cyberpunk, F1 Racing, Ghibli, Glassmorphism and more. Each is a complete visual identity
- **Cloudinary image uploads** — profile photos with automatic cleanup of old public IDs
- **Razorpay payments** — PRO tier upgrade with HMAC-SHA256 server-side signature verification
- **Session-based visit counter** — unique per session, no duplicate inflation
- **Privacy toggle** — flip your profile public or private at any time

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, CSS-in-JS |
| Backend | Spring Boot 3.5, Java 21 |
| Database | MongoDB Atlas |
| Auth | Spring Security OAuth2 (GitHub + Google) |
| Image Storage | Cloudinary |
| Payments | Razorpay |
| Deployment | Vercel (frontend) + Render (backend) |
| GitHub Sync | Spring `@Scheduled` cron — nightly 2 AM |
| Stats APIs | LeetCode GraphQL + Codeforces REST |

---

## Project Structure

```
DevFolio/
├── DevFolio-Frontend/
│   ├── src/
│   │   ├── App.jsx                     # All pages — landing, login, dashboard, portfolio
│   │   └── main.jsx
│   ├── public/
│   │   ├── Devloper.mp4                # Mascot animation
│   │   └── Login page video.mp4
│   └── vite.config.js
│
└── DevFolio-Backend/
    └── src/main/java/.../
        ├── controller/
        │   ├── ProfileController.java  # Profile, projects, stats endpoints
        │   └── PaymentController.java  # Razorpay verification
        ├── service/
        │   ├── ProfileService.java     # Core business logic
        │   ├── ProjectService.java     # GitHub project management
        │   ├── GithubService.java      # GitHub API client
        │   ├── LeetCodeService.java    # LeetCode GraphQL
        │   ├── CodeforcesService.java  # Codeforces REST
        │   ├── PaymentService.java     # HMAC payment verification
        │   ├── ImageService.java       # Cloudinary uploads
        │   └── GithunSyncService.java  # Nightly sync cron
        ├── model/
        │   ├── Devprofile.java         # Main profile document
        │   ├── Users.java              # User entity
        │   ├── Project.java            # Project document
        │   └── Theme.java              # Theme configuration
        ├── security/
        │   ├── SecurityFilter.java     # Spring Security config
        │   └── CustomOAuth2UserService # OAuth2 user provisioning
        └── config/
            ├── ThemeSeeder.java        # Seeds 14 themes on startup
            └── SchedulerConfig.java    # Enables @Scheduled
```

---

## Quick Start

### Backend

```bash
git clone https://github.com/your-username/DevFolio.git
cd DevFolio/DevFolio-Backend

export MONGO_URI="mongodb+srv://..."
export GOOGLE_CLIENT_ID="..."
export GOOGLE_CLIENT_SECRET="..."
export GITHUB_CLIENT_ID="..."
export GITHUB_CLIENT_SECRET="..."
export CLOUDINARY_NAME="..."
export CLOUDINARY_KEY="..."
export CLOUDINARY_SECRET="..."
export RAZORPAY_KEY="..."
export RAZORPAY_SECRET="..."

./mvnw spring-boot:run
```

### Frontend

```bash
cd DevFolio/DevFolio-Frontend

echo "VITE_API_BASE=http://localhost:8080" > .env
echo "VITE_RAZORPAY_KEY=rzp_test_xxxxx" >> .env

npm install && npm run dev
```

### Docker

```bash
cd DevFolio-Backend
docker build -t devfolio-backend .
docker run -p 8080:8080 --env-file .env devfolio-backend
```

---

## API Reference

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|:----:|
| `GET` | `/api/profile/me` | Get current user's profile | yes |
| `PUT` | `/api/profile` | Update profile | yes |
| `DELETE` | `/api/profile` | Delete account | yes |
| `POST` | `/api/profile/image` | Upload profile photo | yes |
| `GET` | `/api/themes` | List all themes | yes |
| `POST` | `/api/project` | Add GitHub project by URL | yes |
| `DELETE` | `/api/projects/{id}` | Remove a project | yes |
| `PUT` | `/api/projects/order` | Reorder projects | yes |
| `PUT` | `/api/projects/{id}/featured` | Feature a project | yes |
| `POST` | `/api/payment/verify` | Verify Razorpay payment | yes |
| `GET` | `/u/{slug}` | View public profile | public |
| `GET` | `/u/{slug}/projects` | Public project list | public |
| `GET` | `/u/{slug}/coding-stats` | LeetCode + Codeforces stats | public |

---

## Security

- OAuth2 only — no passwords stored
- HttpOnly session cookies, `SameSite=None`, `Secure=true`
- CORS locked to `localhost:5173` and production origin only
- PRO themes validated server-side before applying
- Project ownership verified before delete or modify operations
- Razorpay payment verified via HMAC-SHA256 signature on backend

---

## Contributing

```bash
git checkout -b feature/your-feature
git commit -m "feat: describe your change"
git push origin feature/your-feature
# open a pull request
```

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=0,2,2,5,30&height=140&section=footer&text=devfolio-latesh.vercel.app&fontSize=18&fontColor=F5F0E8&fontAlignY=65&animation=twinkling" width="100%"/>

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=13&pause=3000&color=888888&center=true&vCenter=true&repeat=true&width=400&height=30&lines=Built+with+%E2%98%95+for+devs+who+ship." alt="footer" />

</div>
