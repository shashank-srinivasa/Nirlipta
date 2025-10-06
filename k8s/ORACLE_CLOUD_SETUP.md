# Oracle Cloud Free Tier Kubernetes Deployment Guide

Deploy Nirlipta Yoga Studio app on Oracle Cloud Free Tier with K3s.

---

## Prerequisites

1. **Oracle Cloud Account** (Free Tier)
2. **Domain name** (optional, can use IP initially)
3. **GitHub account** (for container registry)

---

## Step 1: Create Oracle Cloud Compute Instance

### 1.1 Create Ampere A1 Instance

1. Log into Oracle Cloud Console
2. Go to **Compute → Instances → Create Instance**
3. Configure:
   - **Name**: `nirlipta-k3s`
   - **Image**: Ubuntu 22.04
   - **Shape**: Ampere A1 (ARM-based)
     - **OCPU**: 4 (max free tier)
     - **Memory**: 24 GB (max free tier)
   - **Networking**:
     - Create new VCN or use existing
     - Assign public IPv4 address
   - **SSH Keys**: Add your public SSH key
4. Click **Create**

### 1.2 Configure Security List / Firewall

1. Go to **Networking → Virtual Cloud Networks**
2. Select your VCN → Security Lists → Default Security List
3. Add **Ingress Rules**:
   ```
   - Source: 0.0.0.0/0, Protocol: TCP, Port: 80 (HTTP)
   - Source: 0.0.0.0/0, Protocol: TCP, Port: 443 (HTTPS)
   - Source: 0.0.0.0/0, Protocol: TCP, Port: 22 (SSH)
   ```

### 1.3 Configure Ubuntu Firewall

SSH into your instance:
```bash
ssh ubuntu@<your-public-ip>

# Allow traffic
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save
```

---

## Step 2: Install K3s

### 2.1 Install K3s on Ubuntu

```bash
# Install K3s (lightweight Kubernetes)
curl -sfL https://get.k3s.io | sh -

# Wait for K3s to be ready
sudo k3s kubectl get nodes

# Copy kubeconfig for regular user
mkdir -p ~/.kube
sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
sudo chown $(id -u):$(id -g) ~/.kube/config
export KUBECONFIG=~/.kube/config

# Verify
kubectl get nodes
```

### 2.2 Install kubectl (if not using k3s kubectl)

```bash
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/arm64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
kubectl version --client
```

---

## Step 3: Build and Push Docker Images

### 3.1 Create GitHub Container Registry Token

1. Go to https://github.com/settings/tokens
2. Generate new token (classic)
3. Select scopes: `write:packages`, `read:packages`, `delete:packages`
4. Copy the token

### 3.2 Login to GitHub Container Registry

```bash
echo "YOUR_GITHUB_TOKEN" | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
```

### 3.3 Clone Repository

```bash
git clone https://github.com/shashank-srinivasa/Nirlipta.git
cd Nirlipta
```

### 3.4 Build and Push Backend

```bash
cd backend
docker build -t ghcr.io/shashank-srinivasa/nirlipta-backend:latest .
docker push ghcr.io/shashank-srinivasa/nirlipta-backend:latest
cd ..
```

### 3.5 Build and Push Frontend

First, update `frontend/.env.production`:
```env
VITE_API_URL=http://YOUR_PUBLIC_IP
```

Or if you have a domain:
```env
VITE_API_URL=https://nirlipta.yourdomain.com
```

Then build:
```bash
cd frontend
docker build -t ghcr.io/shashank-srinivasa/nirlipta-frontend:latest .
docker push ghcr.io/shashank-srinivasa/nirlipta-frontend:latest
cd ..
```

---

## Step 4: Configure Kubernetes Secrets

### 4.1 Update Database Secret

Edit `k8s/base/postgres-secret.yaml`:
```yaml
stringData:
  POSTGRES_USER: yoga_user
  POSTGRES_PASSWORD: YOUR_STRONG_PASSWORD_HERE
  POSTGRES_DB: yoga_studio
  DATABASE_URL: postgresql://yoga_user:YOUR_STRONG_PASSWORD_HERE@postgres:5432/yoga_studio?sslmode=disable
```

### 4.2 Update Backend Secret

