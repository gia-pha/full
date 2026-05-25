
FROM golang:1.25-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -v -o auth-server ./...


FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/auth-server .
COPY --from=builder /app/web ./web
EXPOSE 8080
CMD ["./auth-server"]
