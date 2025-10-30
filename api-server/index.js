require('dotenv').config();
const express = require('express');
const { generateSlug } = require('random-word-slugs');
const { ECSClient, RunTaskCommand } = require('@aws-sdk/client-ecs');
const { Server } = require('socket.io')
const Redis = require('ioredis')

const app = express();
const PORT = process.env.PORT || 9000;

const REDIS_URL = process.env.REDIS_URL;
const subscriber = new Redis(REDIS_URL)

const BASE_DOMAIN = process.env.BASE_DOMAIN || 'localhost';
const PROXY_PORT = process.env.PROXY_PORT || 8000;

const io = new Server({ cors: '*' })

io.on('connection', socket => {
    socket.on('subsribe', channel => {
        socket.join(channel)
        socket.emit('message', `Joined ${channel}`)
    })
})

io.listen(9001, () => console.log('Socket Server 9001'))

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

app.post('/project', async (req,res) => {
    const { gitURL, slug } = req.body     
    const projectSlug = slug ? slug : generateSlug();

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
                        { name: 'PROJECT_ID', value: projectSlug },
                        { name: 'S3_BUCKET', value: process.env.S3_BUCKET },
                        { name: 'REDIS_URL', value: process.env.REDIS_URL },
                        { name: 'AWS_REGION', value: process.env.AWS_REGION }
                    ]
                }
            ]
        }
    })
    await ecsClient.send(command);
    
    
    const projectURL = `http://${projectSlug}.${BASE_DOMAIN}:${PROXY_PORT}`;
    
    return res.json({ status: 'queued', data: { projectSlug, url: projectURL  } });
})

async function initRedisSubscribe() {
    console.log('Subscribed to logs...');
    
    subscriber.psubscribe('logs:*')
    subscriber.on('pmessage', (pattern, channel, message) => {
        io.to(channel).emit('message', message);
    })
}

initRedisSubscribe()

app.listen(PORT, () =>{
    console.log(`API Server Running..${PORT}`);
})