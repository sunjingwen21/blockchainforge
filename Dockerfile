FROM golang:1.22 AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=1 GOOS=linux go build -o chainforge ./cmd/server

FROM ubuntu:20.04
RUN apt-get update && apt-get install -y sqlite3 libsqlite3-dev
WORKDIR /app
COPY --from=builder /app/chainforge .
COPY web ./web
EXPOSE 8080
CMD ["./chainforge"] 
