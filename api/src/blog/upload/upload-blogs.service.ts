import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadBlogsService {
  private readonly bucket;
  private readonly s3Client = new S3Client({
    region: this.configService.getOrThrow('AWS_S3_REGION'),
  });

  constructor(private configService: ConfigService) {
    this.bucket = this.configService.getOrThrow('AWS_S3_BUCKET');
  }

  async UploadToS3(file: Express.Multer.File, key) {
    // const bucket = this.configService.getOrThrow('AWS_S3_BUCKET');
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read', // Optionally, specify the ACL (access control list)
    });
    try {
      await this.s3Client.send(command);
      const imageUrl = `https://${this.bucket}.s3.amazonaws.com/${key}`;
      return { imageUrl, result: 'Image uploaded and saved succesfully' };
    } catch (err) {
      console.error('Error uploading file to S3:', err);
      return err;
    }
  }
}
