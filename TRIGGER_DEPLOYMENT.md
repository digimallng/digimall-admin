# Admin App Deployment Trigger

This file triggers the CI/CD pipeline for DigiMall Admin application.

**Pipeline Status**: Ready ✅  
**ECR Repository**: `379355014259.dkr.ecr.us-east-1.amazonaws.com/digimall-admin`  
**Target Server**: `ec2-13-221-110-58.compute-1.amazonaws.com:4300`  
**Deployment Time**: $(date)

---

The deployment pipeline will:
1. Build Docker image with Next.js standalone output
2. Push to AWS ECR
3. Deploy to EC2 server on port 4300
4. Send Slack notifications
5. Perform health checks

**Port Configuration:**
- **Backend API**: 4100
- **Vendor App**: 4200  
- **Admin App**: 4300 ✅

Monitor progress at: https://github.com/digimallng/digimall-admin/actions