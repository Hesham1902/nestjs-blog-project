import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { UserService } from '../user.service';

@Injectable()
export class UploadService {
  private readonly bucket;
  private readonly s3Client = new S3Client({
    region: this.configService.getOrThrow('AWS_S3_REGION'),
  });
  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    this.bucket = this.configService.getOrThrow('AWS_S3_BUCKET');
  }

  async UploadToS3(file: Express.Multer.File, id) {
    console.log(file);
    // const bucket = this.configService.getOrThrow('AWS_S3_BUCKET');
    const key = `profileImages/${uuidv4()}-${file.originalname}`;
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read', // Optionally, specify the ACL (access control list)
    });
    try {
      const updatedResult = await this.userService.updateOne(id, {
        profileImg: key,
      });

      if (!updatedResult) {
        throw new BadRequestException('Could not update the profile image');
      }
      await this.s3Client.send(command);
      const imageUrl = `https://${this.bucket}.s3.amazonaws.com/${key}`;
      return { imageUrl, result: 'Image uploaded and saved succesfully' };
    } catch (err) {
      console.error('Error uploading file to S3:', err);
      return err;
    }
  }
}
