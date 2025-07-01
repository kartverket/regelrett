# syntax=docker/dockerfile:1

ARG BASE_IMAGE=eclipse-temurin:21-jre-alpine
ARG JS_IMAGE=node:22-alpine
ARG JS_PLATFORM=linux/amd64
ARG KOTLIN_IMAGE=eclipse-temurin:21

ARG KOTLIN_SRC=kt-builder
ARG JS_SRC=js-builder

FROM --platform=${JS_PLATFORM} ${JS_IMAGE} AS js-builder

WORKDIR /tmp
COPY conf conf

WORKDIR /tmp/frontend/beCompliant
COPY frontend/beCompliant .

RUN npm ci
ENV NODE_ENV=production
RUN npm run build:prod

FROM ${KOTLIN_IMAGE} as kt-builder

WORKDIR /tmp
COPY conf conf

WORKDIR /tmp/regelrett

COPY backend/ .

RUN ./gradlew shadowJar

FROM ${KOTLIN_SRC} as kt-src
FROM ${JS_SRC} as js-src

FROM ${BASE_IMAGE}

LABEL maintainer="Bekk Consulting"
LABEL org.opencontainers.image.source="https://github.com/bekk/regelrett"

ARG RR_UID="472"
ARG RR_GID="0"

ENV RR_PATHS_PROVISIONING="/etc/regelrett/provisioning" \
    RR_PATHS_CONFIG="/etc/regelrett/regelrett.yaml" \
    RR_PATHS_HOME="/usr/share/regelrett" \
    RR_PATHS_JAR="/app/regelrett.jar"

WORKDIR $RR_PATHS_HOME

COPY --from=kt-src /tmp/conf conf
COPY --from=kt-src /tmp/regelrett/build/libs/*.jar ${RR_PATHS_JAR}

RUN if [ ! $(getent group "$RR_GID") ]; then \
    if grep -i -q alpine /etc/issue; then \
    addgroup -S -g $RR_GID regelrett; \
    elif grep -i -q ubuntu /etc/issue; then \
    DEBIAN_FRONTEND=noninteractive && \
    addgroup --system --gid $RR_GID regelrett; \
    else \
    echo 'ERROR: Unsupported base image' && /bin/false; \
    fi; \
    fi && \
    RR_GID_NAME=$(getent group $RR_GID | cut -d':' -f1) && \
    if grep -i -q alpine /etc/issue; then \
    adduser -S -u $RR_UID -G "$RR_GID_NAME" regelrett; \
    else \
    adduser --system --uid $RR_UID --ingroup "$RR_GID_NAME" regelrett; \
    fi && \
    mkdir -p "$RR_PATHS_PROVISIONING/schemasources" && \
    cp conf/provisioning/schemasources/sample.yaml "$RR_PATHS_PROVISIONING/schemasources/" && \
    cp conf/sample.yaml "$RR_PATHS_CONFIG" && \
    chown -R "regelrett:$RR_GID_NAME" "$RR_PATHS_HOME" "$RR_PATHS_PROVISIONING" "$RR_PATHS_JAR" && \
    chmod -R 777 "$RR_PATHS_PROVISIONING"

ENV JAVA_HOME=/opt/java/openjdk
ENV PATH "${JAVA_HOME}/bin:${PATH}"

COPY --from=kt-src /tmp/regelrett/build/libs/*.jar ./app/regelrett.jar
COPY --from=js-src /tmp/frontend/beCompliant/dist ./frontend/beCompliant/dist

EXPOSE 3000

USER "$RR_UID"
ENTRYPOINT java -Duser.timezone=Europe/Oslo -jar /app/regelrett.jar --homepath=$RR_PATHS_HOME --config=$RR_PATHS_CONFIG

