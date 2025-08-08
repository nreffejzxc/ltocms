# 🔒 Security Guidelines for LTOCMS

## ⚠️ CRITICAL SECURITY WARNING

**NEVER commit `.env` files to GitHub or any version control system!**

Your current `.env` files contain sensitive information including:

- Database credentials (MongoDB connection string)
- JWT secrets
- OAuth client secrets
- API keys

## 🚨 Immediate Actions Required

### 1. Check if .env files are already committed

If you've already pushed to GitHub, your sensitive data may be exposed. Check your repository:

```bash
# Initialize git if not already done
git init
git status
```

### 2. Remove .env files from git tracking (if already committed)

```bash
# Remove from git tracking but keep local files
git rm --cached backend/.env
git rm --cached backend/.env.production
git rm --cached frontend/.env
git rm --cached frontend/.env.production

# Commit the removal
git add .gitignore
git commit -m "Remove sensitive .env files from tracking and add proper .gitignore"
```

### 3. Regenerate compromised secrets

If your .env files were committed to a public repository:

1. **Change MongoDB password** in MongoDB Atlas
2. **Generate new JWT secrets**:
   ```bash
   # Generate new secrets
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```
3. **Regenerate OAuth client secrets** in Google Cloud Console
4. **Update all environment variables** in your deployment platforms

## 🛡️ Security Best Practices

### Environment Variables

1. **Use .env.example files** for documentation (safe to commit)
2. **Never commit actual .env files**
3. **Use strong, unique secrets** for production
4. **Rotate secrets regularly**

### Database Security

1. **Use MongoDB Atlas** with IP whitelisting
2. **Create dedicated database users** with minimal permissions
3. **Use strong passwords** (generated, not personal)
4. **Enable database monitoring**

### OAuth Security

1. **Restrict redirect URIs** to your actual domains
2. **Use HTTPS in production**
3. **Keep client secrets secure**
4. **Monitor OAuth usage**

### Deployment Security

1. **Set environment variables** directly in hosting platforms
2. **Use HTTPS everywhere**
3. **Enable security headers** (already configured)
4. **Monitor for vulnerabilities**

## 📋 Environment Setup Checklist

### For Development

- [ ] Copy `.env.example` to `.env` in both frontend and backend
- [ ] Fill in your actual values (never commit these files)
- [ ] Verify `.env` files are in `.gitignore`

### For Production

- [ ] Set environment variables in Railway dashboard
- [ ] Set environment variables in Vercel dashboard
- [ ] Use production-grade secrets (long and random)
- [ ] Enable HTTPS and security headers

## 🔍 How to Check if You're Secure

```bash
# Check what files git is tracking
git ls-files | grep -E "\.env$"

# This should return nothing. If it shows .env files, they're being tracked!
```

## 🆘 If You've Already Exposed Secrets

1. **Immediately change all passwords and secrets**
2. **Remove the repository** if it's public and contains secrets
3. **Create a new repository** with proper .gitignore
4. **Follow this security guide** before pushing again

## 📞 Emergency Contacts

If you believe your secrets have been compromised:

1. **MongoDB Atlas**: Change password immediately
2. **Google Cloud Console**: Regenerate OAuth secrets
3. **GitHub**: Delete repository if it contains secrets
4. **Hosting platforms**: Update all environment variables

---

**Remember: Security is not optional. Take these steps seriously to protect your application and users.**
