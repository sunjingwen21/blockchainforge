FROM golang:1.23 AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=1 GOOS=linux go build -o main ./cmd/server

FROM ubuntu:22.04

WORKDIR /app

COPY --from=builder /app/main .
COPY --from=builder /app/config ./config

RUN mkdir -p /app/data

EXPOSE 8080

CMD ["./main"]