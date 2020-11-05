namespace: ${BUILD_REPOSITORY_NAME}-${ENVIRONMENT}

commonLabels:
    app: "${BUILD_REPOSITORY_NAME}-${ENVIRONMENT}"

commonAnnotations:
    plugone.io/build-id: "${BUILD_BUILDID}"
    plugone.io/build-tag: "${BUILD_BUILDNUMBER}"    

resources:
    - ${ENVIRONMENT}

nameSuffix:
    -${ENVIRONMENT}

images:
    - name: ${BUILD_REPOSITORY_NAME}
      newName: ${DOCKER_REPOSITORY}/${BUILD_REPOSITORY_NAME}
      newTag: latest-aws
