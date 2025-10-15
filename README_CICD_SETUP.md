# DigiMall Admin App - CI/CD Setup Complete ✅

## What's Been Configured

### ✅ AWS Infrastructure
- **ECR Repository Created**: `digimall-admin` 
- **Repository URI**: `379355014259.dkr.ecr.us-east-1.amazonaws.com/digimall-admin`
- **AWS Credentials**: Configured for CI/CD user

### ✅ Server Configuration
- **Target Server**: `ec2-13-221-110-58.compute-1.amazonaws.com`
- **SSH Key**: `JyvProductionKey.pem` (secured)
- **User**: `ubuntu`
- **Port**: `22` (standard SSH port)
- **App Directory**: `/home/ubuntu/digimall-admin`
- **Application Port**: `4300` (avoids conflicts with vendor:4200 and backend:4100)
- **Connection Tested**: ✅ Working

### ✅ Application Configuration
- **Port**: `4300` (conflict-free)
- **Docker Setup**: Multi-stage build optimized for Next.js
- **Environment**: Production-ready with Next.js standalone output
- **Health Checks**: Configured
- **Logging**: Rotation and monitoring setup

### ✅ Files Created/Updated
1. `.github/workflows/deploy.yml` - CI/CD pipeline for admin app
2. `Dockerfile` - Updated for production deployment on port 4300
3. `docker-compose.prod.yml` - Production configuration
4. `deploy.sh` - Server management script
5. `.env.production` - Production environment template
6. `package.json` - Updated start script for flexible port

### ✅ GitHub Repository
- **Repository**: `https://github.com/digimallng/digimall-admin`
- **Status**: Public repository created and pushed
- **Secrets**: All 12 secrets configured

### ✅ Environment Variables
- **NEXTAUTH_URL**: `https://admin.digimall.ng` ✅
- **NEXTAUTH_SECRET**: Configured
- **NEXT_PUBLIC_BACKEND_URL**: `https://api.digimall.ng`
- **NEXT_PUBLIC_WS_URL**: `wss://api.digimall.ng`
- **SETUP_TOKEN**: Admin setup token configured
- **ADMIN_SETUP_TOKEN**: Same as setup token

### ✅ Notifications
- **Slack Integration**: Configured for deployment notifications
- **Webhook URL**: Set for Jyv Stream workspace

## Port Allocation Summary

| Service | Port | Status |
|---------|------|--------|
| **Backend API** | 4100 | ✅ Running |
| **Vendor App** | 4200 | ✅ Running |
| **Admin App** | 4300 | 🚀 Deploying |

## Pipeline Status

### 🚀 Current Deployment
- **Pipeline**: Running (Build Docker Image stage)
- **Run ID**: `18521027595`
- **Status**: Building Docker image for admin app
- **Monitor**: https://github.com/digimallng/digimall-admin/actions/runs/18521027595

## Access URLs

- **Production URL**: https://admin.digimall.ng (when domain configured)
- **Direct Server**: http://ec2-13-221-110-58.compute-1.amazonaws.com:4300
- **GitHub Repository**: https://github.com/digimallng/digimall-admin
- **ECR Repository**: 379355014259.dkr.ecr.us-east-1.amazonaws.com/digimall-admin

## Key Features

### 🚀 Automated Deployment
- Triggers on push to `main` or `production` branches
- Builds optimized Docker image with Node.js 22
- Pushes to ECR with timestamp and commit tags
- Deploys to EC2 automatically on port 4300

### 🔍 Monitoring & Health Checks
- Container health monitoring every 30s
- Application connectivity tests
- CloudWatch metrics: `DigiMall/AdminApp/HealthCheck`
- Slack notifications for all deployment events

### 🛡️ Security
- Non-root container execution
- Encrypted GitHub secrets
- SSH key-based authentication (port 22)
- Environment variable isolation

### 📊 Management
- Deployment script with comprehensive commands
- Log rotation and management (10MB max, 3 files)
- Image cleanup automation
- Port conflict detection and warnings

## Deployment Commands

### Server-side Management
```bash
# SSH to server
ssh -i ~/.ssh/JyvProductionKey.pem ubuntu@ec2-13-221-110-58.compute-1.amazonaws.com

# Navigate to admin app
cd /home/ubuntu/digimall-admin

# Available commands
./deploy.sh deploy    # Full deployment
./deploy.sh start     # Start containers
./deploy.sh stop      # Stop containers
./deploy.sh restart   # Restart containers
./deploy.sh status    # Show status
./deploy.sh logs      # View logs
./deploy.sh verify    # Health check
./deploy.sh cleanup   # Clean old images
```

## Next Steps

1. **Monitor current deployment** via GitHub Actions and Slack
2. **Verify application** at http://ec2-13-221-110-58.compute-1.amazonaws.com:4300 once deployed
3. **Configure domain** routing for https://admin.digimall.ng
4. **Test admin functionality** after deployment completes

## Troubleshooting

### Quick Health Check
```bash
# Test admin app connectivity
curl -f http://ec2-13-221-110-58.compute-1.amazonaws.com:4300

# Check container status
docker ps | grep digimall-admin

# View recent logs
docker-compose -f /home/ubuntu/digimall-admin/docker-compose.prod.yml logs --tail=20
```

### Port Verification
```bash
# Check port usage
ss -tuln | grep :4300
```

---

**Status**: ✅ Complete - Pipeline Running
**Next Action**: Monitor deployment progress and verify application access