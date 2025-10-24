require('dotenv').config();
const express = require('express');
const { generateSlug } = require('random-word-slugs');
const { ECSClient, RunTaskCommand } = require('@aws-sdk/client-ecs');

const app = express();

const PORT = process.env.PORT || 9000;
const BASE_DOMAIN = process.env.BASE_DOMAIN || 'localhost';
const PROXY_PORT = process.env.PROXY_PORT || 8000;


const ecsClient = new ECSClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});


const config = {
    CLUSTER: process.env.ECS_CLUSTER_ARN,
    TASK: process.env.ECS_TASK_DEFINITION_ARN,
    SUBNETS: process.env.ECS_SUBNETS.split(','),
    SECURITY_GROUPS: process.env.ECS_SECURITY_GROUPS.split(',')
};

app.use(express.json());

console.log('ENV CHECK:', { BASE_DOMAIN: process.env.BASE_DOMAIN });

app.post('/project', async (req,res) => {

    const { gitURL, slug } = req.body     
    const projectSlug = slug ? slug : generateSlug()

    const command = new RunTaskCommand({
        cluster: config.CLUSTER,
        taskDefinition: config.TASK,
        launchType: 'FARGATE',
        count: 1,
        networkConfiguration: {
            awsvpcConfiguration: {
                assignPublicIp: 'ENABLED',
                subnets: config.SUBNETS,
                securityGroups: config.SECURITY_GROUPS
            }
        },
        overrides: {
            containerOverrides: [
                {
                    name: 'builder-image',
                    environment: [
                        { name: 'GIT_REPOSITORY__URL', value: gitURL },
                        { name: 'PROJECT_ID', value: projectSlug }
                    ]
                }
            ]
        }
    })
    await ecsClient.send(command);
    
    
    const projectURL = `http://${projectSlug}.${BASE_DOMAIN}:${PROXY_PORT}`;
    
    console.log('ENV CHECK:', { BASE_DOMAIN: process.env.BASE_DOMAIN });
    return res.json({ status: 'queued', data: { projectSlug, url: projectURL  } });
})

app.listen(PORT, () =>{
    console.log(`API Server Running..${PORT}`);
})