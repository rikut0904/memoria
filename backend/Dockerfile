FROM golang:1.27-alpine AS build
WORKDIR /app
RUN apk add --no-cache git
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/bin/server ./cmd/server
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/bin/create-admin ./cmd/create-admin

FROM alpine:3.20
WORKDIR /app
RUN adduser -D appuser
COPY --from=build /app/bin/server /app/server
COPY --from=build /app/bin/create-admin /app/create-admin
COPY --from=build /app/templates /app/templates
USER appuser
EXPOSE 8080
ENTRYPOINT ["/app/server"]
