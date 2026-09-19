FROM golang:1.22-alpine AS builder
WORKDIR /build
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o main .

FROM alpine:latest
RUN apk --no-cache add ca-certificates && adduser -D app
USER app
WORKDIR /home/app
COPY --from=builder /build/main .
ENV GIN_MODE=release
EXPOSE 8080
CMD ["./main"]
