# 🚀 Acadify Deployment Checklist

## Pre-Deployment Checklist

### 1. Environment Setup
- [ ] Node.js installed (v14+)
- [ ] MongoDB installed and running (v4.4+)
- [ ] npm packages installed (`npm install`)
- [ ] `.env` file configured with all required variables
- [ ] MongoDB connection string verified

### 2. Database Setup
- [ ] MongoDB service running
- [ ] Database initialized (`npm run init-mongo-db`)
- [ ] Test data loaded (optional)
- [ ] Indexes created on frequently queried fields

### 3. Security Configuration
- [ ] JWT_SECRET set to strong random string (32+ characters)
- [ ] JWT_EXPIRE configured appropriately
- [ ] CORS settings configured for production domain
- [ ] Rate limiting implemented (recommended)
- [ ] Helmet.js added for security headers (recommended)

### 4. API Keys & Services
- [ ] Cloudinary credentials configured
- [ ] Google Gemini API key configured
- [ ] Email service configured (if applicable)
- [ ] All third-party service credentials verified

### 5. Code Quality
- [ ] All Python files removed ✅
- [ ] No console.log statements in production code
- [ ] Error handling implemented in all routes
- [ ] Input validation on all endpoints
- [ ] No hardcoded credentials

### 6. Testing
- [ ] Login functionality tested
- [ ] Bulk student upload tested
- [ ] Timetable generation tested
- [ ] Report card generation tested
- [ ] Exam creation and submission tested
- [ ] All API endpoints tested
- [ ] Mobile responsiveness tested
- [ ] Cross-browser compatibility tested

### 7. Performance
- [ ] MongoDB indexes optimized
- [ ] Large file uploads handled properly
- [ ] API response times acceptable
- [ ] Frontend assets minified (if applicable)
- [ ] Images optimized

### 8. Documentation
- [ ] README.md updated ✅
- [ ] API documentation complete ✅
- [ ] User guide created ✅
- [ ] Deployment guide available ✅

## Deployment Steps

### Option 1: Local/VPS Deployment

#### Step 1: Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### Step 2: Application Setup
```bash
# Clone repository
git clone <your-repo-url>
cd acadify

# Install dependencies
npm install --production

# Create .env file
nano .env
# Add all environment variables

# Initialize database
npm run init-mongo-db

# Test the application
npm start
```

#### Step 3: Process Manager (PM2)
```bash
# Install PM2
sudo npm install -g pm2

# Start application
pm2 start server.js --name acadify

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

#### Step 4: Nginx Reverse Proxy
```bash
# Install Nginx
sudo apt install -y nginx

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/acadify
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/acadify /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 5: SSL Certificate (Let's Encrypt)
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo certbot renew --dry-run
```

### Option 2: Cloud Deployment (Heroku)

#### Step 1: Prepare Application
```bash
# Create Procfile
echo "web: node server.js" > Procfile

# Ensure package.json has start script
# "start": "node server.js"
```

#### Step 2: Deploy to Heroku
```bash
# Login to Heroku
heroku login

# Create Heroku app
heroku create your-app-name

# Add MongoDB addon
heroku addons:create mongolab:sandbox

# Set environment variables
heroku config:set JWT_SECRET=your_secret
heroku config:set JWT_EXPIRE=7d
heroku config:set CLOUDINARY_CLOUD_NAME=your_cloud_name
# ... set all other variables

# Deploy
git push heroku main

# Open application
heroku open
```

### Option 3: Cloud Deployment (AWS/DigitalOcean)

#### AWS EC2
1. Launch EC2 instance (Ubuntu 20.04)
2. Configure security groups (ports 22, 80, 443, 3000)
3. SSH into instance
4. Follow "Local/VPS Deployment" steps above

#### DigitalOcean Droplet
1. Create Droplet (Ubuntu 20.04)
2. SSH into droplet
3. Follow "Local/VPS Deployment" steps above

## Post-Deployment Checklist

### 1. Verification
- [ ] Application accessible via domain/IP
- [ ] HTTPS working (if configured)
- [ ] Login functionality working
- [ ] All features functional
- [ ] Database connections stable
- [ ] File uploads working
- [ ] API endpoints responding

### 2. Monitoring
- [ ] Server monitoring setup (PM2, New Relic, etc.)
- [ ] Error logging configured
- [ ] Database backups scheduled
- [ ] Uptime monitoring enabled
- [ ] Performance monitoring active

### 3. Backup Strategy
- [ ] Database backup script created
- [ ] Automated daily backups scheduled
- [ ] Backup restoration tested
- [ ] Off-site backup storage configured

### 4. Security Hardening
- [ ] Firewall configured (UFW)
- [ ] SSH key authentication enabled
- [ ] Password authentication disabled
- [ ] Fail2ban installed and configured
- [ ] Regular security updates scheduled

### 5. Documentation
- [ ] Server access credentials documented
- [ ] Deployment process documented
- [ ] Rollback procedure documented
- [ ] Emergency contacts listed

## Maintenance Tasks

### Daily
- [ ] Check application logs
- [ ] Monitor server resources
- [ ] Verify backups completed

### Weekly
- [ ] Review error logs
- [ ] Check disk space
- [ ] Update dependencies (if needed)

### Monthly
- [ ] Security updates
- [ ] Performance optimization
- [ ] Database optimization
- [ ] Backup restoration test

## Troubleshooting

### Application Won't Start
```bash
# Check logs
pm2 logs acadify

# Check MongoDB status
sudo systemctl status mongod

# Check port availability
sudo netstat -tulpn | grep 3000
```

### Database Connection Issues
```bash
# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# Restart MongoDB
sudo systemctl restart mongod

# Check connection string in .env
```

### High Memory Usage
```bash
# Check memory usage
free -h

# Restart application
pm2 restart acadify

# Check for memory leaks
pm2 monit
```

### Slow Performance
```bash
# Check MongoDB indexes
mongo
use acadify
db.users.getIndexes()

# Monitor queries
db.setProfilingLevel(2)
db.system.profile.find().pretty()
```

## Rollback Procedure

### If Deployment Fails
```bash
# Revert to previous version
git reset --hard HEAD~1
pm2 restart acadify

# Or restore from backup
mongorestore --db acadify /path/to/backup
```

## Support Contacts

- **Technical Lead**: [Name] - [Email]
- **DevOps**: [Name] - [Email]
- **Database Admin**: [Name] - [Email]

## Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Nginx Documentation](https://nginx.org/en/docs/)

---

**Last Updated**: November 20, 2025  
**Version**: 2.0.0  
**Status**: Ready for Deployment ✅
