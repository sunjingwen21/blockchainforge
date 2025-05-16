package logger

import (
	"os"
	"time"

	"github.com/sirupsen/logrus"
	"github.com/spf13/viper"
)

var logger *logrus.Logger

func InitLogger() {
	viper.BindEnv("LOG_LEVEL")
	logger = logrus.New()
	logger.Formatter = &logrus.JSONFormatter{
		FieldMap: logrus.FieldMap{
			logrus.FieldKeyTime:  "timestamp",
			logrus.FieldKeyLevel: "severity",
			logrus.FieldKeyMsg:   "message",
		},
		TimestampFormat: time.RFC3339Nano,
	}
	logger.SetOutput(os.Stdout)

	level := viper.GetString("LOG_LEVEL")
	logLevel, err := logrus.ParseLevel(level)
	if err != nil {
		logLevel = logrus.InfoLevel
	}
	logger.SetLevel(logLevel)
}

func Current() *logrus.Logger {
	return logger
}