Edit `k8s/base/backend-secret.yaml`:
```yaml
stringData:
  JWT_SECRET: YOUR_RANDOM_SECRET_KEY
  GOOGLE_CLIENT_ID: 84200537919-q6p8313tn5qdila060ncotuo4q7ed36p.apps.googleusercontent.com
  GOOGLE_CLIENT_SECRET: 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
  FACEBOOK_CLIENT_ID: your-facebook-client-id
  FACEBOOK_CLIENT_SECRET: your-facebook-client-secret
```

### 4.3 Update Backend ConfigMap

Edit `k8s/base/backend-configmap.yaml`:
```yaml
data:
  PORT: "8080"
  ENV: "production"
  FRONTEND_URL: "http://YOUR_PUBLIC_IP"  # or https://nirlipta.yourdomain.com
  BACKEND_URL: "http://YOUR_PUBLIC_IP"   # or https://nirlipta.yourdomain.com
```

### 4.4 Update Google OAuth Redirect URIs

1. Go to https://console.cloud.google.com/apis/credentials
2. Edit your OAuth 2.0 Client
3. Add Authorized redirect URIs:
   ```
   http://YOUR_PUBLIC_IP/api/v1/auth/google/callback
   https://nirlipta.yourdomain.com/api/v1/auth/google/callback
   ```

---

## Step 5: Deploy to Kubernetes

### 5.1 Apply All Manifests

```bash
# Apply in order
kubectl apply -f k8s/base/namespace.yaml
kubectl apply -f k8s/base/postgres-secret.yaml
kubectl apply -f k8s/base/backend-secret.yaml
kubectl apply -f k8s/base/backend-configmap.yaml
kubectl apply -f k8s/base/postgres-statefulset.yaml

# Wait for PostgreSQL to be ready
kubectl wait --for=condition=ready pod -l app=postgres -n nirlipta-yoga --timeout=300s

# Deploy backend and frontend
kubectl apply -f k8s/base/backend-deployment.yaml
kubectl apply -f k8s/base/frontend-deployment.yaml

# Wait for pods to be ready
kubectl wait --for=condition=ready pod -l app=backend -n nirlipta-yoga --timeout=300s
kubectl wait --for=condition=ready pod -l app=frontend -n nirlipta-yoga --timeout=300s

# Apply ingress (if using domain)
kubectl apply -f k8s/base/ingress.yaml
```

### 5.2 Verify Deployment

```bash
# Check all resources
kubectl get all -n nirlipta-yoga

# Check pod logs
kubectl logs -f deployment/backend -n nirlipta-yoga
kubectl logs -f deployment/frontend -n nirlipta-yoga

# Check services
kubectl get svc -n nirlipta-yoga
```

---

## Step 6: Expose the Application

### Option A: NodePort (Simple, for IP access)

```bash
# Patch frontend service to NodePort
kubectl patch svc frontend -n nirlipta-yoga -p '{"spec":{"type":"NodePort","ports":[{"port":80,"nodePort":30080}]}}'

# Patch backend service to NodePort (for direct API access if needed)
kubectl patch svc backend -n nirlipta-yoga -p '{"spec":{"type":"NodePort","ports":[{"port":8080,"nodePort":30808}]}}'
```

**Access your app:**
- Frontend: `http://YOUR_PUBLIC_IP:30080`
- Backend API: `http://YOUR_PUBLIC_IP:30808`

**Update frontend to use correct backend:**
Rebuild frontend with:
```env
VITE_API_URL=http://YOUR_PUBLIC_IP:30808
```

### Option B: LoadBalancer (Better, but uses Ingress)

K3s comes with Traefik ingress controller. The ingress is already configured!

**If using domain:**
1. Point your domain DNS A record to your Oracle Cloud public IP
2. Access: `http://nirlipta.yourdomain.com`

**If using IP only:**
Update ingress to use IP:
```yaml
# Edit k8s/base/ingress.yaml
# Remove host specification or use nip.io
# e.g., YOUR_IP.nip.io
```

---

## Step 7: Setup HTTPS with Let's Encrypt (Optional)

### 7.1 Install cert-manager

