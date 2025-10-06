#!/bin/bash

# Nirlipta Yoga Studio - Kubernetes Deployment Script
# For Oracle Cloud Free Tier with K3s

set -e

echo "🧘 Deploying Nirlipta Yoga Studio to Kubernetes..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}❌ kubectl not found. Please install kubectl first.${NC}"
    exit 1
fi

# Check if kubectl can connect to cluster
if ! kubectl cluster-info &> /dev/null; then
    echo -e "${RED}❌ Cannot connect to Kubernetes cluster. Check your kubeconfig.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ kubectl configured and cluster accessible${NC}"
echo ""

# Step 1: Create namespace
echo -e "${YELLOW}📦 Creating namespace...${NC}"
kubectl apply -f base/namespace.yaml

# Step 2: Create secrets and configmaps
echo -e "${YELLOW}🔐 Creating secrets and configmaps...${NC}"
kubectl apply -f base/postgres-secret.yaml
kubectl apply -f base/backend-secret.yaml
kubectl apply -f base/backend-configmap.yaml

# Step 3: Deploy PostgreSQL
echo -e "${YELLOW}🐘 Deploying PostgreSQL...${NC}"
kubectl apply -f base/postgres-statefulset.yaml

echo "Waiting for PostgreSQL to be ready (this may take a few minutes)..."
kubectl wait --for=condition=ready pod -l app=postgres -n nirlipta-yoga --timeout=300s
echo -e "${GREEN}✅ PostgreSQL is ready${NC}"
echo ""

# Step 4: Deploy backend
echo -e "${YELLOW}🚀 Deploying backend...${NC}"
kubectl apply -f base/backend-deployment.yaml

echo "Waiting for backend to be ready..."
kubectl wait --for=condition=ready pod -l app=backend -n nirlipta-yoga --timeout=300s
echo -e "${GREEN}✅ Backend is ready${NC}"
echo ""

# Step 5: Deploy frontend
echo -e "${YELLOW}🎨 Deploying frontend...${NC}"
kubectl apply -f base/frontend-deployment.yaml
kubectl apply -f base/frontend-deployment.yaml

echo "Waiting for frontend to be ready..."
kubectl wait --for=condition=ready pod -l app=frontend -n nirlipta-yoga --timeout=300s
echo -e "${GREEN}✅ Frontend is ready${NC}"
echo ""

# Step 6: Deploy ingress (optional)
read -p "Do you want to deploy Ingress? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}🌐 Deploying Ingress...${NC}"
    kubectl apply -f base/ingress.yaml
    echo -e "${GREEN}✅ Ingress deployed${NC}"
fi

# Show status
echo ""
echo -e "${GREEN}🎉 Deployment complete!${NC}"
echo ""
echo "=== Deployment Status ==="
kubectl get all -n nirlipta-yoga

echo ""
echo "=== Access Information ==="
echo ""
echo "To access your application:"
echo "1. Get the NodePort:"
echo "   kubectl get svc frontend -n nirlipta-yoga"
echo ""
echo "2. Access via:"
echo "   http://<your-oracle-cloud-ip>:<node-port>"
echo ""
echo "3. To make frontend accessible on port 80:"
echo "   kubectl patch svc frontend -n nirlipta-yoga -p '{\"spec\":{\"type\":\"NodePort\",\"ports\":[{\"port\":80,\"nodePort\":30080}]}}'"
echo "   Then access: http://<your-oracle-cloud-ip>:30080"
echo ""
echo "4. View logs:"
echo "   kubectl logs -f deployment/backend -n nirlipta-yoga"
echo "   kubectl logs -f deployment/frontend -n nirlipta-yoga"
echo ""
echo -e "${GREEN}✅ Happy yoga! 🧘${NC}"

