import { BadRequestException, Body, Controller, Get, Post, Res, StreamableFile, UploadedFiles, UseInterceptors, ValidationPipe } from '@nestjs/common';
import { AppService } from './app.service';
import {Response} from 'express';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { SendFileDto } from './dto/sendFile.dto';
const pdfkit = require('pdfkit');
const PDFDocument = require('./utils/pdfTable');
const fs = require('fs');

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('/send-file')
  @UseInterceptors(AnyFilesInterceptor())
  async createAndSendFile(
      @UploadedFiles() image,
      @Body(ValidationPipe) sendFile: SendFileDto
  ) {
    if(!image[0]){
      throw new BadRequestException('Image not found')
    }
    let result = await this.appService.getBoard(sendFile.board);
    return await this.appService.createAndSendPdf(result, sendFile, image)
  }

}
