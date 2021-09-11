import { S3Client, GetObjectCommand, PutObjectCommand, CreateBucketCommand } from '@aws-sdk/client-s3'
import { Readable } from 'stream';

(async () => {

const BUCKET_NAME = 'test'
const OBJECT_NAME = 'sampleObject'
const SAMPLE_CONTENT = 'some sample content'

let client:S3Client = new S3Client({
    endpoint: "http://localhost:9000",
    region: 'us-east-1', 
    credentials: {
        accessKeyId: "minioadmin",
        secretAccessKey: "minioadmin"
    },
    forcePathStyle: true,
    tls: false
})

const bucketRequest = new CreateBucketCommand({
    Bucket: BUCKET_NAME
})

try {
    await client.send(bucketRequest)
} catch(error) {
    const { httpStatusCode, requestId, cfId, extendedRequestId } = error.$metadata;
    if(409 == httpStatusCode) {
        console.log("Bucket already exists")
    } else {
        console.error(error)
    }
}

let putRequest = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: OBJECT_NAME,
    Body: SAMPLE_CONTENT
})

await client.send(putRequest)

let getRequest = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: OBJECT_NAME
})

const { Body } = await client.send(getRequest)
const bodyContent:String = await streamToString(Body as Readable)

console.log("Received: \n\n")
console.log(bodyContent)

// https://github.com/aws/aws-sdk-js-v3/issues/1877
// reading Body in node js (Readable)
async function streamToString (stream: Readable): Promise<string> {
    return await new Promise((resolve, reject) => {
        const chunks: Uint8Array[] = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    });
}

})()
