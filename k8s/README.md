# Kubernetes Deployment for Nirlipta Yoga Studio

This directory contains Kubernetes manifests for deploying the Nirlipta Yoga Studio application.

## Quick Start

### 1. Prerequisites
- Kubernetes cluster (K3s on Oracle Cloud recommended)
- `kubectl` configured
- Docker images built and pushed to registry

### 2. Configure Secrets

**Edit these files before deploying:**

1. `base/postgres-secret.yaml` - Database credentials
2. `base/backend-secret.yaml` - JWT secret and OAuth credentials
3. `base/backend-configmap.yaml` - Frontend/Backend URLs

### 3. Deploy

**Option A: Using the script (recommended)**
```bash
cd k8s
./deploy.sh
```

**Option B: Manual deployment**
```bash
kubectl apply -f base/namespace.yaml
kubectl apply -f base/postgres-secret.yaml
kubectl apply -f base/backend-secret.yaml
kubectl apply -f base/backend-configmap.yaml
kubectl apply -f base/postgres-statefulset.yaml

# Wait for PostgreSQL
kubectl wait --for=condition=ready pod -l app=postgres -n nirlipta-yoga --timeout=300s

kubectl apply -f base/backend-deployment.yaml
kubectl apply -f base/frontend-deployment.yaml
kubectl apply -f base/ingress.yaml
```

### 4. Expose the Application

**For NodePort (simple):**
```bash
kubectl patch svc frontend -n nirlipta-yoga -p '{"spec":{"type":"NodePort","ports":[{"port":80,"nodePort":30080}]}}'
```

Access at: `http://YOUR_IP:30080`

### 5. Verify Deployment

```bash
kubectl get all -n nirlipta-yoga
kubectl logs -f deployment/backend -n nirlipta-yoga
kubectl logs -f deployment/frontend -n nirlipta-yoga
```

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   Ingress                       │
│              (Traefik/HTTPS)                    │
└────────────────┬────────────────────────────────┘
                 │
         ┌───────┴───────┐
         │               │
    ┌────▼────┐    ┌────▼────┐
    │Frontend │    │Backend  │
    │(Nginx)  │    │ (Go)    │
    │2 replicas│   │2 replicas│
    └─────────┘    └────┬────┘
                        │
                   ┌────▼────┐
                   │PostgreSQL│
                   │StatefulSet│
                   │(Persistent)│
                   └─────────┘
```

## Files

- `namespace.yaml` - Creates nirlipta-yoga namespace
- `postgres-secret.yaml` - Database credentials
- `postgres-statefulset.yaml` - PostgreSQL with persistent storage
- `backend-secret.yaml` - Backend secrets (JWT, OAuth)
- `backend-configmap.yaml` - Backend configuration
- `backend-deployment.yaml` - Backend Go API (2 replicas)
- `frontend-configmap.yaml` - Nginx configuration
- `frontend-deployment.yaml` - Frontend React app (2 replicas)
- `ingress.yaml` - Traefik ingress with HTTPS

## Resource Requirements

**Minimum (All components):**
- CPU: ~600m (0.6 cores)
- Memory: ~2GB

**Recommended:**
- CPU: 2 cores
- Memory: 4GB

**Oracle Cloud Free Tier (4 cores, 24GB RAM) is more than enough!**

## Storage

- PostgreSQL uses 10GB persistent volume
- Oracle Cloud Free Tier includes 200GB

## Detailed Setup

See [ORACLE_CLOUD_SETUP.md](./ORACLE_CLOUD_SETUP.md) for complete Oracle Cloud deployment instructions.

## Maintenance

### Update Application
```bash
# Rebuild images
docker build -t ghcr.io/shashank-srinivasa/nirlipta-backend:latest ./backend
docker push ghcr.io/shashank-srinivasa/nirlipta-backend:latest

# Restart deployment
kubectl rollout restart deployment/backend -n nirlipta-yoga
```

### Scale
```bash
kubectl scale deployment/backend --replicas=3 -n nirlipta-yoga
kubectl scale deployment/frontend --replicas=3 -n nirlipta-yoga
```

### Backup Database
```bash
POD=$(kubectl get pod -n nirlipta-yoga -l app=postgres -o jsonpath='{.items[0].metadata.name}')
kubectl exec $POD -n nirlipta-yoga -- pg_dump -U yoga_user yoga_studio > backup.sql
```

### View Logs
```bash
kubectl logs -f deployment/backend -n nirlipta-yoga
kubectl logs -f deployment/frontend -n nirlipta-yoga
kubectl logs -f statefulset/postgres -n nirlipta-yoga
```

### Monitor Resources
```bash
kubectl top nodes
kubectl top pods -n nirlipta-yoga
```

## Troubleshooting

### Pods not starting
```bash
kubectl describe pod <pod-name> -n nirlipta-yoga
kubectl logs <pod-name> -n nirlipta-yoga
```

### Database issues
```bash
kubectl exec -it statefulset/postgres -n nirlipta-yoga -- psql -U yoga_user -d yoga_studio
```

### Network issues
```bash
kubectl get svc -n nirlipta-yoga
kubectl get ingress -n nirlipta-yoga
kubectl describe ingress nirlipta-ingress -n nirlipta-yoga
```

## Security Notes

1. **Change default passwords** in `postgres-secret.yaml`
2. **Update OAuth credentials** in `backend-secret.yaml`
3. **Use strong JWT secret** in `backend-secret.yaml`
4. **Enable HTTPS** with cert-manager + Let's Encrypt
5. **Restrict network policies** (optional)

## Cost

Oracle Cloud Free Tier:
- ✅ 4 OCPU + 24GB RAM: FREE
- ✅ 200GB Storage: FREE
- ✅ 10TB Outbound Transfer/month: FREE

**Total: $0/month** 🎉

## Support

For Oracle Cloud setup help, see:
- [ORACLE_CLOUD_SETUP.md](./ORACLE_CLOUD_SETUP.md)
- Oracle Cloud Docs: https://docs.oracle.com/en-us/iaas/Content/home.htm

---

**Happy deploying! 🚀🧘**

