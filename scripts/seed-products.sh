#!/bin/bash

# Seed products via the API gateway (reusable, idempotent).
# Usage:
#   ./scripts/seed-products.sh
#   GATEWAY_URL=http://localhost:3000 ./scripts/seed-products.sh
#
# Env:
#   GATEWAY_URL     Gateway base URL (default http://localhost:3000).
#                   For k3s/Devtron point it at the gateway ingress,
#                   e.g. GATEWAY_URL=https://api.example.com ./scripts/seed-products.sh
#   ADMIN_EMAIL / ADMIN_NAME / ADMIN_PASSWORD   Seed admin account.
#   PROMOTE_VIA     compose (default) | kubectl | none
#     compose: promote via `docker compose exec user-db` (local docker).
#     kubectl: promote via kubectl into the postgres pod (k3s/Devtron).
#     none:    skip promotion (admin role already set / managed DB).
#   K8S_NAMESPACE   Namespace for kubectl mode (default default).
#   K8S_PG_LABEL    Pod label selector for postgres in kubectl mode
#                   (default app=user-db).

set -e

GATEWAY_URL="${GATEWAY_URL:-http://localhost:3000}"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@store.local}"
ADMIN_NAME="${ADMIN_NAME:-Store Admin}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-Admin12345}"
PROMOTE_VIA="${PROMOTE_VIA:-compose}"
K8S_NAMESPACE="${K8S_NAMESPACE:-default}"
K8S_PG_LABEL="${K8S_PG_LABEL:-app=user-db}"

command -v curl >/dev/null || { echo "curl is required"; exit 1; }
command -v jq >/dev/null || { echo "jq is required"; exit 1; }

echo "🌱 Seeding products via $GATEWAY_URL ..."

# 1. Register admin user (already-exists is fine, we log in next).
curl -s -o /dev/null -X POST "$GATEWAY_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"name\":\"$ADMIN_NAME\",\"password\":\"$ADMIN_PASSWORD\"}" || true

# 2. Ensure admin role (register always creates role=user).
case "$PROMOTE_VIA" in
  compose)
    echo "🔑 Promoting $ADMIN_EMAIL to admin (docker compose)..."
    docker compose exec -T user-db psql -U postgres -d microservices_user \
      -c "UPDATE users SET role='admin' WHERE email='$ADMIN_EMAIL';" ;;
  kubectl)
    echo "🔑 Promoting $ADMIN_EMAIL to admin (kubectl)..."
    PG_POD=$(kubectl get pod -n "$K8S_NAMESPACE" -l "$K8S_PG_LABEL" -o jsonpath='{.items[0].metadata.name}')
    kubectl exec -n "$K8S_NAMESPACE" "$PG_POD" -- psql -U postgres -d microservices_user \
      -c "UPDATE users SET role='admin' WHERE email='$ADMIN_EMAIL';" ;;
  none)
    echo "⏭️  Skipping promotion (PROMOTE_VIA=none)." ;;
  *)
    echo "Unknown PROMOTE_VIA=$PROMOTE_VIA (use compose|kubectl|none)"; exit 1 ;;
esac

# 3. Login as admin (role is baked into the JWT, so login AFTER promotion).
TOKEN=$(curl -s -X POST "$GATEWAY_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}" | jq -r '.data.token // empty')
[ -n "$TOKEN" ] || { echo "❌ Admin login failed for $ADMIN_EMAIL"; exit 1; }
echo "✅ Logged in as $ADMIN_EMAIL"

# 4. Existing product names (idempotency: skip what is already there).
EXISTING=$(curl -s "$GATEWAY_URL/api/products?limit=100" | jq -r '.data.products[].name // empty')

seed_product() {
  local name="$1" price="$2" stock="$3" category="$4" description="$5"
  if echo "$EXISTING" | grep -qxF "$name"; then
    echo "⏭️  Exists, skipping: $name"
    return
  fi
  local res
  res=$(curl -s -X POST "$GATEWAY_URL/api/products" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "$(jq -n --arg n "$name" --argjson p "$price" --argjson s "$stock" \
      --arg c "$category" --arg d "$description" \
      '{name:$n,price:$p,stock:$s,category:$c,description:$d}')")
  echo "$res" | jq -e '.success' >/dev/null \
    && echo "✅ Created: $name" \
    || { echo "❌ Failed: $name"; echo "$res" | jq .; exit 1; }
}

seed_product "Wireless Headphones" 129.99 50  electronics "Noise-cancelling over-ear headphones"
seed_product "Coffee Maker"         79.95 30  home        "12-cup drip coffee maker"
seed_product "Running Shoes"        89.99 100 sports      "Lightweight road running shoes"
seed_product "Desk Lamp"            34.50 75  home        "LED desk lamp with dimmer"
seed_product "Bluetooth Speaker"    59.99 40  electronics "Portable waterproof speaker"

echo ""
echo "✅ Seeding complete!"
echo "   API      : $GATEWAY_URL/api/products"
echo "   Storefront : http://localhost:8080 (compose) | admin: $ADMIN_EMAIL"
