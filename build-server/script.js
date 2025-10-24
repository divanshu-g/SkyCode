require('dotenv').config();
const { exec }= require('child_process');
const path = require('path');
const fs = require('fs');
const { PutObjectCommand, S3Client, S3 } =  require('@aws-sdk/client-s3');
const mime = require('mime-types')
const Redis = require('ioredis')


const PROJECT_ID = process.env.PROJECT_ID;
const REGION = process.env.AWS_REGION;
const S3_BUCKET = process.env.S3_BUCKET;
const REDIS_URL = process.env.REDIS_URL;

const publisher = new Redis(REDIS_URL)

function publishLog(log){
    publisher.publish(`logs: ${PROJECT_ID}`, JSON.stringify({ log }));
}

const s3Client = new S3Client({
    region: REGION,
    credentials : {
        accessKeyId : process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey : process.env.AWS_SECRET_ACCESS_KEY
    }
})


async function init(){
    console.log('Execuiting script.js');
    publishLog('Build Started..')
    const outDirPath = path.join(__dirname, 'output');

    const p = exec(`cd ${outDirPath} && npm install && npm run build`);

    p.stdout.on('data', function (data) {
        console.log(data.toString());
        publishLog(data.toString())

    })

    p.stdout.on('error', function(data) {
        console.log('Error', data.toString());
        publishLog(`Error: , ${data.toString()}`)
    })

    p.on('close', async function() {
        console.log('Build Complete');  
        publishLog('Build Complete')

        const distFolderPath = path.join(__dirname, 'output', 'dist');

        const distFolderContents =  fs.readdirSync(distFolderPath, { recursive : true }); 

        publishLog('Starting to upload')
        for(const file of distFolderContents){
            const filePath = path.join(distFolderPath, file);
            if(fs.lstatSync(filePath).isDirectory()) continue;

            console.log('uploading', filePath);
            publishLog(`uploading ${file}`)

            
            const command = new PutObjectCommand({
                Bucket: S3_BUCKET,
                Key: `__output/${PROJECT_ID}/${file}`,
                Body: fs.createReadStream(filePath),
                ContentType: mime.lookup(filePath)
            })

            await s3Client.send(command);

            publishLog(`uploaded ${file}`)
            console.log('uploaded', filePath);
        }
        publishLog("Done...");
        console.log("Done...");
        
    })    
}

init();