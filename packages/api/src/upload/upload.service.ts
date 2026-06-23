import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  private readonly s3: S3Client;
  private readonly bucket: string;

  constructor(private readonly configService: ConfigService) {
    this.s3 = new S3Client({
      region: configService.get('AWS_REGION', 'us-east-1'),
      endpoint: configService.get('AWS_ENDPOINT'),
      credentials: {
        accessKeyId: configService.get('AWS_ACCESS_KEY_ID', ''),
        secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY', ''),
      },
    });
    this.bucket = configService.get('AWS_BUCKET_NAME', 'ahouzi-storage');
  }

  async uploadFile(file: Express.Multer.File, folder = 'uploads'): Promise<string> {
    const ext = file.originalname.split('.').pop();
    const key = `${folder}/${uuidv4()}.${ext}`;
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );
    return `https://${this.bucket}.s3.amazonaws.com/${key}`;
  }

  async getPresignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new PutObjectCommand({ Bucket: this.bucket, Key: key });
    return getSignedUrl(this.s3, command, { expiresIn });
  }
}
