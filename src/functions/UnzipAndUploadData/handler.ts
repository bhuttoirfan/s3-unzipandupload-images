import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/apiGateway';
import { formatJSONResponse } from '@libs/apiGateway';
import { middyfy } from '@libs/lambda';
import * as AWS from 'aws-sdk';
import * as parser from 'lambda-multipart-parser';
import { PutObjectRequest } from 'aws-sdk/clients/s3';

const unzipAndUploadData: ValidatedEventAPIGatewayProxyEvent<any> = async (event) => {
  try {
    var parsed_body;
    if (event.body) {
      parsed_body = await parser.parse(event);
    }

    if (
      !parsed_body.bucketName ||
      parsed_body.bucketName.trim() === ''
    )
      throw new Error("BAD_REQUEST_ERROR");

    
    const AdmZip = require("adm-zip");

    if (!event.body) throw new Error("BAD_REQUEST_ERROR");
    else {
      const s3 = new AWS.S3({
        endpoint: 'https://s3.amazonaws.com/',
        accessKeyId: event.queryStringParameters.AccessKeyID,
        secretAccessKey: event.queryStringParameters.SecretAccessKey,
      });
      
      const zip = new AdmZip(parsed_body.folder);
      for (const zipEntry of zip.getEntries()) {

          if (zipEntry.name.includes(".jpeg") || zipEntry.name.includes(".png")) {
            
            var params: PutObjectRequest = {
              Bucket: parsed_body.bucketName,
              Key: zipEntry.name,
              Body: zipEntry.getData()
              // Buffer.from(zipEntry.getData().content, 'ascii')
            };
            await s3.putObject(params).promise();
          }
      }

      return {
        statusCode: 201,
        body: JSON.stringify({ message: 'file created' }),
      };
    }
  } catch (error) {
    return formatJSONResponse({
      message: error
    });
  }
}

export const main = middyfy(unzipAndUploadData);
