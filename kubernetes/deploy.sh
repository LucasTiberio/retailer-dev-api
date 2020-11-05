#!/usr/bin/env bash

echo "Create namespace"
kubectl --context="$K8S_CLUSTER_ALIAS" apply -f "$ENVIRONMENT/namespace.yml"

echo "Create docker secret"
kubectl --context="$K8S_CLUSTER_ALIAS" delete -f "$ENVIRONMENT/docker-secret.yml"
kubectl --context="$K8S_CLUSTER_ALIAS" apply -f "$ENVIRONMENT/docker-secret.yml"

echo "Createing kubernetes resources files"
cat kustomization.yml.tpl | envsubst > kustomization.yml

echo "Resources to created"
kustomize build

echo "Applying Deploy"
kustomize build  | kubectl --context="$K8S_CLUSTER_ALIAS" apply -f -
