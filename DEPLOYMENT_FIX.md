# Backend URL Fix Deployment

## Issue Fixed
- Admin app was unable to connect to backend API from Docker container
- **Root Cause**: DNS resolution issue with `https://api.digimall.ng` from within Docker

## Solution Applied
- Updated `NEXT_PUBLIC_BACKEND_URL` from `https://api.digimall.ng` to `http://localhost:4100`
- Updated `NEXT_PUBLIC_WS_URL` from `wss://api.digimall.ng` to `ws://localhost:4100`

## Rationale
Both admin app and backend API are running on the same EC2 server:
- **Backend API**: Port 4100
- **Admin App**: Port 4300

Using `localhost` avoids:
- DNS resolution issues in Docker
- SSL certificate complications
- Network routing overhead

## Deployment Time
- Timestamp: $(date)
- GitHub Secrets Updated: ✅
- Ready for deployment

---

**Note**: For external access, users will still use `https://admin.digimall.ng` via reverse proxy/load balancer.