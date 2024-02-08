FROM node:14-alpine

# Reap zombie processes
ADD https://github.com/Yelp/dumb-init/releases/download/v1.2.0/dumb-init_1.2.0_amd64 /usr/local/bin/dumb-init
RUN chmod +x /usr/local/bin/dumb-init

WORKDIR /app

ARG GITHUB_ACCESS_TOKEN
RUN apk add --no-cache git
RUN git config --global url."https://${GITHUB_ACCESS_TOKEN}:@github.com/".insteadOf "https://github.com/"
ENV GITHUB_ACCESS_TOKEN=${GITHUB_ACCESS_TOKEN}

# gRPC health check
RUN GRPC_HEALTH_PROBE_VERSION=v0.3.1 && \
    wget -qO/bin/grpc_health_probe https://github.com/grpc-ecosystem/grpc-health-probe/releases/download/${GRPC_HEALTH_PROBE_VERSION}/grpc_health_probe-linux-amd64 && \
    chmod +x /bin/grpc_health_probe

# Install app dependencies.
COPY package.json yarn.lock .npmrc tsconfig.json ./
RUN ["yarn", "install", "--frozen-lockfile", "--production"]

# Build
COPY src/ src/
RUN ["yarn", "run", "prepare"]

ENV PORT 50051
EXPOSE $PORT

# Run everything after as non-privileged user.
USER node

ENTRYPOINT ["dumb-init", "--"]
CMD ["yarn", "start"]