```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Wait for cert-manager to be ready
kubectl wait --for=condition=ready pod -l app=cert-manager -n cert-manager --timeout=180s
```

### 7.2 Create ClusterIssuer

```bash
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: your-email@example.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: traefik
EOF
```

### 7.3 Update Ingress

Edit `k8s/base/ingress.yaml` to use your domain, then:
```bash
kubectl apply -f k8s/base/ingress.yaml
```

Certificate will be automatically provisioned!

---

## Step 8: Promote User to Admin

```bash
# Get PostgreSQL pod name
POD=$(kubectl get pod -n nirlipta-yoga -l app=postgres -o jsonpath='{.items[0].metadata.name}')

# Connect to PostgreSQL
kubectl exec -it $POD -n nirlipta-yoga -- psql -U yoga_user -d yoga_studio

# In psql:
UPDATE users SET role = 'ADMIN' WHERE email = 'your-email@gmail.com';
\q
```

---

## Maintenance Commands

### View Logs
```bash
# Backend
kubectl logs -f deployment/backend -n nirlipta-yoga

# Frontend
kubectl logs -f deployment/frontend -n nirlipta-yoga

# PostgreSQL
kubectl logs -f statefulset/postgres -n nirlipta-yoga
```

### Restart Services
```bash
kubectl rollout restart deployment/backend -n nirlipta-yoga
kubectl rollout restart deployment/frontend -n nirlipta-yoga
```

### Update Application
```bash
# Rebuild and push new images
docker build -t ghcr.io/shashank-srinivasa/nirlipta-backend:latest ./backend
docker push ghcr.io/shashank-srinivasa/nirlipta-backend:latest

# Restart deployment to pull new image
kubectl rollout restart deployment/backend -n nirlipta-yoga
```

### Scale Application
```bash
kubectl scale deployment/backend --replicas=3 -n nirlipta-yoga
kubectl scale deployment/frontend --replicas=3 -n nirlipta-yoga
```

### Backup Database
```bash
POD=$(kubectl get pod -n nirlipta-yoga -l app=postgres -o jsonpath='{.items[0].metadata.name}')
kubectl exec $POD -n nirlipta-yoga -- pg_dump -U yoga_user yoga_studio > backup_$(date +%Y%m%d).sql
```

### Restore Database
```bash
POD=$(kubectl get pod -n nirlipta-yoga -l app=postgres -o jsonpath='{.items[0].metadata.name}')
kubectl exec -i $POD -n nirlipta-yoga -- psql -U yoga_user yoga_studio < backup.sql
```

---

## Monitoring

### Check Resource Usage
```bash
kubectl top nodes
kubectl top pods -n nirlipta-yoga
```

### Check Events
```bash
kubectl get events -n nirlipta-yoga --sort-by='.lastTimestamp'
```

---

## Troubleshooting

### Pods not starting
```bash
kubectl describe pod <pod-name> -n nirlipta-yoga
kubectl logs <pod-name> -n nirlipta-yoga
```

### Database connection issues
```bash
# Test connection from backend pod
kubectl exec -it deployment/backend -n nirlipta-yoga -- sh
# Inside pod:
nc -zv postgres 5432
```

### Ingress not working
```bash
kubectl get ingress -n nirlipta-yoga
kubectl describe ingress nirlipta-ingress -n nirlipta-yoga
kubectl logs -n kube-system -l app.kubernetes.io/name=traefik
```

---

## Cost

**Oracle Cloud Free Tier includes:**
- ✅ 4 OCPU + 24GB RAM Ampere A1 (Always Free)
- ✅ 200GB Block Storage (Always Free)
- ✅ 10TB Outbound Data Transfer/month (Always Free)

**Your deployment uses:**
- 1 Ampere A1 VM: FREE
- ~20GB Storage (PostgreSQL + containers): FREE
- Bandwidth: FREE (within limits)

**Total Cost: $0/month** 🎉

---

## Next Steps

1. ✅ Deploy the app
2. ✅ Test all features
3. ✅ Set up domain and HTTPS
4. ✅ Configure backups
5. 🔜 Add payment integration (Razorpay/PhonePe)

---

**Your Nirlipta Yoga Studio is now running on Oracle Cloud Kubernetes! 🚀**

