FROM golang:1.25-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -v -o auth-server .

FROM scratch
WORKDIR /app
COPY --from=builder /app/auth-server .
EXPOSE 8080
CMD ["./auth-server"]
