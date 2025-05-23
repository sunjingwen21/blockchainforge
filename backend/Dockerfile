FROM golang:1.23-alpine AS builder

RUN apk add --no-cache git gcc musl-dev

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux GOARCH=arm64 go build -v -o main ./cmd/server

FROM alpine:latest


WORKDIR /app

COPY --from=builder /app/main .
COPY --from=builder /app/config.yaml ./config.yaml

RUN mkdir -p /app/data

EXPOSE 8080

CMD ["./main"]