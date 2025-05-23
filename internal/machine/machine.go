package machine

import (
	"fmt"
	"github.com/aws/jsii-runtime-go"
	"github.com/hashicorp/terraform-cdk-go/cdktf"
	"github.com/gin-gonic/gin"
	"blockchainforge/internal/logger"
	"github.com/google/uuid"
	"net/http"
	"strconv"
	"time"

	googleprovider "github.com/cdktf/cdktf-provider-google-go/google/v14/provider"
	googleinstance "github.com/cdktf/cdktf-provider-google-go/google/v14/computeinstance"

	awsprovider "github.com/cdktf/cdktf-provider-aws-go/aws/v19/provider"
	awsinstance "github.com/cdktf/cdktf-provider-aws-go/aws/v19/instance"

	azurermprovider "github.com/cdktf/cdktf-provider-azurerm-go/azurerm/v13/provider"
	azurermvm "github.com/cdktf/cdktf-provider-azurerm-go/azurerm/v13/linuxvirtualmachine"
	azurermnic "github.com/cdktf/cdktf-provider-azurerm-go/azurerm/v13/networkinterface"
	azurmpi "github.com/cdktf/cdktf-provider-azurerm-go/azurerm/v13/publicip"
)

type CreateMachineRequest struct {
	CloudType      string `json:"cloudType"`
	Region         string `json:"region"`
	MachineType    string `json:"machineType"`
	ImageName      string `json:"imageName"`
	DiskType       string `json:"diskType"`
	DiskSize       string `json:"diskSize"`
	MachineName    string `json:"machineName"`
	VpcName        string `json:"vpcName"`
	Project        string `json:"project"`
	SubscriptionId string `json:"subscriptionId"`
	AccessKey      string `json:"accessKey"`
	SecretKey      string `json:"secretKey"`
	ClientId       string `json:"clientId"`
	ClientSecret   string `json:"clientSecret"`
	TenantId       string `json:"tenantId"`
}

var taskStatusMap = make(map[string]map[string]interface{}) // taskId -> {status, ip, error}

func parseInt(s string) float64 {
	i, err := strconv.ParseInt(s, 10, 64)
	if err != nil {
		return 0
	}
	return float64(i)
}

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

	gcpProvider := googleprovider.NewGoogleProvider(app, jsii.String("gcp"), &googleprovider.GoogleProviderConfig{
		Region:      jsii.String(request.Region),
		Credentials: jsii.String("/path/to/service-account-key.json"),
	})
	_ = gcpProvider

	instance := googleinstance.NewComputeInstance(app, jsii.String("test-instance"), &googleinstance.ComputeInstanceConfig{
		Name:        jsii.String(request.MachineName),
		MachineType: jsii.String(request.MachineType),
		Zone:        jsii.String(request.Region),
		BootDisk: &googleinstance.ComputeInstanceBootDisk{
			InitializeParams: &googleinstance.ComputeInstanceBootDiskInitializeParams{
				Image: jsii.String(request.ImageName),
			},
		},
		NetworkInterface: []*googleinstance.ComputeInstanceNetworkInterface{
			{
				Network: jsii.String("default"),
				AccessConfig: []*googleinstance.ComputeInstanceNetworkInterfaceAccessConfig{
					{},
				},
			},
		},
	})

	natIp := instance.NetworkInterface().Get(jsii.Number(0)).AccessConfig().Get(jsii.Number(0)).NatIp()
	if natIp == nil {
		return "", fmt.Errorf("failed to get NAT IP")
	}

	cdktf.NewTerraformOutput(app, jsii.String("instance_ip"), &cdktf.TerraformOutputConfig{
		Value: natIp,
	})

	app.Synth()

	return *natIp, nil
}

