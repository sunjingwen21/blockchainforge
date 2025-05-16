package machine

import (
        "github.com/aws/constructs-go/constructs/v10"
        "github.com/hashicorp/terraform-cdk-go/cdktf"
		"github.com/gin-gonic/gin"
		"chainforge/internal/logger"
		"github.com/google/uuid"
		"net/http"
		"time"
)

type CreateMachineRequest struct {
	Region string `json:"region"`
	MachineType string `json:"machine_type"`
	ImageName string `json:"image_name"`
	DiskType string `json:"disk_type"`
	DiskSize string `json:"disk_size"`
}

var taskStatusMap = make(map[string]map[string]interface{}) // taskId -> {status, ip, error}

func JudgeCloudType(c *gin.Context) {
	var request CreateMachineRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		logger.Current().Error("Failed to bind JSON: ", err)
		return
	}
	logger.Current().Info("Received create machine request: ", request)

	taskId := uuid.New().String()
	taskStatusMap[taskId] = map[string]interface{}{"status": "pending"}
	c.JSON(http.StatusOK, gin.H{"success": true, "msg": "创建任务已提交", "taskId": taskId})

	go func() {
		var status = map[string]interface{}{"status": "pending"}
		defer func() { taskStatusMap[taskId] = status }()
		// 模拟耗时任务
		time.Sleep(2 * time.Second)
		// 这里根据云类型调用实际创建逻辑
		if request.CloudType == "gcp" {
			ip, err := GcpMachine(&request)
			if err != nil {
				status["status"] = "failed"
				status["error"] = err.Error()
				return
			}
			status["status"] = "done"
			status["ip"] = ip
		} else if request.CloudType == "aws" {
			ip, err := AwsMachine(&request)
			if err != nil {
				status["status"] = "failed"
				status["error"] = err.Error()
				return
			}
			status["status"] = "done"
			status["ip"] = ip
		} else if request.CloudType == "azure" {
			ip, err := AzureMachine(&request)
			if err != nil {
				status["status"] = "failed"
				status["error"] = err.Error()
				return
			}
			status["status"] = "done"
			status["ip"] = ip
		} else {
			status["status"] = "failed"
			status["error"] = "不支持的云类型"
		}
	}()
}

func GcpMachine(request *CreateMachineRequest) (string, error) {
	app := cdktf.NewApp(nil)
	
	gcpProvider := provider.NewGcpProvider(app, "gcp", &provider.GcpProviderConfig{
		Region: cdktf.String(request.Region),
	})

	computeInstance := computeinstance.NewComputeInstance(app, "test-instance", &computeinstance.ComputeInstanceConfig{
		Name:         cdktf.String(request.MachineName),
		MachineType:  cdktf.String(request.MachineType),
		Zone:         cdktf.String(request.Region),
	})
	
	if err != nil {
		logger.Current().Error("Failed to create GCP instance: ", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	cdktf.NewTerraformOutput(app, "instance_ip", &cdktf.TerraformOutputConfig{
		Value: computeInstance.NetworkInterface().Get(0).AccessConfig().Get(0).NatIp(),
	})
	logger.Current().Info("Create GCP instance success, Instance IP: ", computeInstance.NetworkInterface().Get(0).AccessConfig().Get(0).NatIp())
	
	app.Synth()
	
	return computeInstance.NetworkInterface().Get(0).AccessConfig().Get(0).NatIp(), nil
}

func AwsMachine(request *CreateMachineRequest) (string, error) {
	app := cdktf.NewApp(nil)
	
		awsProvider := provider.NewAwsProvider(app, "aws", &provider.AwsProviderConfig{
			Region: cdktf.String(request.Region),
		})
	
		computeInstance := computeinstance.NewComputeInstance(app, "test-instance", &computeinstance.ComputeInstanceConfig{
			Name:         cdktf.String(request.MachineName),
			MachineType:  cdktf.String(request.MachineType),
			Zone:         cdktf.String(request.Region),
		})
	
		if err != nil {
			logger.Current().Error("Failed to create AWS instance: ", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		cdktf.NewTerraformOutput(app, "instance_ip", &cdktf.TerraformOutputConfig{
			Value: computeInstance.NetworkInterface().Get(0).AccessConfig().Get(0).NatIp(),
		})
		logger.Current().Info("Create AWS instance success, Instance IP: ", computeInstance.NetworkInterface().Get(0).AccessConfig().Get(0).NatIp())
	
		app.Synth()
		
	return computeInstance.NetworkInterface().Get(0).AccessConfig().Get(0).NatIp(), nil
}


func AzureMachine(request *CreateMachineRequest) (string, error) {

		app := cdktf.NewApp(nil)
	
		azureProvider := provider.NewAzureProvider(app, "azure", &provider.AzureProviderConfig{
			SubscriptionId: cdktf.String(request.SubscriptionId),
		})
	
		computeInstance := computeinstance.NewComputeInstance(app, "test-instance", &computeinstance.ComputeInstanceConfig{
			Name:         cdktf.String(request.MachineName),
			MachineType:  cdktf.String(request.MachineType),
			Zone:         cdktf.String(request.Region),
		})
	
		if err != nil {
			logger.Current().Error("Failed to create Azure instance: ", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})

			cdktf.NewTerraformOutput(app, "instance_ip", &cdktf.TerraformOutputConfig{
				Value: computeInstance.NetworkInterface().Get(0).AccessConfig().Get(0).NatIp(),
			})
			logger.Current().Info("Create Azure instance success, Instance IP: ", computeInstance.NetworkInterface().Get(0).AccessConfig().Get(0).NatIp())
		
		app.Synth()
	return computeInstance.NetworkInterface().Get(0).AccessConfig().Get(0).NatIp(), nil
}

func TaskStatusHandler(c *gin.Context) {
	taskId := c.Query("id")
	if taskId == "" {
		c.JSON(400, gin.H{"error": "缺少任务ID"})
		return
	}
	status, ok := taskStatusMap[taskId]
	if !ok {
		c.JSON(404, gin.H{"error": "任务不存在"})
		return
	}
	c.JSON(200, status)
}