func AwsMachine(request *CreateMachineRequest) (string, error) {
	app := cdktf.NewApp(nil)

	awsProvider := awsprovider.NewAwsProvider(app, jsii.String("aws"), &awsprovider.AwsProviderConfig{
		Region:    jsii.String(request.Region),
		AccessKey: jsii.String("your-access-key"),
		SecretKey: jsii.String("your-secret-key"),
	})
	_ = awsProvider // 确保被使用

	instance := awsinstance.NewInstance(app, jsii.String("test-instance"), &awsinstance.InstanceConfig{
		Ami:          jsii.String(request.ImageName),
		InstanceType: jsii.String(request.MachineType),
		Tags: &map[string]*string{
			"Name": jsii.String(request.MachineName),
		},
	})

	// 获取 IP 地址（解引用 *string）
	publicIp := instance.PublicIp()
	if publicIp == nil {
		return "", fmt.Errorf("failed to get public IP")
	}

	cdktf.NewTerraformOutput(app, jsii.String("instance_ip"), &cdktf.TerraformOutputConfig{
		Value: publicIp,
	})

	app.Synth()

	return *publicIp, nil
}

func AzureMachine(request *CreateMachineRequest) (string, error) {
	app := cdktf.NewApp(nil)

	// 声明并使用 azureProvider
	azureProvider := azurermprovider.NewAzurermProvider(app, jsii.String("azure"), &azurermprovider.AzurermProviderConfig{
		SubscriptionId: jsii.String(request.SubscriptionId),
		ClientId:       jsii.String("your-client-id"),
		ClientSecret:   jsii.String("your-client-secret"),
		TenantId:       jsii.String("your-tenant-id"),
	})
	_ = azureProvider

	// 创建网络接口
	networkInterface := azurermnic.NewNetworkInterface(app, jsii.String("main"), &azurermnic.NetworkInterfaceConfig{
		Name:              jsii.String("main-nic"),
		Location:          jsii.String(request.Region),
		ResourceGroupName: jsii.String(request.VpcName),
		IpConfiguration: []*azurermnic.NetworkInterfaceIpConfiguration{
			{
				Name:                       jsii.String("internal"),
				SubnetId:                   jsii.String("your-subnet-id"),
				PrivateIpAddressAllocation: jsii.String("Dynamic"),
				PublicIpAddressId:          jsii.String("${azurerm_public_ip.main.id}"),
			},
		},
	})

	// 创建公共 IP
	publicIp := azurmpi.NewPublicIp(app, jsii.String("main"), &azurmpi.PublicIpConfig{
		Name:              jsii.String("main-ip"),
		Location:          jsii.String(request.Region),
		ResourceGroupName: jsii.String(request.VpcName),
		AllocationMethod:  jsii.String("Dynamic"),
	})
	_ = publicIp // 确保被使用

	// 创建虚拟机
	instance := azurermvm.NewLinuxVirtualMachine(app, jsii.String("test-instance"), &azurermvm.LinuxVirtualMachineConfig{
		Name:                jsii.String(request.MachineName),
		ResourceGroupName:   jsii.String(request.VpcName),
		Location:            jsii.String(request.Region),
		Size:                jsii.String(request.MachineType),
		AdminUsername:       jsii.String("adminuser"),
		NetworkInterfaceIds: &[]*string{networkInterface.Id()},
		OsDisk: &azurermvm.LinuxVirtualMachineOsDisk{
			Caching:            jsii.String("ReadWrite"),
			StorageAccountType: jsii.String(request.DiskType),
			DiskSizeGb:         jsii.Number(parseInt(request.DiskSize)),
		},
		SourceImageReference: &azurermvm.LinuxVirtualMachineSourceImageReference{
			Publisher: jsii.String("Canonical"),
			Offer:     jsii.String("UbuntuServer"),
			Sku:       jsii.String("18.04-LTS"),
			Version:   jsii.String("latest"),
		},
	})

	// 获取 IP 地址（解引用 *string）
	publicIpAddress := instance.PublicIpAddress()
	if publicIpAddress == nil {
		return "", fmt.Errorf("failed to get public IP address")
	}

	cdktf.NewTerraformOutput(app, jsii.String("instance_ip"), &cdktf.TerraformOutputConfig{
		Value: publicIpAddress,
	})

	app.Synth()

	return *publicIpAddress, nil
}

func TaskStatusHandler(c *gin.Context) {
	taskId := c.Query("id")
	if taskId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "缺少任务ID"})
		return
	}
	status, ok := taskStatusMap[taskId]
	if !ok {
		c.JSON(http.StatusNotFound, gin.H{"error": "任务不存在"})
		return
	}
	c.JSON(http.StatusOK, status)
}